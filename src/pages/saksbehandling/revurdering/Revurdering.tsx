import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader, Modal } from '@navikt/ds-react';
import React from 'react';
import { useOutletContext } from 'react-router-dom';

import { hentgjeldendeGrunnlagsdataOgVilkårsvurderinger } from '~src/api/GrunnlagOgVilkårApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Framdriftsindikator, { Seksjon } from '~src/components/framdriftsindikator/Framdriftsindikator';
import { LinkAsButton } from '~src/components/linkAsButton/LinkAsButton';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { pipe } from '~src/lib/fp';
import { ApiResult, useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    InformasjonsRevurdering,
    RevurderingGrunnlagOgVilkårSeksjonSteg,
    RevurderingOpprettelseSeksjonSteg,
    RevurderingOppsummeringSeksjonSteg,
    RevurderingSeksjoner,
    RevurderingSeksjonSteg,
    Vurderingstatus,
} from '~src/types/Revurdering';
import {
    erInformasjonsRevurdering,
    lagOpprettelsesSeksjon,
    lagOppsummeringSeksjon,
    revurderingTilFramdriftsindikatorSeksjoner,
} from '~src/utils/revurdering/revurderingUtils';

import SkjemaelementFeilmelding from '../../../components/formElements/SkjemaelementFeilmelding';

import NullstillRevurderingVarsel from './advarselReset/NullstillRevurderingVarsel';
import Formue from './formue/Formue';
import { PersonligOppmøte } from './personligOppmøte/PersonligOppmøte';
import sharedMessages, { stegmessages } from './revurdering-nb';
import * as styles from './revurdering.module.less';

const UtenlandsoppholdPage = React.lazy(() => import('./utenlandsopphold/Utenlandsopphold'));
const RevurderingIntroPage = React.lazy(() => import('./revurderingIntro/RevurderingIntroPage'));
const BosituasjonPage = React.lazy(() => import('./bosituasjon/bosituasjonPage'));
const EndringAvFradrag = React.lazy(() => import('./endringAvFradrag/EndringAvFradrag'));
//const RevurderingOppsummeringPage = React.lazy(() => import('./OppsummeringPage/RevurderingOppsummeringPage'));
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
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...stegmessages } });
    const urlParams = routes.useRouteParams<typeof routes.revurderingSeksjonSteg>();

    const påbegyntRevurdering = props.informasjonsRevurderinger.find((r) => r.id === urlParams.revurderingId);

    const [gjeldendeData, hentGjeldendeData] = useApiCall(hentgjeldendeGrunnlagsdataOgVilkårsvurderinger);
    React.useEffect(() => {
        if ((RemoteData.isInitial(gjeldendeData) || RemoteData.isSuccess(gjeldendeData)) && påbegyntRevurdering) {
            hentGjeldendeData({
                sakId: props.sakId,
                fraOgMed: påbegyntRevurdering.periode.fraOgMed,
                tilOgMed: påbegyntRevurdering.periode.tilOgMed,
            });
        }
    }, [påbegyntRevurdering?.periode.fraOgMed, påbegyntRevurdering?.periode.tilOgMed]);

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
            {urlParams.steg === RevurderingOpprettelseSeksjonSteg.Periode && <RevurderingIntroPage />}

            {urlParams.seksjon === RevurderingSeksjoner.GrunnlagOgVilkår && (
                <div className={styles.framdriftsindikatorOgInnholdContainer}>
                    <FramdriftsIndikatorRevurdering
                        sakId={props.sakId}
                        revurderingId={påbegyntRevurdering.id}
                        aktiveSteg={urlParams.steg!}
                        listeElementer={framdriftsindikatorSeksjoner}
                    />
                    <RevurderingGrunnlagOgVilkårSteg
                        seksjonOgSteg={{ seksjon: urlParams.seksjon!, steg: urlParams.steg! }}
                        seksjoner={framdriftsindikatorSeksjoner}
                        sakId={props.sakId}
                        informasjonsRevurdering={påbegyntRevurdering}
                        grunnlagsdataOgVilkårsvurderinger={gjeldendeData}
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
                    <p>lol</p>
                </div>
            )}
        </div>
    );
};

const FramdriftsIndikatorRevurdering = (props: {
    sakId: string;
    revurderingId: string;
    aktiveSteg: RevurderingSeksjonSteg;
    listeElementer: Seksjon[];
}) => {
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    return (
        <div>
            <Framdriftsindikator
                aktivId={props.aktiveSteg}
                elementer={props.listeElementer}
                overrideFørsteLinjeOnClick={(v) =>
                    v === RevurderingOpprettelseSeksjonSteg.Periode ? setModalOpen(true) : undefined
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
                        steg: RevurderingOpprettelseSeksjonSteg.Periode,
                    })}
                />
            )}
        </div>
    );
};

