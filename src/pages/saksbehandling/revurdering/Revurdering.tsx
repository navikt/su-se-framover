import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Heading } from '@navikt/ds-react';
import React from 'react';
import { useOutletContext } from 'react-router-dom';

import { hentgjeldendeGrunnlagsdataOgVilkårsvurderinger } from '~src/api/GrunnlagOgVilkårApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Framdriftsindikator, { Seksjon } from '~src/components/framdriftsindikator/Framdriftsindikator';
import SpinnerMedTekst from '~src/components/henterInnhold/SpinnerMedTekst';
import { LinkAsButton } from '~src/components/linkAsButton/LinkAsButton';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    InformasjonsRevurdering,
    RevurderingVilkårSteg,
    RevurderingOpprettelseSteg,
    RevurderingSeksjoner,
    RevurderingSteg,
    RevurderingGrunnlagSteg,
} from '~src/types/Revurdering';
import {
    erInformasjonsRevurdering,
    lagVilkårSeksjon,
    lagOpprettelsesSeksjon,
    revurderingTilFramdriftsindikatorSeksjoner,
    lagGrunnlagsSeksjon,
} from '~src/utils/revurdering/revurderingUtils';

import SkjemaelementFeilmelding from '../../../components/formElements/SkjemaelementFeilmelding';

import NullstillRevurderingVarsel from './advarselReset/NullstillRevurderingVarsel';
import RevurderingBeregnOgSimuler from './beregnOgSimuler/RevurderingBeregnOgSimuler';
import Formue from './formue/Formue';
import { PersonligOppmøte } from './personligOppmøte/PersonligOppmøte';
import sharedMessages from './revurdering-nb';
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
    const { sak } = useOutletContext<SaksoversiktContext>();
    const props = {
        sakId: sak.id,
        utbetalinger: sak.utbetalinger,
        informasjonsRevurderinger: sak.revurderinger.filter(erInformasjonsRevurdering),
    };
    const { formatMessage } = useI18n({ messages: sharedMessages });
    const urlParams = routes.useRouteParams<typeof routes.revurderingSeksjonSteg>();

    const påbegyntRevurdering = props.informasjonsRevurderinger.find((r) => r.id === urlParams.revurderingId);

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

    if (!påbegyntRevurdering) {
        return <Alert variant="error">{formatMessage('feil.fantIkkeRevurdering')}</Alert>;
    }

    const framdriftsindikatorSeksjoner = revurderingTilFramdriftsindikatorSeksjoner({
        sakId: props.sakId,
        r: påbegyntRevurdering,
    });

    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="large" className={styles.tittel}>
                {formatMessage('revurdering.tittel')}
            </Heading>
            {urlParams.steg === RevurderingOpprettelseSteg.Periode && <RevurderingIntroPage />}
            {(urlParams.seksjon === RevurderingSeksjoner.Vilkår ||
                urlParams.seksjon === RevurderingSeksjoner.Grunnlag) && (
                <div className={styles.framdriftsindikatorOgInnholdContainer}>
                    <FramdriftsIndikatorRevurdering
                        sakId={props.sakId}
                        revurderingId={påbegyntRevurdering.id}
                        aktiveSteg={urlParams.steg!}
                        listeElementer={framdriftsindikatorSeksjoner}
                    />
                    <GrunnlagOgVilkårWrapper
                        seksjonOgSteg={{ seksjon: urlParams.seksjon!, steg: urlParams.steg! }}
                        seksjoner={framdriftsindikatorSeksjoner}
                        sakId={props.sakId}
                        informasjonsRevurdering={påbegyntRevurdering}
                    />
                </div>
            )}
            {urlParams.seksjon === RevurderingSeksjoner.BeregningOgSimulering && (
                <div className={styles.framdriftsindikatorOgInnholdContainer}>
                    <FramdriftsIndikatorRevurdering
                        sakId={props.sakId}
                        revurderingId={påbegyntRevurdering.id}
                        aktiveSteg={urlParams.steg!}
                        listeElementer={framdriftsindikatorSeksjoner}
                    />
                    <RevurderingBeregnOgSimuler
                        seksjoner={framdriftsindikatorSeksjoner}
                        sakId={props.sakId}
                        informasjonsRevurdering={påbegyntRevurdering}
                    />
                </div>
            )}
            {urlParams.seksjon === RevurderingSeksjoner.Oppsummering && (
                <div className={styles.framdriftsindikatorOgInnholdContainer}>
                    <FramdriftsIndikatorRevurdering
                        sakId={props.sakId}
                        revurderingId={påbegyntRevurdering.id}
                        aktiveSteg={urlParams.steg!}
                        listeElementer={framdriftsindikatorSeksjoner}
                    />
                    <RevurderingOppsummeringPage
                        sakId={props.sakId}
                        revurdering={påbegyntRevurdering}
                        aktivSeksjonOgSteg={{ seksjon: urlParams.seksjon!, steg: urlParams.steg! }}
                        seksjoner={framdriftsindikatorSeksjoner}
                    />
                </div>
            )}
        </div>
    );
};

