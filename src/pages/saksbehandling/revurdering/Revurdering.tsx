import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Heading, Loader } from '@navikt/ds-react';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Framdriftsindikator, { Linjestatus } from '~components/framdriftsindikator/Framdriftsindikator';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InformasjonsRevurdering, Vurderingstatus } from '~types/Revurdering';
import { Utbetalingsperiode } from '~types/Utbetalingsperiode';
import {
    revurderingstegrekkefølge,
    revurderingstegTilInformasjonSomRevurderes,
} from '~utils/revurdering/revurderingUtils';

import SkjemaelementFeilmelding from '../../../components/formElements/SkjemaelementFeilmelding';
import { RevurderingSteg } from '../types';

import Formue from './formue/Formue';
import messages, { stegmessages } from './revurdering-nb';
import styles from './revurdering.module.less';

const UtenlandsoppholdPage = React.lazy(() => import('./utenlandsopphold/Utenlandsopphold'));
const EndreRevurderingPage = React.lazy(() => import('./revurderingIntro/EndreRevurderingPage'));
const Bosituasjon = React.lazy(() => import('./bosituasjon/BosituasjonForm'));
const EndringAvFradrag = React.lazy(() => import('./endringAvFradrag/EndringAvFradrag'));
const RevurderingOppsummeringPage = React.lazy(() => import('./OppsummeringPage/RevurderingOppsummeringPage'));
const Uførhet = React.lazy(() => import('./uførhet/Uførhet'));

const RevurderingPage = (props: {
    sakId: string;
    utbetalinger: Utbetalingsperiode[];
    informasjonsRevurderinger: InformasjonsRevurdering[];
}) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages, ...stegmessages } });

    const urlParams = Routes.useRouteParams<typeof Routes.revurderValgtRevurdering>();

    const påbegyntRevurdering = props.informasjonsRevurderinger.find((r) => r.id === urlParams.revurderingId);

    const dispatch = useAppDispatch();
    const grunnlag = useAppSelector(
        (s) => s.sak.revurderingGrunnlagSimulering[påbegyntRevurdering?.id ?? ''] ?? RemoteData.initial
    );

    React.useEffect(() => {
        if (RemoteData.isInitial(grunnlag) && påbegyntRevurdering) {
            dispatch(
                revurderingActions.hentGjeldendeGrunnlagsdataOgVilkårsvurderinger({
                    sakId: props.sakId,
                    revurderingId: påbegyntRevurdering.id,
                })
            );
        }
    }, [grunnlag._tag, påbegyntRevurdering?.id]);

    const createRevurderingsPath = (steg: RevurderingSteg) => {
        return Routes.revurderValgtRevurdering.createURL({
            sakId: props.sakId,
            steg: steg,
            revurderingId: urlParams.revurderingId,
        });
    };

    if (props.utbetalinger.length === 0) {
        return (
            <div className={styles.revurderingContainer}>
                <Heading level="1" size="xlarge" className={styles.tittel}>
                    {formatMessage('revurdering.tittel')}
                </Heading>
                <div className={styles.mainContentContainer}>
                    <div>
                        <SkjemaelementFeilmelding className={styles.feilmelding}>
                            {formatMessage('feil.kanIkkeRevurdere')}
                        </SkjemaelementFeilmelding>
                    </div>
                    <div className={styles.knappContainer}>
                        <LinkAsButton
                            variant="secondary"
                            href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                        >
                            {formatMessage('knapp.avslutt')}
                        </LinkAsButton>
                    </div>
                </div>
            </div>
        );
    }

    const alleSteg = revurderingstegrekkefølge.map((steg) => ({
        id: steg,
        label: formatMessage(steg),
        erKlikkbar: false,
        status: Linjestatus.Ingenting,
        url: createRevurderingsPath(steg),
    }));

    const aktiveSteg = (revurdering: InformasjonsRevurdering) =>
        pipe(
            alleSteg,
            A.filterMap((steg) =>
                pipe(
                    O.fromNullable(revurderingstegTilInformasjonSomRevurderes(steg.id)),
                    O.chainNullableK((i) => revurdering?.informasjonSomRevurderes[i]),
                    O.map((vurderingstatus) => ({
                        ...steg,
                        status:
                            vurderingstatus === Vurderingstatus.IkkeVurdert ? Linjestatus.Ingenting : Linjestatus.Ok,
                    }))
                )
            )
        );

    return (
        <div className={styles.pageContainer}>
            <Switch>
                <Route
                    path={Routes.revurderValgtSak.createURL({
                        sakId: props.sakId,
                    })}
                >
                    <EndreRevurderingPage
                        sakId={props.sakId}
                        utbetalinger={props.utbetalinger}
                        informasjonsRevurdering={null}
                    />
                </Route>
                {!påbegyntRevurdering ? (
                    <Alert variant="error">{formatMessage('feil.fantIkkeRevurdering')}</Alert>
                ) : (
                    <>
                        <Heading level="1" size="xlarge" className={styles.tittel}>
                            {formatMessage('revurdering.tittel')}
                        </Heading>
                        <Route
                            path={Routes.revurderValgtRevurdering.createURL({
                                sakId: props.sakId,
                                steg: RevurderingSteg.Periode,
                                revurderingId: påbegyntRevurdering.id,
                            })}
                        >
                            <EndreRevurderingPage
                                sakId={props.sakId}
                                utbetalinger={props.utbetalinger}
                                informasjonsRevurdering={påbegyntRevurdering}
                            />
                        </Route>
                        <div className={styles.sideMedFramdriftsindikatorContainer}>
                            <Route path={alleSteg.map((s) => s.url)}>
                                <Framdriftsindikator
                                    aktivId={urlParams.steg}
                                    elementer={aktiveSteg(påbegyntRevurdering)}
                                />
                            </Route>
                            {aktiveSteg(påbegyntRevurdering).map((el, idx) => {
                                const forrigeUrl =
                                    aktiveSteg(påbegyntRevurdering)[idx - 1]?.url ??
                                    createRevurderingsPath(RevurderingSteg.Periode);
                                const nesteUrl = (revurdering: InformasjonsRevurdering) =>
                                    aktiveSteg(revurdering)[idx + 1]?.url ??
                                    createRevurderingsPath(RevurderingSteg.Oppsummering);
                                return (
                                    <Route path={el.url} key={el.id}>
                                        <RevurderingstegPage
                                            steg={el.id}
                                            sakId={props.sakId}
                                            informasjonsRevurdering={påbegyntRevurdering}
                                            grunnlagsdataOgVilkårsvurderinger={grunnlag}
                                            forrigeUrl={forrigeUrl}
                                            nesteUrl={nesteUrl}
                                            avsluttUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                                        />
                                    </Route>
                                );
                            })}
                        </div>
                        <Route path={createRevurderingsPath(RevurderingSteg.Oppsummering)}>
                            <RevurderingOppsummeringPage
                                sakId={props.sakId}
                                revurdering={påbegyntRevurdering}
                                forrigeUrl={
                                    aktiveSteg(påbegyntRevurdering)[aktiveSteg(påbegyntRevurdering).length - 1]?.url ??
                                    createRevurderingsPath(RevurderingSteg.Periode)
                                }
                                førsteRevurderingstegUrl={
                                    aktiveSteg(påbegyntRevurdering)[0]?.url ??
                                    createRevurderingsPath(RevurderingSteg.Periode)
                                }
                                grunnlagsdataOgVilkårsvurderinger={grunnlag}
                            />
                        </Route>
                    </>
                )}
            </Switch>
        </div>
    );
};