const RevurderingGrunnlagOgVilkårSteg = (props: {
    seksjonOgSteg: { seksjon: RevurderingSeksjoner; steg: RevurderingSeksjonSteg };
    seksjoner: Seksjon[];
    sakId: string;
    informasjonsRevurdering: InformasjonsRevurdering;
    grunnlagsdataOgVilkårsvurderinger: ApiResult<{
        grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    }>;
}) => {
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    const [navigererTilOppsummeringMedVilkårIkkeVurdert, setNavigererTilOppsummeringMedVilkårIkkeVurdert] =
        React.useState<boolean>(false);

    const seksjonIdx = props.seksjoner.findIndex((s) => s.id === props.seksjonOgSteg.seksjon);
    const idx = props.seksjoner[seksjonIdx].linjer.findIndex((l) => l.id === props.seksjonOgSteg.steg);
    const erFørsteGrunnlagOgVilkårSteg = seksjonIdx === 1 && idx === 0;

    const opprettelsesSeksjon = lagOpprettelsesSeksjon({ sakId: props.sakId, r: props.informasjonsRevurdering });
    const forrigeUrl =
        props.seksjoner[seksjonIdx].linjer[idx - 1]?.url ??
        props.seksjoner[seksjonIdx - 1].linjer[props.seksjoner[seksjonIdx - 1].linjer.length - 1]?.url ??
        routes.revurderingSeksjonSteg.createURL({
            sakId: props.sakId,
            revurderingId: props.informasjonsRevurdering.id,
            seksjon: opprettelsesSeksjon.id as RevurderingSeksjoner.Opprettelse,
            steg: opprettelsesSeksjon.linjer[0].id as RevurderingOpprettelseSeksjonSteg,
        });

    const oppsummeringsseksjon = lagOppsummeringSeksjon({ sakId: props.sakId, r: props.informasjonsRevurdering });
    const nesteUrl =
        props.seksjoner[seksjonIdx].linjer[idx + 1]?.url ??
        props.seksjoner[seksjonIdx + 1]?.linjer[0]?.url ??
        routes.revurderingSeksjonSteg.createURL({
            sakId: props.sakId,
            revurderingId: props.informasjonsRevurdering.id,
            seksjon: oppsummeringsseksjon.id as RevurderingSeksjoner.Oppsummering,
            steg: oppsummeringsseksjon.linjer[0].id as RevurderingOppsummeringSeksjonSteg,
        });

    const erSisteStegAvGrunnlagOgVilkårMenIkkeAltErVurdert =
        seksjonIdx === 1 && idx === props.seksjoner[1].linjer.length - 1;
    Object.entries(props.informasjonsRevurdering.informasjonSomRevurderes).some(
        (v) => v[1] === Vurderingstatus.IkkeVurdert
    );

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
                    onTilbakeClickOverride: erFørsteGrunnlagOgVilkårSteg ? () => setModalOpen(true) : undefined,
                    onSuccessOverride: erSisteStegAvGrunnlagOgVilkårMenIkkeAltErVurdert
                        ? () => setNavigererTilOppsummeringMedVilkårIkkeVurdert(true)
                        : undefined,
                    avsluttUrl: routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }),
                    grunnlagsdataOgVilkårsvurderinger: gjeldendeData.grunnlagsdataOgVilkårsvurderinger,
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
                                    steg: RevurderingOpprettelseSeksjonSteg.Periode,
                                })}
                            />
                        )}
                        {navigererTilOppsummeringMedVilkårIkkeVurdert && (
                            <BasicModal
                                isOpen={navigererTilOppsummeringMedVilkårIkkeVurdert}
                                onClose={() => setNavigererTilOppsummeringMedVilkårIkkeVurdert(false)}
                            />
                        )}
                        {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSeksjonSteg.Uførhet && (
                            <Uførhet {...stegProps} />
                        )}
                        {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSeksjonSteg.Bosituasjon && (
                            <BosituasjonPage {...stegProps} />
                        )}
                        {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSeksjonSteg.Flyktning && (
                            <FlyktningPage {...stegProps} />
                        )}
                        {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSeksjonSteg.FastOpphold && (
                            <FastOppholdPage {...stegProps} />
                        )}
                        {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSeksjonSteg.Formue && (
                            <Formue {...stegProps} />
                        )}
                        {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSeksjonSteg.EndringAvFradrag && (
                            <EndringAvFradrag {...stegProps} />
                        )}
                        {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSeksjonSteg.Utenlandsopphold && (
                            <UtenlandsoppholdPage {...stegProps} />
                        )}
                        {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSeksjonSteg.Opplysningsplikt && (
                            <Opplysningsplikt {...stegProps} />
                        )}
                        {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSeksjonSteg.Oppholdstillatelse && (
                            <Oppholdstillatelse {...stegProps} />
                        )}
                        {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSeksjonSteg.PersonligOppmøte && (
                            <PersonligOppmøte {...stegProps} />
                        )}
                        {props.seksjonOgSteg.steg === RevurderingGrunnlagOgVilkårSeksjonSteg.Institusjonsopphold && (
                            <Institusjonsopphold {...stegProps} />
                        )}
                    </div>
                );
            }
        )
    );
};

export default RevurderingPage;

const BasicModal = (props: { isOpen: boolean; onClose: () => void }) => {
    return (
        <Modal open={props.isOpen} onClose={props.onClose}>
            <div className={styles.modalContainer}>
                <Heading level="2" size="medium" className={styles.modalTittel}>
                    tittel
                </Heading>
                <div>
                    <p>lawl</p>
                </div>
                <div className={styles.modalKnappContainer}>
                    <Button variant="tertiary" type="button" onClick={props.onClose}>
                        ok
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
