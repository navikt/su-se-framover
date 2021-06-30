import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ApiError, ErrorMessage } from '~api/apiClient';
import { Revurderingshandling } from '~api/revurderingApi';
import * as RevurderingActions from '~features/revurdering/revurderingActions';
import Revurderingoppsummering from '~features/revurdering/revurderingoppsummering/Revurderingoppsummering';
import RevurderingskallFeilet, {
    feilkodeTilFeilmelding,
} from '~features/revurdering/revurderingskallFeilet/RevurderingskallFeilet';
import revurderingsfeilMessages from '~features/revurdering/revurderingskallFeilet/revurderingskallFeilet-nb';
import {
    erBeregnetIngenEndring,
    erForhåndsvarslingBesluttet,
    erGregulering,
    erIngenForhåndsvarsel,
    erRevurderingForhåndsvarslet,
    erRevurderingSimulert,
    erRevurderingUnderkjent,
} from '~features/revurdering/revurderingUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator, useI18n, useAsyncActionCreatorWithArgsTransformer } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch } from '~redux/Store';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    BeregnetIngenEndring,
    BeslutningEtterForhåndsvarsling,
    Revurdering,
    SimulertRevurdering,
    UnderkjentRevurdering,
} from '~types/Revurdering';

import sharedStyles from '../revurdering.module.less';

import {
    ResultatEtterForhåndsvarselform,
    SendTilAttesteringForm,
    VelgForhåndsvarselForm,
} from './oppsummeringPageForms/OppsummeringPageForms';
import messages from './revurderingOppsummeringPage-nb';
import styles from './revurderingOppsummeringPage.module.less';

const OppsummeringshandlingForm = (props: {
    sakId: string;
    forrigeUrl: string;
    førsteRevurderingstegUrl: string;
    revurdering: SimulertRevurdering | BeregnetIngenEndring | UnderkjentRevurdering;
    feilmeldinger: ErrorMessage[];
}) => {
    const history = useHistory();
    const { intl } = useI18n({ messages: { ...messages, ...revurderingsfeilMessages } });
    const feilRef = React.useRef<HTMLDivElement>(null);

    const [sendTilAttesteringState, sendTilAttestering] = useAsyncActionCreatorWithArgsTransformer(
        RevurderingActions.sendRevurderingTilAttestering,
        (args: { vedtaksbrevtekst: string; skalFøreTilBrevutsending: boolean }) => {
            if (props.feilmeldinger.length > 0) {
                feilRef.current?.focus();
                return;
            }
            return {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                fritekstTilBrev: args.vedtaksbrevtekst,
                skalFøreTilBrevutsending: args.skalFøreTilBrevutsending,
            };
        },
        () => {
            history.push(
                Routes.createSakIntroLocation(
                    intl.formatMessage({ id: 'notification.sendtTilAttestering' }),
                    props.sakId
                )
            );
        }
    );

    const [forhåndsvarsleEllerSendTilAttesteringState, forhåndsvarsleEllerSendTilAttestering] =
        useAsyncActionCreatorWithArgsTransformer(
            RevurderingActions.forhåndsvarsleEllerSendTilAttestering,
            (args: { revurderingshandling: Revurderingshandling; brevtekst: string }) => {
                if (props.feilmeldinger.length > 0) {
                    feilRef.current?.focus();
                    return;
                }
                return {
                    sakId: props.sakId,
                    revurderingId: props.revurdering.id,
                    revurderingshandling: args.revurderingshandling,
                    fritekstTilBrev: args.brevtekst,
                };
            },
            (args) => {
                if (args.revurderingshandling === Revurderingshandling.Forhåndsvarsle) {
                    history.push(
                        Routes.createSakIntroLocation(
                            intl.formatMessage({ id: 'notification.sendtForhåndsvarsel' }),
                            props.sakId
                        )
                    );
                } else {
                    history.push(
                        Routes.createSakIntroLocation(
                            intl.formatMessage({ id: 'notification.sendtTilAttestering' }),
                            props.sakId
                        )
                    );
                }
            }
        );

    const [fortsettEtterForhåndsvarselState, fortsettEtterForhåndsvarsel] = useAsyncActionCreatorWithArgsTransformer(
        RevurderingActions.fortsettEtterForhåndsvarsel,
        (args: {
            beslutningEtterForhåndsvarsel: BeslutningEtterForhåndsvarsling;
            brevtekst: string;
            begrunnelse: string;
        }) => {
            if (props.feilmeldinger.length > 0) {
                feilRef.current?.focus();
                return;
            }
            return {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                begrunnelse: args.begrunnelse,
                valg: args.beslutningEtterForhåndsvarsel,
                fritekstTilBrev: args.brevtekst,
            };
        },
        (args) => {
            if (args.beslutningEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.FortsettMedAndreOpplysninger) {
                history.push(props.førsteRevurderingstegUrl);
            } else {
                history.push(
                    Routes.createSakIntroLocation(
                        intl.formatMessage({ id: 'notification.sendtTilAttestering' }),
                        props.sakId
                    )
                );
            }
        }
    );

    return (
        <div>
            {props.feilmeldinger.length > 0 && (
                <div ref={feilRef} tabIndex={-1} aria-live="polite" aria-atomic="true" className={styles.alertstripe}>
                    <AlertStripeFeil>
                        <ul>
                            {props.feilmeldinger.map((f) => (
                                <li key={f.message}>{feilkodeTilFeilmelding(intl, f)}</li>
                            ))}
                        </ul>
                    </AlertStripeFeil>
                </div>
            )}
            {erGregulering(props.revurdering.årsak) ? (
                <SendTilAttesteringForm
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    forrigeUrl={props.forrigeUrl}
                    brevsending="aldriSende"
                    submitStatus={sendTilAttesteringState}
                    onSubmit={(args) =>
                        sendTilAttestering({ vedtaksbrevtekst: args.fritekstTilBrev, skalFøreTilBrevutsending: false })
                    }
                />
            ) : erBeregnetIngenEndring(props.revurdering) ? (
                <SendTilAttesteringForm
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    forrigeUrl={props.forrigeUrl}
                    brevsending="kanVelge"
                    submitStatus={sendTilAttesteringState}
                    onSubmit={(args) =>
                        sendTilAttestering({
                            vedtaksbrevtekst: args.fritekstTilBrev,
                            skalFøreTilBrevutsending: args.skalFøreTilBrevutsending,
                        })
                    }
                />
            ) : erRevurderingUnderkjent(props.revurdering) ? (
                <SendTilAttesteringForm
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    forrigeUrl={props.forrigeUrl}
                    brevsending="alltidSende"
                    submitStatus={sendTilAttesteringState}
                    onSubmit={(args) =>
                        sendTilAttestering({ vedtaksbrevtekst: args.fritekstTilBrev, skalFøreTilBrevutsending: true })
                    }
                />
            ) : !erRevurderingForhåndsvarslet(props.revurdering) ? (
                <VelgForhåndsvarselForm
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    forrigeUrl={props.forrigeUrl}
                    submitStatus={forhåndsvarsleEllerSendTilAttesteringState}
                    onSubmit={(args) =>
                        forhåndsvarsleEllerSendTilAttestering({
                            brevtekst: args.fritekstTilBrev,
                            revurderingshandling: args.revurderingshandling,
                        })
                    }
                />
            ) : erForhåndsvarslingBesluttet(props.revurdering) || erIngenForhåndsvarsel(props.revurdering) ? (
                <SendTilAttesteringForm
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    forrigeUrl={props.forrigeUrl}
                    brevsending="alltidSende"
                    submitStatus={sendTilAttesteringState}
                    onSubmit={(args) =>
                        sendTilAttestering({
                            vedtaksbrevtekst: args.fritekstTilBrev,
                            skalFøreTilBrevutsending: true,
                        })
                    }
                />
            ) : (
                <ResultatEtterForhåndsvarselform
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    forrigeUrl={props.forrigeUrl}
                    submitStatus={fortsettEtterForhåndsvarselState}
                    onSubmit={(args) =>
                        fortsettEtterForhåndsvarsel({
                            beslutningEtterForhåndsvarsel: args.resultatEtterForhåndsvarsel,
                            brevtekst: args.tekstTilVedtaksbrev,
                            begrunnelse: args.begrunnelse,
                        })
                    }
                />
            )}
        </div>
    );
};

