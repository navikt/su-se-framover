import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Button, Heading, Modal } from '@navikt/ds-react';
import { lazy, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

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
    InformasjonSomRevurderes,
    InformasjonsRevurdering,
    RevurderingGrunnlagOgVilkårSteg,
    RevurderingOpprettelseSteg,
    RevurderingSeksjoner,
    RevurderingSteg,
    Vurderingstatus,
} from '~src/types/Revurdering';
import { Sakstype } from '~src/types/Sak.ts';
import {
    erInformasjonsRevurdering,
    revurderingTilFramdriftsindikatorSeksjoner,
} from '~src/utils/revurdering/revurderingUtils';

import SkjemaelementFeilmelding from '../../../components/formElements/SkjemaelementFeilmelding';

import NullstillRevurderingVarsel from './advarselReset/NullstillRevurderingVarsel';
import RevurderingBeregnOgSimuler from './beregnOgSimuler/RevurderingBeregnOgSimuler';
import Formue from './formue/Formue';
import { PersonligOppmøte } from './personligOppmøte/PersonligOppmøte';
import styles from './revurdering.module.less';
import messages from './revurdering-nb';

const UtenlandsoppholdPage = lazy(() => import('./utenlandsopphold/Utenlandsopphold'));
const RevurderingIntroPage = lazy(() => import('./revurderingIntro/RevurderingIntroPage'));
const BosituasjonPage = lazy(() => import('./bosituasjon/bosituasjonPage'));
const EndringAvFradrag = lazy(() => import('./endringAvFradrag/EndringAvFradrag'));
const RevurderingOppsummeringPage = lazy(() => import('./OppsummeringPage/RevurderingOppsummeringPage'));
const Uførhet = lazy(() => import('./uførhet/Uførhet'));
const Opplysningsplikt = lazy(() => import('./opplysningsplikt/Opplysningsplikt'));
const Oppholdstillatelse = lazy(() => import('./oppholdstillatelse/LovligOpphold'));
const FastOppholdPage = lazy(() => import('./fastOpphold/FastOppholdPage'));
const FlyktningPage = lazy(() => import('./flyktning/FlyktningPage'));
const Institusjonsopphold = lazy(() => import('./institusjonsopphold/Institusjonsopphold'));
const AlderspensjonPage = lazy(() => import('~src/pages/saksbehandling/revurdering/alderspensjon/Alderspensjon.tsx'));
const FamiliegjenforeningPage = lazy(() => import('./familiegjenforening/Familiegjenforening'));

const RevurderingPage = () => {
    const { sak } = useOutletContext<SaksoversiktContext>();
    const props = {
        sakId: sak.id,
        utbetalinger: sak.utbetalinger,
        informasjonsRevurderinger: sak.revurderinger.filter(erInformasjonsRevurdering),
    };

    const { formatMessage } = useI18n({ messages: messages });
    const urlParams = routes.useRouteParams<typeof routes.revurderingSeksjonSteg>();

    const påbegyntRevurdering = props.informasjonsRevurderinger.find((r) => r.id === urlParams.revurderingId);
    const harUteståendeKravgrunnlag = !!sak.uteståendeKravgrunnlag;
    if (props.utbetalinger.length === 0) {
        return (
            <div className={styles.revurderingContainer}>
                <Heading level="1" size="large" className={styles.tittel}>
                    {formatMessage('revurdering.tittel')}
                </Heading>

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
        );
    }

    if (!påbegyntRevurdering) {
        return <Alert variant="error">{formatMessage('feil.fantIkkeRevurdering')}</Alert>;
    }

    return (
        <div className={styles.pageContainer}>
            <Heading level="1" size="large" className={styles.tittel}>
                {formatMessage('revurdering.tittel')}
            </Heading>
            {urlParams.seksjon === RevurderingSeksjoner.Opprettelse && <RevurderingIntroPage />}
            {urlParams.seksjon !== RevurderingSeksjoner.Opprettelse && (
                <RevurderingSeksjonerWrapper
                    sakId={sak.id}
                    sakstype={sak.sakstype}
                    revurdering={påbegyntRevurdering}
                    seksjonOgSteg={{ seksjon: urlParams.seksjon!, steg: urlParams.steg! }}
                    harUteståendeKravgrunnlag={harUteståendeKravgrunnlag}
                />
            )}
        </div>
    );
};

