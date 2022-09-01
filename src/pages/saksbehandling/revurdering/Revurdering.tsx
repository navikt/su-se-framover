import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Heading, Loader } from '@navikt/ds-react';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import React from 'react';
import { useOutletContext } from 'react-router-dom';

import * as sakApi from '~src/api/sakApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Framdriftsindikator, { Linje, Linjestatus } from '~src/components/framdriftsindikator/Framdriftsindikator';
import { LinkAsButton } from '~src/components/linkAsButton/LinkAsButton';
import { pipe } from '~src/lib/fp';
import { ApiResult, useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import NullstillRevurderingVarsel from '~src/pages/saksbehandling/revurdering/advarselReset/NullstillRevurderingVarsel';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InformasjonSomRevurderes, InformasjonsRevurdering, Vurderingstatus } from '~src/types/Revurdering';
import {
    erInformasjonsRevurdering,
    revurderingstegrekkefølge,
    revurderingstegTilInformasjonSomRevurderes,
} from '~src/utils/revurdering/revurderingUtils';
import { AttesteringContext } from '~src/utils/router/routerUtils';

import SkjemaelementFeilmelding from '../../../components/formElements/SkjemaelementFeilmelding';
import { RevurderingSteg } from '../types';

import Formue from './formue/Formue';
import { PersonligOppmøte } from './personligOppmøte/PersonligOppmøte';
import sharedMessages, { stegmessages } from './revurdering-nb';
import * as styles from './revurdering.module.less';

const UtenlandsoppholdPage = React.lazy(() => import('./utenlandsopphold/Utenlandsopphold'));
const RevurderingIntroPage = React.lazy(() => import('./revurderingIntro/RevurderingIntroPage'));
const BosituasjonPage = React.lazy(() => import('./bosituasjon/bosituasjonPage'));
const EndringAvFradrag = React.lazy(() => import('./endringAvFradrag/EndringAvFradrag'));
const RevurderingOppsummeringPage = React.lazy(() => import('./OppsummeringPage/RevurderingOppsummeringPage'));
const Uførhet = React.lazy(() => import('./uførhet/Uførhet'));
const Opplysningsplikt = React.lazy(() => import('./opplysningsplikt/Opplysningsplikt'));
const Oppholdstillatelse = React.lazy(() => import('./oppholdstillatelse/LovligOpphold'));
const FastOppholdPage = React.lazy(() => import('./fastOpphold/FastOppholdPage'));
const FlyktningPage = React.lazy(() => import('./flyktning/FlyktningPage'));
const Institusjonsopphold = React.lazy(() => import('./institusjonsopphold/Institusjonsopphold'));

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

    const [gjeldendeData, hentGjeldendeData] = useApiCall(sakApi.hentgjeldendeGrunnlagsdataOgVilkårsvurderinger);
    React.useEffect(() => {
        if (RemoteData.isInitial(gjeldendeData) && påbegyntRevurdering) {
            hentGjeldendeData({ sakId: props.sakId, fraOgMed: påbegyntRevurdering.periode.fraOgMed });
        }
    }, [gjeldendeData._tag, påbegyntRevurdering?.id]);

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
                    O.chainNullableK((i: InformasjonSomRevurderes) => revurdering.informasjonSomRevurderes[i]),
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
                />
            )}
            {urlParams.steg !== RevurderingSteg.Periode && urlParams.steg !== RevurderingSteg.Oppsummering && (
                <RevurderingstegPage
                    steg={urlParams.steg}
                    revurderingId={påbegyntRevurdering.id}
                    sakId={props.sakId}
                    aktiveSteg={aktiveSteg(påbegyntRevurdering)}
                    informasjonsRevurdering={påbegyntRevurdering}
                    grunnlagsdataOgVilkårsvurderinger={gjeldendeData}
                />
            )}
        </div>
    );
};

const RevurderingstegPage = (props: {
    steg: RevurderingSteg | undefined;
    revurderingId: string;
    aktiveSteg: Linje[];
    sakId: string;
    informasjonsRevurdering: InformasjonsRevurdering;
    grunnlagsdataOgVilkårsvurderinger: ApiResult<{
        grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    }>;
}) => {
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);

    const createRevurderingsPath = (steg: RevurderingSteg) => {
        return routes.revurderValgtRevurdering.createURL({
            sakId: props.sakId,
            steg: steg,
            revurderingId: props.revurderingId,
        });
    };

    const idx = props.aktiveSteg.findIndex((s) => s.id === props.steg);
    const erFørstesteg = idx === 0;
    const forrigeUrl = props.aktiveSteg[idx - 1]?.url ?? createRevurderingsPath(RevurderingSteg.Periode);
    const nesteUrl = props.aktiveSteg[idx + 1]?.url ?? createRevurderingsPath(RevurderingSteg.Oppsummering);

    const avsluttUrl = routes.saksoversiktValgtSak.createURL({
        sakId: props.sakId,
    });

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
            (gjeldendeData) => {
                const stegProps = {
                    sakId: props.sakId,
                    revurdering: props.informasjonsRevurdering,
                    forrigeUrl: forrigeUrl,
                    nesteUrl: nesteUrl,
                    onTilbakeClickOverride: erFørstesteg ? () => setModalOpen(true) : undefined,
                    avsluttUrl: avsluttUrl,
                    grunnlagsdataOgVilkårsvurderinger: gjeldendeData.grunnlagsdataOgVilkårsvurderinger,
                };

                return (
                    <div className={styles.sideMedFramdriftsindikatorContainer}>
                        {props.steg && <Framdriftsindikator aktivId={props.steg} elementer={props.aktiveSteg} />}
                        {erFørstesteg && (
                            <NullstillRevurderingVarsel
                                isOpen={modalOpen}
                                onClose={() => setModalOpen(false)}
                                tilbakeUrl={forrigeUrl}
                            />
                        )}
                        {props.steg === RevurderingSteg.Uførhet && <Uførhet {...stegProps} />}
                        {props.steg === RevurderingSteg.Bosituasjon && <BosituasjonPage {...stegProps} />}
                        {props.steg === RevurderingSteg.Flyktning && <FlyktningPage {...stegProps} />}
                        {props.steg === RevurderingSteg.FastOpphold && <FastOppholdPage {...stegProps} />}
                        {props.steg === RevurderingSteg.Formue && <Formue {...stegProps} />}
                        {props.steg === RevurderingSteg.EndringAvFradrag && <EndringAvFradrag {...stegProps} />}
                        {props.steg === RevurderingSteg.Utenlandsopphold && <UtenlandsoppholdPage {...stegProps} />}
                        {props.steg === RevurderingSteg.Opplysningsplikt && <Opplysningsplikt {...stegProps} />}
                        {props.steg === RevurderingSteg.Oppholdstillatelse && <Oppholdstillatelse {...stegProps} />}
                        {props.steg === RevurderingSteg.PersonligOppmøte && <PersonligOppmøte {...stegProps} />}
                        {props.steg === RevurderingSteg.Institusjonsopphold && <Institusjonsopphold {...stegProps} />}
                    </div>
                );
            }
        )
    );
};

export default RevurderingPage;