const RevurderingOppsummeringPage = (props: {
    sakId: string;
    forrigeUrl: string;
    førsteRevurderingstegUrl: string;
    revurdering: Revurdering;
    grunnlagsdataOgVilkårsvurderinger: RemoteData.RemoteData<ApiError, GrunnlagsdataOgVilkårsvurderinger>;
}) => {
    const dispatch = useAppDispatch();
    const { intl } = useI18n({ messages });

    React.useEffect(() => {
        if (RemoteData.isInitial(props.grunnlagsdataOgVilkårsvurderinger)) {
            dispatch(
                RevurderingActions.hentGjeldendeGrunnlagsdataOgVilkårsvurderinger({
                    sakId: props.sakId,
                    revurderingId: props.revurdering.id,
                })
            );
        }
    }, [props.grunnlagsdataOgVilkårsvurderinger._tag]);

    const [beregnOgSimulerStatus, beregnOgSimuler] = useAsyncActionCreator(RevurderingActions.beregnOgSimuler);

    React.useEffect(() => {
        beregnOgSimuler({
            sakId: props.sakId,
            periode: props.revurdering.periode,
            revurderingId: props.revurdering.id,
        });
    }, [props.revurdering.id]);

    return (
        <div className={sharedStyles.revurderingContainer}>
            <div className={styles.container}>
                {pipe(
                    RemoteData.combine(beregnOgSimulerStatus, props.grunnlagsdataOgVilkårsvurderinger),
                    RemoteData.fold(
                        () => <NavFrontendSpinner>{intl.formatMessage({ id: 'beregner.label' })}</NavFrontendSpinner>,
                        () => <NavFrontendSpinner>{intl.formatMessage({ id: 'beregner.label' })}</NavFrontendSpinner>,
                        (err) => <RevurderingskallFeilet error={err} />,
                        ([beregning, grunnlagsdataOgVilkårsvurderinger]) => (
                            <div className={styles.content}>
                                <Revurderingoppsummering
                                    revurdering={props.revurdering}
                                    grunnlagsdataOgVilkårsvurderinger={grunnlagsdataOgVilkårsvurderinger}
                                />
                                {erRevurderingSimulert(props.revurdering) ||
                                erBeregnetIngenEndring(props.revurdering) ||
                                erRevurderingUnderkjent(props.revurdering) ? (
                                    <OppsummeringshandlingForm
                                        sakId={props.sakId}
                                        forrigeUrl={props.forrigeUrl}
                                        førsteRevurderingstegUrl={props.førsteRevurderingstegUrl}
                                        revurdering={props.revurdering}
                                        feilmeldinger={beregning.feilmeldinger}
                                    />
                                ) : (
                                    <div>{intl.formatMessage({ id: 'feil.revurderingIUgyldigTilstand' })}</div>
                                )}
                            </div>
                        )
                    )
                )}
            </div>
        </div>
    );
};

export default RevurderingOppsummeringPage;