const RevurderingSeksjonerWrapper = (props: {
    sakId: string;
    sakstype: Sakstype;
    revurdering: InformasjonsRevurdering;
    seksjonOgSteg: {
        seksjon: RevurderingSeksjoner;
        steg: RevurderingSteg;
    };
    harUteståendeKravgrunnlag: boolean;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: messages });
    const [gjeldendeData, hentGjeldendeData] = useApiCall(hentgjeldendeGrunnlagsdataOgVilkårsvurderinger);

    useEffect(() => {
        if (RemoteData.isInitial(gjeldendeData)) {
            hentGjeldendeData({
                sakId: props.sakId,
                fraOgMed: props.revurdering.periode.fraOgMed,
                tilOgMed: props.revurdering.periode.tilOgMed,
            });
        }
    }, [props.revurdering.id]);

    const seksjoner = revurderingTilFramdriftsindikatorSeksjoner({ sakId: props.sakId, r: props.revurdering });

    return pipe(
        gjeldendeData,
        RemoteData.fold(
            () => <SpinnerMedTekst />,
            () => <SpinnerMedTekst />,
            (err) => (
                <div>
                    <ApiErrorAlert error={err} />
                    <Button variant="secondary" onClick={() => navigate(seksjoner[0].linjer.at(-1)!.url)}>
                        {formatMessage('knapp.tilbake')}
                    </Button>
                </div>
            ),
            (res) => (
                <div className={styles.framdriftsindikatorOgInnholdContainer}>
                    <FramdriftsIndikatorRevurdering
                        sakId={props.sakId}
                        revurderingId={props.revurdering.id}
                        aktiveSteg={props.seksjonOgSteg.steg}
                        listeElementer={seksjoner}
                    />
                    {props.seksjonOgSteg.seksjon === RevurderingSeksjoner.GrunnlagOgVilkår && (
                        <GrunnlagOgVilkårSteg
                            seksjonOgSteg={props.seksjonOgSteg}
                            seksjoner={seksjoner}
                            sakId={props.sakId}
                            informasjonsRevurdering={props.revurdering}
                            gjeldendeGrunnlagsdataOgVilkårsvurderinger={res.grunnlagsdataOgVilkårsvurderinger}
                        />
                    )}
                    {props.seksjonOgSteg.seksjon === RevurderingSeksjoner.BeregningOgSimulering && (
                        <RevurderingBeregnOgSimuler
                            seksjoner={seksjoner}
                            informasjonsRevurdering={props.revurdering}
                            harUteståendeKravgrunnlag={props.harUteståendeKravgrunnlag}
                        />
                    )}
                    {props.seksjonOgSteg.seksjon === RevurderingSeksjoner.Oppsummering && (
                        <RevurderingOppsummeringPage
                            sakId={props.sakId}
                            sakstype={props.sakstype}
                            revurdering={props.revurdering}
                            aktivSeksjonOgSteg={props.seksjonOgSteg}
                            seksjoner={seksjoner}
                            gjeldendeGrunnlagOgVilkår={res.grunnlagsdataOgVilkårsvurderinger}
                        />
                    )}
                </div>
            ),
        ),
    );
};

const FramdriftsIndikatorRevurdering = (props: {
    sakId: string;
    revurderingId: string;
    aktiveSteg: RevurderingSteg;
    listeElementer: Seksjon[];
}) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
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

