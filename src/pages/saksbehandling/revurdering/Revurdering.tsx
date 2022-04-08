import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Heading, Loader } from '@navikt/ds-react';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { ApiError } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Framdriftsindikator, { Linjestatus } from '~src/components/framdriftsindikator/Framdriftsindikator';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import * as revurderingActions from '~src/features/revurdering/revurderingActions';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InformasjonsRevurdering, Vurderingstatus } from '~src/types/Revurdering';
import { Utbetalingsperiode } from '~src/types/Utbetalingsperiode';
import {
    revurderingstegrekkefølge,
    revurderingstegTilInformasjonSomRevurderes,
} from '~src/utils/revurdering/revurderingUtils';

import SkjemaelementFeilmelding from '../../../components/formElements/SkjemaelementFeilmelding';
import { RevurderingSteg } from '../types';

import Formue from './formue/Formue';
import sharedMessages, { stegmessages } from './revurdering-nb';
import * as styles from './revurdering.module.less';

const UtenlandsoppholdPage = React.lazy(() => import('./utenlandsopphold/Utenlandsopphold'));
const RevurderingIntroPage = React.lazy(() => import('./revurderingIntro/RevurderingIntroPage'));
const BosituasjonFormPage = React.lazy(() => import('./bosituasjon/BosituasjonFormPage'));
const EndringAvFradrag = React.lazy(() => import('./endringAvFradrag/EndringAvFradrag'));
const RevurderingOppsummeringPage = React.lazy(() => import('./OppsummeringPage/RevurderingOppsummeringPage'));
const Uførhet = React.lazy(() => import('./uførhet/Uførhet'));

const RevurderingPage = (props: {
    sakId: string;
    utbetalinger: Utbetalingsperiode[];
    informasjonsRevurderinger: InformasjonsRevurdering[];
}) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...stegmessages } });

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
                <Heading level="1" size="large" className={styles.tittel}>
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
                    <RevurderingIntroPage
                        sakId={props.sakId}
                        utbetalinger={props.utbetalinger}
                        informasjonsRevurdering={undefined}
                    />
                </Route>
                {!påbegyntRevurdering ? (
                    <Alert variant="error">{formatMessage('feil.fantIkkeRevurdering')}</Alert>
                ) : (
                    <>
                        <Heading level="1" size="large" className={styles.tittel}>
                            {formatMessage('revurdering.tittel')}
                        </Heading>
                        <Route path={createRevurderingsPath(RevurderingSteg.Periode)}>
                            <RevurderingIntroPage
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
                                const forrigeUrl = aktiveSteg(påbegyntRevurdering)[idx - 1]?.url;
                                const forrige = forrigeUrl
                                    ? { url: forrigeUrl, visModal: false }
                                    : { url: createRevurderingsPath(RevurderingSteg.Periode), visModal: true };
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
                                            forrige={forrige}
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
    forrige: { url: string; visModal: boolean };
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
                                forrige={props.forrige}
                                nesteUrl={props.nesteUrl(props.informasjonsRevurdering)}
                                avsluttUrl={props.avsluttUrl}
                            />
                        );
                    case RevurderingSteg.Bosituasjon:
                        return (
                            <BosituasjonFormPage
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                forrige={props.forrige}
                                nesteUrl={props.nesteUrl(props.informasjonsRevurdering)}
                                avsluttUrl={props.avsluttUrl}
                            />
                        );
                    case RevurderingSteg.Formue:
                        return (
                            <Formue
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                forrige={props.forrige}
                                nesteUrl={props.nesteUrl(props.informasjonsRevurdering)}
                                avsluttUrl={props.avsluttUrl}
                            />
                        );
                    case RevurderingSteg.EndringAvFradrag:
                        return (
                            <EndringAvFradrag
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                forrige={props.forrige}
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
                                forrige={props.forrige}
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
