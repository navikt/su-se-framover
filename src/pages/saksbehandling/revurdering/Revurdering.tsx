import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Loader } from '@navikt/ds-react';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import { Feilmelding, Innholdstittel } from 'nav-frontend-typografi';
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
import { Revurdering, Vurderingstatus } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import {
    revurderingstegrekkefølge,
    revurderingstegTilInformasjonSomRevurderes,
} from '~utils/revurdering/revurderingUtils';

import { RevurderingSteg } from '../types';

import Formue from './formue/Formue';
import messages from './revurdering-nb';
import styles from './revurdering.module.less';

const NyRevurderingPage = React.lazy(() => import('./revurderingIntro/NyRevurderingPage'));
const EndreRevurderingPage = React.lazy(() => import('./revurderingIntro/EndreRevurderingPage'));
const Bosituasjon = React.lazy(() => import('./bosituasjon/BosituasjonForm'));
const EndringAvFradrag = React.lazy(() => import('./endringAvFradrag/EndringAvFradrag'));
const RevurderingOppsummeringPage = React.lazy(() => import('./OppsummeringPage/RevurderingOppsummeringPage'));
const Uførhet = React.lazy(() => import('./uførhet/Uførhet'));

const stegTilTekstId = (steg: RevurderingSteg) => {
    switch (steg) {
        case RevurderingSteg.Periode:
            return 'steg.periode';
        case RevurderingSteg.Uførhet:
            return 'steg.uførhet';
        case RevurderingSteg.Bosituasjon:
            return 'steg.bosituasjon';
        case RevurderingSteg.EndringAvFradrag:
            return 'steg.fradrag';
        case RevurderingSteg.Formue:
            return 'steg.formue';
        case RevurderingSteg.Oppsummering:
            return 'steg.oppsummering';
    }
};

const RevurderingPage = (props: { sak: Sak }) => {
    const { intl } = useI18n({ messages: { ...sharedMessages, ...messages } });

    const urlParams = Routes.useRouteParams<typeof Routes.revurderValgtRevurdering>();

    const påbegyntRevurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);

    const dispatch = useAppDispatch();
    const grunnlag = useAppSelector(
        (s) => s.sak.revurderingGrunnlagSimulering[påbegyntRevurdering?.id ?? ''] ?? RemoteData.initial
    );

    React.useEffect(() => {
        if (RemoteData.isInitial(grunnlag) && påbegyntRevurdering) {
            dispatch(
                revurderingActions.hentGjeldendeGrunnlagsdataOgVilkårsvurderinger({
                    sakId: props.sak.id,
                    revurderingId: påbegyntRevurdering.id,
                })
            );
        }
    }, [grunnlag._tag, påbegyntRevurdering?.id]);

    const createRevurderingsPath = (steg: RevurderingSteg) => {
        return Routes.revurderValgtRevurdering.createURL({
            sakId: props.sak.id,
            steg: steg,
            revurderingId: urlParams.revurderingId,
        });
    };

    if (props.sak.utbetalinger.length === 0) {
        return (
            <div className={styles.revurderingContainer}>
                <Innholdstittel className={styles.tittel}>
                    {intl.formatMessage({ id: 'revurdering.tittel' })}
                </Innholdstittel>
                <div className={styles.mainContentContainer}>
                    <div>
                        <Feilmelding className={styles.feilmelding}>
                            {intl.formatMessage({ id: 'feil.kanIkkeRevurdere' })}
                        </Feilmelding>
                    </div>
                    <div className={styles.knappContainer}>
                        <LinkAsButton
                            variant="secondary"
                            href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}
                        >
                            {intl.formatMessage({ id: 'knapp.avslutt' })}
                        </LinkAsButton>
                    </div>
                </div>
            </div>
        );
    }

    const alleSteg = revurderingstegrekkefølge.map((steg) => ({
        id: steg,
        label: intl.formatMessage({ id: stegTilTekstId(steg) }),
        erKlikkbar: false,
        status: Linjestatus.Ingenting,
        url: createRevurderingsPath(steg),
    }));

    const aktiveSteg = (revurdering: Revurdering) =>
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
                        sakId: props.sak.id,
                    })}
                >
                    <NyRevurderingPage sak={props.sak} />
                </Route>
                {!påbegyntRevurdering ? (
                    <Alert variant="error">Fant ikke revurdering</Alert>
                ) : (
                    <>
                        <Innholdstittel className={styles.tittel}>
                            {intl.formatMessage({ id: 'revurdering.tittel' })}
                        </Innholdstittel>
                        <Route
                            path={Routes.revurderValgtRevurdering.createURL({
                                sakId: props.sak.id,
                                steg: RevurderingSteg.Periode,
                                revurderingId: påbegyntRevurdering.id,
                            })}
                        >
                            <EndreRevurderingPage sak={props.sak} revurdering={påbegyntRevurdering} />
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
                                const nesteUrl = (revurdering: Revurdering) =>
                                    aktiveSteg(revurdering)[idx + 1]?.url ??
                                    createRevurderingsPath(RevurderingSteg.Oppsummering);
                                return (
                                    <Route path={el.url} key={el.id}>
                                        <RevurderingstegPage
                                            steg={el.id}
                                            sakId={props.sak.id}
                                            revurdering={påbegyntRevurdering}
                                            grunnlagsdataOgVilkårsvurderinger={grunnlag}
                                            forrigeUrl={forrigeUrl}
                                            nesteUrl={nesteUrl}
                                        />
                                    </Route>
                                );
                            })}
                        </div>
                        <Route path={createRevurderingsPath(RevurderingSteg.Oppsummering)}>
                            <RevurderingOppsummeringPage
                                sakId={props.sak.id}
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
    nesteUrl: (revurdering: Revurdering) => string;
    sakId: string;
    revurdering: Revurdering;
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
                                revurdering={props.revurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                forrigeUrl={props.forrigeUrl}
                                nesteUrl={props.nesteUrl(props.revurdering)}
                            />
                        );
                    case RevurderingSteg.Bosituasjon:
                        return (
                            <Bosituasjon
                                sakId={props.sakId}
                                revurdering={props.revurdering}
                                gjeldendeGrunnlagsdataOgVilkårsvurderinger={value}
                                forrigeUrl={props.forrigeUrl}
                                nesteUrl={props.nesteUrl}
                            />
                        );
                    case RevurderingSteg.Formue:
                        return (
                            <Formue
                                sakId={props.sakId}
                                revurdering={props.revurdering}
                                gjeldendeGrunnlagsdataOgVilkårsvurderinger={value}
                                forrigeUrl={props.forrigeUrl}
                                nesteUrl={props.nesteUrl}
                            />
                        );
                    case RevurderingSteg.EndringAvFradrag:
                        return (
                            <EndringAvFradrag
                                sakId={props.sakId}
                                revurdering={props.revurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                forrigeUrl={props.forrigeUrl}
                                nesteUrl={props.nesteUrl(props.revurdering)}
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