const GrunnlagOgVilkårSteg = (props: {
    seksjonOgSteg: { seksjon: RevurderingSeksjoner; steg: RevurderingSteg };
    seksjoner: Seksjon[];
    sakId: string;
    informasjonsRevurdering: InformasjonsRevurdering;
    gjeldendeGrunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const { søker } = useOutletContext<SaksoversiktContext>();
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [navigererTilOppsummeringMedVilkårIkkeVurdert, setNavigererTilOppsummeringMedVilkårIkkeVurdert] =
        useState<boolean>(false);

    const seksjonIdx = props.seksjoner.findIndex((s) => s.id === props.seksjonOgSteg.seksjon);
    const idx = props.seksjoner[seksjonIdx].linjer.findIndex((l) => l.id === props.seksjonOgSteg.steg);

    const erFørsteSteg = seksjonIdx === 1 && idx === 0;

    const erSisteStegAvGrunnlagOgVilkårMenIkkeAltErVurdert =
        seksjonIdx === 1 &&
        idx === props.seksjoner[1].linjer.length - 1 &&
        Object.entries(props.informasjonsRevurdering.informasjonSomRevurderes).some(
            (v) => v[1] === Vurderingstatus.IkkeVurdert,
        );

    const kanOppdatertRevurderingNavigeresTilOppsummering = (r: InformasjonsRevurdering) => {
        if (
            seksjonIdx === 1 &&
            idx === props.seksjoner[1].linjer.length - 1 &&
            Object.entries(r.informasjonSomRevurderes).some((v) => v[1] === Vurderingstatus.IkkeVurdert)
        ) {
            setNavigererTilOppsummeringMedVilkårIkkeVurdert(true);
        } else {
            navigate(props.seksjoner[2].linjer[0].url);
        }
    };

    const stegProps = {
        sakId: props.sakId,
        revurdering: props.informasjonsRevurdering,
        forrigeUrl:
            props.seksjoner[seksjonIdx].linjer[idx - 1]?.url ??
            props.seksjoner[seksjonIdx - 1].linjer[props.seksjoner[seksjonIdx - 1].linjer.length - 1]?.url,
        nesteUrl: props.seksjoner[seksjonIdx].linjer[idx + 1]?.url ?? props.seksjoner[seksjonIdx + 1]?.linjer[0]?.url,
        onTilbakeClickOverride: erFørsteSteg ? () => setModalOpen(true) : undefined,
        onSuccessOverride: erSisteStegAvGrunnlagOgVilkårMenIkkeAltErVurdert
            ? (r: InformasjonsRevurdering) => kanOppdatertRevurderingNavigeresTilOppsummering(r)
            : undefined,
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
            {navigererTilOppsummeringMedVilkårIkkeVurdert && (
                <MåVurdereAlleStegModal
                    informasjonSomRevurderes={props.informasjonsRevurdering.informasjonSomRevurderes}
                    isOpen={navigererTilOppsummeringMedVilkårIkkeVurdert}
                    onClose={() => setNavigererTilOppsummeringMedVilkårIkkeVurdert(false)}
                />
            )}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSteg.Uførhet && <Uførhet {...stegProps} />}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSteg.Flyktning && <FlyktningPage {...stegProps} />}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSteg.FastOpphold && (
                <FastOppholdPage {...stegProps} />
            )}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSteg.Formue && <Formue {...stegProps} />}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSteg.Utenlandsopphold && (
                <UtenlandsoppholdPage {...stegProps} />
            )}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSteg.Opplysningsplikt && (
                <Opplysningsplikt {...stegProps} />
            )}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSteg.Oppholdstillatelse && (
                <Oppholdstillatelse {...stegProps} />
            )}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSteg.PersonligOppmøte && (
                <PersonligOppmøte {...stegProps} />
            )}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSteg.Institusjonsopphold && (
                <Institusjonsopphold {...stegProps} />
            )}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSteg.Bosituasjon && (
                <BosituasjonPage {...stegProps} søker={søker} />
            )}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSteg.EndringAvFradrag && (
                <EndringAvFradrag {...stegProps} />
            )}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSteg.Pensjon && (
                <AlderspensjonPage {...stegProps} />
            )}
            {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSteg.Familiegjenforening && (
                <FamiliegjenforeningPage {...stegProps} />
            )}
        </div>
    );
};

export default RevurderingPage;

const MåVurdereAlleStegModal = (props: {
    informasjonSomRevurderes: Record<InformasjonSomRevurderes, Vurderingstatus>;
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <Modal open={props.isOpen} onClose={props.onClose} aria-label={formatMessage('modal.tittel')}>
            <Modal.Header>
                <Heading level="2" size="medium">
                    {formatMessage('modal.tittel')}
                </Heading>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <Heading size="small" spacing>
                        {formatMessage('modal.måVurdereAlleSteg')}
                    </Heading>
                    <ol>
                        {Object.entries(props.informasjonSomRevurderes)
                            .filter((o) => o[1] === Vurderingstatus.IkkeVurdert)
                            .map((o) => (
                                <li key={o[0]}>
                                    <BodyShort>{formatMessage(o[0] as InformasjonSomRevurderes)}</BodyShort>
                                </li>
                            ))}
                    </ol>
                </div>
            </Modal.Body>
        </Modal>
    );
};