const FramdriftsIndikatorRevurdering = (props: {
    sakId: string;
    revurderingId: string;
    aktiveSteg: RevurderingSteg;
    listeElementer: Seksjon[];
}) => {
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    return (
        <div>
            <Framdriftsindikator
                aktivId={props.aktiveSteg}
                elementer={props.listeElementer}
                overrideFørsteLinjeOnClick={(v) =>
                    v === RevurderingOpprettelseSteg.Periode ? setModalOpen(true) : undefined
                }
            />
            {modalOpen && (
                <NullstillRevurderingVarsel
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    førsteStegUrl={routes.revurderingSeksjonSteg.createURL({
                        sakId: props.sakId,
                        revurderingId: props.revurderingId,
                        seksjon: RevurderingSeksjoner.Opprettelse,
                        steg: RevurderingOpprettelseSteg.Periode,
                    })}
                />
            )}
        </div>
    );
};

const GrunnlagOgVilkårWrapper = (props: {
    seksjonOgSteg: { seksjon: RevurderingSeksjoner; steg: RevurderingSteg };
    seksjoner: Seksjon[];
    sakId: string;
    informasjonsRevurdering: InformasjonsRevurdering;
}) => {
    const { formatMessage } = useI18n({ messages: sharedMessages });
    const [gjeldendeData, hentGjeldendeData] = useApiCall(hentgjeldendeGrunnlagsdataOgVilkårsvurderinger);
    React.useEffect(() => {
        if (RemoteData.isInitial(gjeldendeData)) {
            hentGjeldendeData({
                sakId: props.sakId,
                fraOgMed: props.informasjonsRevurdering.periode.fraOgMed,
                tilOgMed: props.informasjonsRevurdering.periode.tilOgMed,
            });
        }
    }, [props.informasjonsRevurdering.periode.fraOgMed, props.informasjonsRevurdering.periode.tilOgMed]);

    return pipe(
        gjeldendeData,
        RemoteData.fold3(
            () => (
                <SpinnerMedTekst
                    className={styles.spinner}
                    text={formatMessage('grunnlagOgvilkår.henterGjeldendeData')}
                />
            ),
            (error) => (
                <div className={styles.fullsideSpinnerFeilmeldingContainer}>
                    <ApiErrorAlert error={error} />
                </div>
            ),
            (gjeldendeData) => (
                <>
                    {props.seksjonOgSteg.seksjon === RevurderingSeksjoner.Grunnlag && (
                        <GrunnlagSteg
                            {...props}
                            gjeldendeGrunnlagsdataOgVilkårsvurderinger={gjeldendeData.grunnlagsdataOgVilkårsvurderinger}
                        />
                    )}
                    {props.seksjonOgSteg.seksjon === RevurderingSeksjoner.Vilkår && (
                        <VilkårSteg
                            {...props}
                            gjeldendeGrunnlagsdataOgVilkårsvurderinger={gjeldendeData.grunnlagsdataOgVilkårsvurderinger}
                        />
                    )}
                </>
            )
        )
    );
};

const GrunnlagSteg = (props: {
    seksjonOgSteg: { seksjon: RevurderingSeksjoner; steg: RevurderingSteg };
    seksjoner: Seksjon[];
    sakId: string;
    informasjonsRevurdering: InformasjonsRevurdering;
    gjeldendeGrunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    const seksjonIdx = props.seksjoner.findIndex((s) => s.id === props.seksjonOgSteg.seksjon);
    const idx = props.seksjoner[seksjonIdx].linjer.findIndex((l) => l.id === props.seksjonOgSteg.steg);
    const erFørsteGrunnlagSteg = seksjonIdx === 1 && idx === 0;

    const opprettelsesSeksjon = lagOpprettelsesSeksjon({ sakId: props.sakId, r: props.informasjonsRevurdering });
    const forrigeUrl =
        props.seksjoner[seksjonIdx].linjer[idx - 1]?.url ??
        props.seksjoner[seksjonIdx - 1].linjer[props.seksjoner[seksjonIdx - 1].linjer.length - 1]?.url ??
        routes.revurderingSeksjonSteg.createURL({
            sakId: props.sakId,
            revurderingId: props.informasjonsRevurdering.id,
            seksjon: opprettelsesSeksjon.id as RevurderingSeksjoner.Opprettelse,
            steg: opprettelsesSeksjon.linjer[0].id as RevurderingOpprettelseSteg,
        });

    const vilkårSeksjon = lagVilkårSeksjon({ sakId: props.sakId, r: props.informasjonsRevurdering });
    const nesteUrl =
        props.seksjoner[seksjonIdx].linjer[idx + 1]?.url ??
        props.seksjoner[seksjonIdx + 1]?.linjer[0]?.url ??
        routes.revurderingSeksjonSteg.createURL({
            sakId: props.sakId,
            revurderingId: props.informasjonsRevurdering.id,
            seksjon: vilkårSeksjon.id as RevurderingSeksjoner.Vilkår,
            steg: vilkårSeksjon.linjer[0].id as RevurderingVilkårSteg,
        });

    const stegProps = {
        sakId: props.sakId,
        revurdering: props.informasjonsRevurdering,
        forrigeUrl: forrigeUrl,
        nesteUrl: nesteUrl,
        onTilbakeClickOverride: erFørsteGrunnlagSteg ? () => setModalOpen(true) : undefined,
        avsluttUrl: routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }),
        grunnlagsdataOgVilkårsvurderinger: props.gjeldendeGrunnlagsdataOgVilkårsvurderinger,
    };

    return (
        <div className={styles.sideMedFramdriftsindikatorContainer}>
            {modalOpen && (
                <NullstillRevurderingVarsel
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    førsteStegUrl={routes.revurderingSeksjonSteg.createURL({
                        sakId: props.sakId,
                        revurderingId: props.informasjonsRevurdering.id,
                        seksjon: RevurderingSeksjoner.Opprettelse,
                        steg: RevurderingOpprettelseSteg.Periode,
                    })}
                />
            )}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagSteg.Bosituasjon && <BosituasjonPage {...stegProps} />}

            {props.seksjonOgSteg.steg === RevurderingGrunnlagSteg.EndringAvFradrag && (
                <EndringAvFradrag {...stegProps} />
            )}
        </div>
    );
};