const RevurderingstegPage = (props: {
    steg: RevurderingSteg;
    forrigeUrl: string;
    nesteUrl: (revurdering: InformasjonsRevurdering) => string;
    avsluttUrl: string;
    sakId: string;
    informasjonsRevurdering: InformasjonsRevurdering;
    grunnlagsdataOgVilkårsvurderinger: RemoteData.RemoteData<ApiError, GrunnlagsdataOgVilkårsvurderinger>;
}) => {
    return pipe(
        props.grunnlagsdataOgVilkårsvurderinger,
        RemoteData.fold(
            () => <Loader />,
            () => <Loader />,
            (error) => (
                <div className={styles.fullsideSpinnerFeilmeldingContainer}>
                    <ApiErrorAlert error={error} />
                </div>
            ),
            (value) => {
                switch (props.steg) {
                    case RevurderingSteg.Uførhet:
                        return (
                            <Uførhet
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                forrigeUrl={props.forrigeUrl}
                                nesteUrl={props.nesteUrl(props.informasjonsRevurdering)}
                                avsluttUrl={props.avsluttUrl}
                            />
                        );
                    case RevurderingSteg.Bosituasjon:
                        return (
                            <Bosituasjon
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                gjeldendeGrunnlagsdataOgVilkårsvurderinger={value}
                                forrigeUrl={props.forrigeUrl}
                                nesteUrl={props.nesteUrl}
                            />
                        );
                    case RevurderingSteg.Formue:
                        return (
                            <Formue
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                gjeldendeGrunnlagsdataOgVilkårsvurderinger={value}
                                forrigeUrl={props.forrigeUrl}
                                nesteUrl={props.nesteUrl}
                            />
                        );
                    case RevurderingSteg.EndringAvFradrag:
                        return (
                            <EndringAvFradrag
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                forrigeUrl={props.forrigeUrl}
                                nesteUrl={props.nesteUrl(props.informasjonsRevurdering)}
                                avsluttUrl={props.avsluttUrl}
                            />
                        );
                    case RevurderingSteg.Utenlandsopphold:
                        return (
                            <UtenlandsoppholdPage
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                forrigeUrl={props.forrigeUrl}
                                nesteUrl={props.nesteUrl(props.informasjonsRevurdering)}
                                avsluttUrl={props.avsluttUrl}
                            />
                        );
                    default:
                        return null;
                }
            }
        )
    );
};

export default RevurderingPage;
