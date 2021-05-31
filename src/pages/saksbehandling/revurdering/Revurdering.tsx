import * as RemoteData from '@devexperts/remote-data-ts';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import AlertStripe from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Feilmelding, Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';
import { Link, Route, Switch } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import Framdriftsindikator, { Linjestatus } from '~components/framdriftsindikator/Framdriftsindikator';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Revurdering, Vurderingstatus } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/Vilkår';

import { RevurderingSteg } from '../types';

import Bosituasjon from './bosituasjon/Bosituasjon';
import EndringAvFradrag from './endringAvFradrag/EndringAvFradrag';
import RevurderingsOppsummering from './oppsummering/RevurderingsOppsummering';
import messages from './revurdering-nb';
import styles from './revurdering.module.less';
import { EndreRevurderingPage } from './revurderingIntro/EndreRevurderingPage';
import { NyRevurderingPage } from './revurderingIntro/NyRevurderingPage';
import RevurderingskallFeilet from './revurderingskallFeilet/RevurderingskallFeilet';
import { revurderingstegrekkefølge, revurderingstegTilInformasjonSomRevurderes } from './revurderingUtils';
import Uførhet from './uførhet/Uførhet';

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
        case RevurderingSteg.Oppsummering:
            return 'steg.oppsummering';
    }
};

const RevurderingPage = (props: { sak: Sak }) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });

    const urlParams = Routes.useRouteParams<typeof Routes.revurderValgtRevurdering>();

    const påbegyntRevurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);

    const dispatch = useAppDispatch();
    const grunnlag = useAppSelector(
        (s) => s.sak.revurderingGrunnlagSimulering[påbegyntRevurdering?.id ?? ''] ?? RemoteData.initial
    );

    React.useEffect(() => {
        if (RemoteData.isInitial(grunnlag) && påbegyntRevurdering) {
            dispatch(
                revurderingActions.hentGrunnlagsdataOgVilkårsvurderinger({
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
                        <Link className="knapp" to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}>
                            {intl.formatMessage({ id: 'knapp.avslutt' })}
                        </Link>
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

    const aktiveSteg = pipe(
        alleSteg,
        A.filterMap((steg) =>
            pipe(
                O.fromNullable(revurderingstegTilInformasjonSomRevurderes(steg.id)),
                O.chainNullableK((i) => påbegyntRevurdering?.informasjonSomRevurderes[i]),
                O.map((vurderingstatus) => ({
                    ...steg,
                    status: vurderingstatus === Vurderingstatus.IkkeVurdert ? Linjestatus.Ingenting : Linjestatus.Ok,
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
                    <AlertStripe type="feil">Fant ikke revurdering</AlertStripe>
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
                                <Framdriftsindikator aktivId={urlParams.steg} elementer={aktiveSteg} />
                            </Route>
                            {aktiveSteg.map((el, idx) => {
                                const forrigeUrl =
                                    aktiveSteg[idx - 1]?.url ?? createRevurderingsPath(RevurderingSteg.Periode);
                                const nesteUrl =
                                    aktiveSteg[idx + 1]?.url ?? createRevurderingsPath(RevurderingSteg.Oppsummering);
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
                            <RevurderingsOppsummering
                                sakId={props.sak.id}
                                revurdering={påbegyntRevurdering}
                                forrigeUrl={
                                    aktiveSteg[aktiveSteg.length - 1]?.url ??
                                    createRevurderingsPath(RevurderingSteg.Periode)
                                }
                                førsteRevurderingstegUrl={
                                    aktiveSteg[0]?.url ?? createRevurderingsPath(RevurderingSteg.Periode)
                                }
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
    nesteUrl: string;
    sakId: string;
    revurdering: Revurdering;
    grunnlagsdataOgVilkårsvurderinger: RemoteData.RemoteData<ApiError, GrunnlagsdataOgVilkårsvurderinger>;
}) => {
    if (RemoteData.isInitial(props.grunnlagsdataOgVilkårsvurderinger)) {
        return (
            <div className={styles.fullsideSpinnerFeilmeldingContainer}>
                <NavFrontendSpinner />
            </div>
        );
    }
    if (RemoteData.isPending(props.grunnlagsdataOgVilkårsvurderinger)) {
        return (
            <div className={styles.fullsideSpinnerFeilmeldingContainer}>
                <NavFrontendSpinner />
            </div>
        );
    }
    if (RemoteData.isFailure(props.grunnlagsdataOgVilkårsvurderinger)) {
        return (
            <div className={styles.fullsideSpinnerFeilmeldingContainer}>
                <RevurderingskallFeilet error={props.grunnlagsdataOgVilkårsvurderinger.error} />
            </div>
        );
    }
    switch (props.steg) {
        case RevurderingSteg.Uførhet:
            return (
                <Uførhet
                    sakId={props.sakId}
                    revurdering={props.revurdering}
                    grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger.value}
                    forrigeUrl={props.forrigeUrl}
                    nesteUrl={props.nesteUrl}
                />
            );
        case RevurderingSteg.Bosituasjon:
            return (
                <Bosituasjon
                    sakId={props.sakId}
                    revurdering={props.revurdering}
                    grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger.value}
                    forrigeUrl={props.forrigeUrl}
                    nesteUrl={props.nesteUrl}
                />
            );
        case RevurderingSteg.EndringAvFradrag:
            return (
                <EndringAvFradrag
                    sakId={props.sakId}
                    revurdering={props.revurdering}
                    grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger.value}
                    forrigeUrl={props.forrigeUrl}
                    nesteUrl={props.nesteUrl}
                />
            );
        default:
            return null;
    }
};

export default RevurderingPage;
