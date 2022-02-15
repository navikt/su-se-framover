import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { ApiError, ErrorMessage } from '~api/apiClient';
import { Forhåndsvarselhandling } from '~api/revurderingApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import apiErrorMessages from '~components/apiErrorAlert/ApiErrorAlert-nb';
import { ApiErrorCode } from '~components/apiErrorAlert/apiErrorCode';
import Revurderingoppsummering from '~components/revurdering/oppsummering/Revurderingoppsummering';
import * as RevurderingActions from '~features/revurdering/revurderingActions';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator, useAsyncActionCreatorWithArgsTransformer } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch } from '~redux/Store';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    BeregnetIngenEndring,
    BeslutningEtterForhåndsvarsling,
    InformasjonsRevurdering,
    SimulertRevurdering,
    UnderkjentRevurdering,
} from '~types/Revurdering';
import {
    erBeregnetIngenEndring,
    erForhåndsvarslingBesluttet,
    erGregulering,
    erIngenForhåndsvarsel,
    erRevurderingForhåndsvarslet,
    erRevurderingSimulert,
    erRevurderingUnderkjent,
} from '~utils/revurdering/revurderingUtils';

import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import {
    ResultatEtterForhåndsvarselform,
    SendTilAttesteringForm,
    TilbakekrevingForm,
    Tilbakekrevingsbehandling,
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
    varselmeldinger: ErrorMessage[];
}) => {
    const history = useHistory();
    const { formatMessage } = useI18n({ messages: { ...messages, ...apiErrorMessages } });
    const feilRef = React.useRef<HTMLDivElement>(null);
    const [aktsomhetValgt, setAktsomhetValgt] = useState(false);

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
            history.push(Routes.createSakIntroLocation(formatMessage('notification.sendtTilAttestering'), props.sakId));
        }
    );

    const [lagreForhåndsvarselState, lagreForhåndsvarsel] = useAsyncActionCreatorWithArgsTransformer(
        RevurderingActions.lagreForhåndsvarsel,
        (args: { forhåndsvarselhandling: Forhåndsvarselhandling; brevtekst: string }) => {
            if (props.feilmeldinger.length > 0) {
                feilRef.current?.focus();
                return;
            }
            return {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                forhåndsvarselhandling: args.forhåndsvarselhandling,
                fritekstTilBrev: args.brevtekst,
            };
        },
        (args) => {
            switch (args.forhåndsvarselhandling) {
                case Forhåndsvarselhandling.Forhåndsvarsle:
                    history.push(
                        Routes.createSakIntroLocation(formatMessage('notification.sendtForhåndsvarsel'), props.sakId)
                    );
                    return;
                case Forhåndsvarselhandling.IngenForhåndsvarsel:
                    sendTilAttestering({
                        vedtaksbrevtekst: args.brevtekst,
                        skalFøreTilBrevutsending: true,
                    });
                    return;
            }
        }
    );

    const [lagreTilbakekrevingsbehandlingState, lagreTilbakekrevingsbehandling] =
        useAsyncActionCreatorWithArgsTransformer(
            RevurderingActions.lagreTilbakekrevingsbehandling,
            (args: { tilbakekrevingsbehandling: Tilbakekrevingsbehandling }) => {
                if (props.feilmeldinger.length > 0) {
                    feilRef.current?.focus();
                    return;
                }
                return {
                    sakId: props.sakId,
                    revurderingId: props.revurdering.id,
                    tilbakekrevingsbehandling: args.tilbakekrevingsbehandling,
                };
            },
            () => setAktsomhetValgt(true)
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
            switch (args.beslutningEtterForhåndsvarsel) {
                case BeslutningEtterForhåndsvarsling.FortsettMedAndreOpplysninger:
                    history.push(props.førsteRevurderingstegUrl);
                    break;
                case BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger:
                    history.push(
                        Routes.createSakIntroLocation(formatMessage('notification.sendtTilAttestering'), props.sakId)
                    );
                    break;
                case BeslutningEtterForhåndsvarsling.AvsluttUtenEndringer:
                    history.push(
                        Routes.createSakIntroLocation(formatMessage('notification.avsluttetRevurdering'), props.sakId)
                    );
            }
        }
    );

    return (
        <div>
            {props.varselmeldinger.length > 0 && (
                <Alert variant="info" className={styles.alertstripe}>
                    <ul>
                        {props.varselmeldinger.map((m) => (
                            <li key={m.code}>{formatMessage(m.code ?? ApiErrorCode.UKJENT_FEIL)}</li>
                        ))}
                    </ul>
                </Alert>
            )}
            {props.feilmeldinger.length > 0 && (
                <div ref={feilRef} tabIndex={-1} aria-live="polite" aria-atomic="true" className={styles.alertstripe}>
                    <UtfallSomIkkeStøttes feilmeldinger={props.feilmeldinger} />
                </div>
            )}
            {erGregulering(props.revurdering.årsak) ? (
                <SendTilAttesteringForm
                    revurdering={props.revurdering}
                    forrigeUrl={props.forrigeUrl}
                    brevsending="aldriSende"
                    submitStatus={sendTilAttesteringState}
                    onSubmit={(args) =>
                        sendTilAttestering({ vedtaksbrevtekst: args.fritekstTilBrev, skalFøreTilBrevutsending: false })
                    }
                />
            ) : erBeregnetIngenEndring(props.revurdering) ? (
                <SendTilAttesteringForm
                    revurdering={props.revurdering}
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
                    revurdering={props.revurdering}
                    forrigeUrl={props.forrigeUrl}
                    brevsending="alltidSende"
                    submitStatus={sendTilAttesteringState}
                    onSubmit={(args) =>
                        sendTilAttestering({ vedtaksbrevtekst: args.fritekstTilBrev, skalFøreTilBrevutsending: true })
                    }
                />
            ) : props.revurdering.tilbakekrevingsbehandling != null && !aktsomhetValgt ? (
                <TilbakekrevingForm
                    revurdering={props.revurdering}
                    onSubmit={(args) =>
                        lagreTilbakekrevingsbehandling({
                            tilbakekrevingsbehandling: args.tilbakekrevingsbehandling,
                        })
                    }
                    forrigeUrl={props.forrigeUrl}
                    submitStatus={lagreTilbakekrevingsbehandlingState}
                />
            ) : !erRevurderingForhåndsvarslet(props.revurdering) ? (
                <VelgForhåndsvarselForm
                    sakId={props.sakId}
                    revurdering={props.revurdering}
                    forrigeUrl={props.revurdering.tilbakekrevingsbehandling != null ? undefined : props.forrigeUrl}
                    onForrigeClick={
                        props.revurdering.tilbakekrevingsbehandling != null ? () => setAktsomhetValgt(false) : undefined
                    }
                    submitStatus={
                        RemoteData.isInitial(sendTilAttesteringState)
                            ? lagreForhåndsvarselState
                            : RemoteData.combine(lagreForhåndsvarselState, sendTilAttesteringState)
                    }
                    onSubmit={(args) =>
                        lagreForhåndsvarsel({
                            brevtekst: args.fritekstTilBrev,
                            forhåndsvarselhandling: args.forhåndsvarselhandling,
                        })
                    }
                />
            ) : erForhåndsvarslingBesluttet(props.revurdering) || erIngenForhåndsvarsel(props.revurdering) ? (
                <SendTilAttesteringForm
                    revurdering={props.revurdering}
                    forrigeUrl={props.forrigeUrl}
                    brevsending="alltidSende"
                    submitStatus={sendTilAttesteringState}
                    onSubmit={(args) =>
                        sendTilAttestering({ vedtaksbrevtekst: args.fritekstTilBrev, skalFøreTilBrevutsending: true })
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
                            brevtekst: args.brevTekst,
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
    revurdering: InformasjonsRevurdering;
    grunnlagsdataOgVilkårsvurderinger: RemoteData.RemoteData<ApiError, GrunnlagsdataOgVilkårsvurderinger>;
}) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const { formatMessage } = useI18n({ messages });

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

    return pipe(
        RemoteData.combine(beregnOgSimulerStatus, props.grunnlagsdataOgVilkårsvurderinger),
        RemoteData.fold(
            () => <Loader title={formatMessage('beregner.label')} />,
            () => <Loader title={formatMessage('beregner.label')} />,
            (err) => (
                <div className={styles.content}>
                    <ApiErrorAlert error={err} />
                    <Button variant="secondary" onClick={() => history.push(props.forrigeUrl)}>
                        {formatMessage('knapp.tilbake')}
                    </Button>
                </div>
            ),
            ([beregning, grunnlagsdataOgVilkårsvurderinger]) => (
                <div className={styles.content}>
                    <Revurderingoppsummering
                        revurdering={props.revurdering}
                        forrigeGrunnlagsdataOgVilkårsvurderinger={grunnlagsdataOgVilkårsvurderinger}
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
                            varselmeldinger={beregning.varselmeldinger}
                        />
                    ) : (
                        <div>{formatMessage('feil.revurderingIUgyldigTilstand')}</div>
                    )}
                </div>
            )
        )
    );
};

export default RevurderingOppsummeringPage;
