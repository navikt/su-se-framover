import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Heading, Loader } from '@navikt/ds-react';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import React from 'react';

import { useOutletContext } from '~node_modules/react-router-dom';
import { ApiError } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Framdriftsindikator, {
    Linje,
    Linjestatus,
    Seksjon,
} from '~src/components/framdriftsindikator/Framdriftsindikator';
import { LinkAsButton } from '~src/components/linkAsButton/LinkAsButton';
import * as revurderingActions from '~src/features/revurdering/revurderingActions';
import { pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InformasjonsRevurdering, Vurderingstatus } from '~src/types/Revurdering';
import {
    erInformasjonsRevurdering,
    revurderingstegrekkefølge,
    revurderingstegTilInformasjonSomRevurderes,
} from '~src/utils/revurdering/revurderingUtils';
import { AttesteringContext } from '~src/utils/router/routerUtils';

import SkjemaelementFeilmelding from '../../../components/formElements/SkjemaelementFeilmelding';
import { RevurderingSteg } from '../types';

import Formue from './formue/Formue';
import sharedMessages, { stegmessages } from './revurdering-nb';
import * as styles from './revurdering.module.less';

const UtenlandsoppholdPage = React.lazy(() => import('./utenlandsopphold/Utenlandsopphold'));
const RevurderingIntroPage = React.lazy(() => import('./revurderingIntro/RevurderingIntroPage'));
const BosituasjonPage = React.lazy(() => import('./bosituasjon/bosituasjonPage'));
const EndringAvFradrag = React.lazy(() => import('./endringAvFradrag/EndringAvFradrag'));
const RevurderingOppsummeringPage = React.lazy(() => import('./OppsummeringPage/RevurderingOppsummeringPage'));
const Uførhet = React.lazy(() => import('./uførhet/Uførhet'));
const Opplysningsplikt = React.lazy(() => import('./opplysningsplikt/Opplysningsplikt'));

const RevurderingPage = () => {
    const { sak } = useOutletContext<AttesteringContext>();
    const props = {
        sakId: sak.id,
        utbetalinger: sak.utbetalinger,
        informasjonsRevurderinger: sak.revurderinger.filter(erInformasjonsRevurdering),
    };
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...stegmessages } });

    const urlParams = routes.useRouteParams<typeof routes.revurderValgtRevurdering>();

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
        return routes.revurderValgtRevurdering.createURL({
            sakId: props.sakId,
            steg: steg,
            revurderingId: urlParams.revurderingId ?? '',
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
                            href={routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
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

    if (!påbegyntRevurdering) {
        return <Alert variant="error">{formatMessage('feil.fantIkkeRevurdering')}</Alert>;
    }

    const forrigeOgNesteUrl = (
        aktivtSteg: RevurderingSteg | undefined
    ): { forrige: { url: string; visModal: boolean }; neste: string } => {
        const steg = aktiveSteg(påbegyntRevurdering);
        const idx = steg.findIndex((s) => s.id === aktivtSteg);
        const forrigeUrl = steg[idx - 1]?.url;

        const forrige = forrigeUrl
            ? { url: forrigeUrl, visModal: false }
            : { url: createRevurderingsPath(RevurderingSteg.Periode), visModal: true };
        const neste = steg[idx + 1]?.url ?? createRevurderingsPath(RevurderingSteg.Oppsummering);
        return { forrige, neste };
    };

    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="large" className={styles.tittel}>
                {formatMessage('revurdering.tittel')}
            </Heading>
            {urlParams.steg === RevurderingSteg.Periode && <RevurderingIntroPage />}
            {urlParams.steg === RevurderingSteg.Oppsummering && (
                <RevurderingOppsummeringPage
                    sakId={props.sakId}
                    revurdering={påbegyntRevurdering}
                    forrigeUrl={
                        aktiveSteg(påbegyntRevurdering)[aktiveSteg(påbegyntRevurdering).length - 1]?.url ??
                        createRevurderingsPath(RevurderingSteg.Periode)
                    }
                    førsteRevurderingstegUrl={
                        aktiveSteg(påbegyntRevurdering)[0]?.url ?? createRevurderingsPath(RevurderingSteg.Periode)
                    }
                    grunnlagsdataOgVilkårsvurderinger={grunnlag}
                />
            )}
            {urlParams.steg !== RevurderingSteg.Periode && urlParams.steg !== RevurderingSteg.Oppsummering && (
                <RevurderingstegPage
                    steg={urlParams.steg}
                    sakId={props.sakId}
                    aktiveSteg={aktiveSteg(påbegyntRevurdering)}
                    informasjonsRevurdering={påbegyntRevurdering}
                    grunnlagsdataOgVilkårsvurderinger={grunnlag}
                    forrige={forrigeOgNesteUrl(urlParams.steg).forrige}
                    nesteUrl={forrigeOgNesteUrl(urlParams.steg).neste}
                    avsluttUrl={routes.saksoversiktValgtSak.createURL({
                        sakId: props.sakId,
                    })}
                />
            )}
        </div>
    );
};

const RevurderingstegPage = (props: {
    steg: RevurderingSteg | undefined;
    forrige: { url: string; visModal: boolean };
    aktiveSteg: Array<Linje | Seksjon>;
    nesteUrl: string;
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
                return (
                    <div className={styles.sideMedFramdriftsindikatorContainer}>
                        {props.steg && <Framdriftsindikator aktivId={props.steg} elementer={props.aktiveSteg} />}
                        {props.steg === RevurderingSteg.Uførhet && (
                            <Uførhet
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                forrige={props.forrige}
                                nesteUrl={props.nesteUrl}
                                avsluttUrl={props.avsluttUrl}
                            />
                        )}
                        {props.steg === RevurderingSteg.Bosituasjon && (
                            <BosituasjonPage
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                nesteUrl={props.nesteUrl}
                                forrige={props.forrige}
                                avsluttUrl={props.avsluttUrl}
                            />
                        )}
                        {props.steg === RevurderingSteg.Formue && (
                            <Formue
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                forrige={props.forrige}
                                nesteUrl={props.nesteUrl}
                                avsluttUrl={props.avsluttUrl}
                            />
                        )}
                        {props.steg === RevurderingSteg.EndringAvFradrag && (
                            <EndringAvFradrag
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                forrige={props.forrige}
                                nesteUrl={props.nesteUrl}
                                avsluttUrl={props.avsluttUrl}
                            />
                        )}
                        {props.steg === RevurderingSteg.Utenlandsopphold && (
                            <UtenlandsoppholdPage
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                forrige={props.forrige}
                                nesteUrl={props.nesteUrl}
                                avsluttUrl={props.avsluttUrl}
                            />
                        )}
                        {props.steg === RevurderingSteg.Opplysningsplikt && (
                            <Opplysningsplikt
                                sakId={props.sakId}
                                revurdering={props.informasjonsRevurdering}
                                grunnlagsdataOgVilkårsvurderinger={value}
                                forrige={props.forrige}
                                nesteUrl={props.nesteUrl}
                                avsluttUrl={props.avsluttUrl}
                            />
                        )}
                    </div>
                );
            }
        )
    );
};

export default RevurderingPage;