const VilkårSteg = (props: {
    seksjonOgSteg: { seksjon: RevurderingSeksjoner; steg: RevurderingSteg };
    seksjoner: Seksjon[];
    sakId: string;
    informasjonsRevurdering: InformasjonsRevurdering;
    gjeldendeGrunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);

    const seksjonIdx = props.seksjoner.findIndex((s) => s.id === props.seksjonOgSteg.seksjon);
    const idx = props.seksjoner[seksjonIdx].linjer.findIndex((l) => l.id === props.seksjonOgSteg.steg);

    const grunnlagSeksjon = lagGrunnlagsSeksjon({ sakId: props.sakId, r: props.informasjonsRevurdering });
    const erFørsteVilkårStegOgRevurdererIkkeGrunnlag =
        seksjonIdx === 2 && idx === 0 && grunnlagSeksjon.linjer.length === 0;

    const stegProps = {
        sakId: props.sakId,
        revurdering: props.informasjonsRevurdering,
        forrigeUrl:
            props.seksjoner[seksjonIdx].linjer[idx - 1]?.url ??
            props.seksjoner[seksjonIdx - 1].linjer[props.seksjoner[seksjonIdx - 1].linjer.length - 1]?.url,
        nesteUrl: props.seksjoner[seksjonIdx].linjer[idx + 1]?.url ?? props.seksjoner[seksjonIdx + 1]?.linjer[0]?.url,
        onTilbakeClickOverride: erFørsteVilkårStegOgRevurdererIkkeGrunnlag ? () => setModalOpen(true) : undefined,
        avsluttUrl: routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }),
        grunnlagsdataOgVilkårsvurderinger: props.gjeldendeGrunnlagsdataOgVilkårsvurderinger,
    };

    return (
        <div className={styles.sideMedFramdriftsindikatorContainer}>
            {modalOpen && (
                <NullstillRevurderingVarsel
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    førsteStegUrl={routes.revurderingSeksjonSteg.createURL({
                        sakId: props.sakId,
                        revurderingId: props.informasjonsRevurdering.id,
                        seksjon: RevurderingSeksjoner.Opprettelse,
                        steg: RevurderingOpprettelseSteg.Periode,
                    })}
                />
            )}
            {props.seksjonOgSteg.steg === RevurderingVilkårSteg.Uførhet && <Uførhet {...stegProps} />}
            {props.seksjonOgSteg.steg === RevurderingVilkårSteg.Flyktning && <FlyktningPage {...stegProps} />}
            {props.seksjonOgSteg.steg === RevurderingVilkårSteg.FastOpphold && <FastOppholdPage {...stegProps} />}
            {props.seksjonOgSteg.steg === RevurderingVilkårSteg.Formue && <Formue {...stegProps} />}
            {props.seksjonOgSteg.steg === RevurderingVilkårSteg.Utenlandsopphold && (
                <UtenlandsoppholdPage {...stegProps} />
            )}
            {props.seksjonOgSteg.steg === RevurderingVilkårSteg.Opplysningsplikt && <Opplysningsplikt {...stegProps} />}
            {props.seksjonOgSteg.steg === RevurderingVilkårSteg.Oppholdstillatelse && (
                <Oppholdstillatelse {...stegProps} />
            )}
            {props.seksjonOgSteg.steg === RevurderingVilkårSteg.PersonligOppmøte && <PersonligOppmøte {...stegProps} />}
            {props.seksjonOgSteg.steg === RevurderingVilkårSteg.Institusjonsopphold && (
                <Institusjonsopphold {...stegProps} />
            )}
        </div>
    );
};

export default RevurderingPage;
