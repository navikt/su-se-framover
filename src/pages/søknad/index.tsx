import * as RemoteData from '@devexperts/remote-data-ts';
import NavFrontendSpinner from 'nav-frontend-spinner';
import Stegindikator from 'nav-frontend-stegindikator';
import { Innholdstittel, Undertittel, Feilmelding } from 'nav-frontend-typografi';
import * as React from 'react';
import { useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';

import { Personkort } from '~components/Personkort';
import { DelerBoligMed } from '~features/søknad/types';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as routes from '~lib/routes';
import { trackEvent, søknadNesteSteg } from '~lib/tracking/trackingEvents';
import { useAppSelector } from '~redux/Store';

import styles from './index.module.less';
import BoOgOppholdINorge from './steg/bo-og-opphold-i-norge/Bo-og-opphold-i-norge';
import EktefellesFormue from './steg/ektefelles-formue/EktefellesFormue';
import FlyktningstatusOppholdstillatelse from './steg/flyktningstatus-oppholdstillatelse/Flyktningstatus-oppholdstillatelse';
import ForVeileder from './steg/for-veileder/ForVeileder';
import Formue from './steg/formue/DinFormue';
import Inngang from './steg/inngang/Inngang';
import Inntekt from './steg/inntekt/Inntekt';
import Kvittering from './steg/kvittering/Kvittering';
import Oppsummering from './steg/oppsummering/Oppsummering';
import Uførevedtak from './steg/uførevedtak/Uførevedtak';
import Utenlandsopphold from './steg/utenlandsopphold/Utenlandsopphold';
import { Søknadsteg } from './types';

const messages = {
    tittel: 'Søknad for',
    'steg.uforevedtak': 'Uførevedtak',
    'steg.flyktningstatus': 'Flyktningstatus',
    'steg.boOgOppholdINorge': 'Bo og opphold i Norge',
    'steg.formue': 'Din formue',
    'steg.inntekt': 'Din inntekt',
    'steg.ektefellesformue': 'Ektefelle/samboers formue',
    'steg.utenlandsopphold': 'Reise til utlandet',
    'steg.forVeileder': 'For Veileder',
    'steg.oppsummering': 'Oppsummering',
    'steg.neste': 'Neste',
    'steg.forrige': 'Forrige',
    'feilmelding.tekst': 'En feil oppstod',
    'feilmelding.knapp': 'Start ny søknad',
};

const index = () => {
    const { søker: søkerFraStore } = useAppSelector((s) => s.søker);
    const borMedEktefelleSamboer = useAppSelector((s) => s.soknad.boOgOpphold.delerBoligMed);
    const { step } = useParams<{ step: Søknadsteg }>();
    const history = useHistory();
    const intl = useI18n({ messages });

    useEffect(() => {
        if (!RemoteData.isSuccess(søkerFraStore)) {
            return;
        }

        trackEvent(
            søknadNesteSteg({
                ident: søkerFraStore.value.aktorId,
                steg: step,
            })
        );
    }, [step]);

    if (!step) {
        return <Inngang nesteUrl={routes.soknad.createURL({ step: Søknadsteg.Uførevedtak })} />;
    }

    const steg = [
        {
            index: 0,
            label: intl.formatMessage({ id: 'steg.uforevedtak' }),
            step: Søknadsteg.Uførevedtak,
        },
        {
            index: 1,
            label: intl.formatMessage({ id: 'steg.flyktningstatus' }),
            step: Søknadsteg.FlyktningstatusOppholdstillatelse,
        },
        {
            index: 2,
            label: intl.formatMessage({ id: 'steg.boOgOppholdINorge' }),
            step: Søknadsteg.BoOgOppholdINorge,
        },
        {
            index: 3,
            label: intl.formatMessage({ id: 'steg.formue' }),
            step: Søknadsteg.DinFormue,
        },
        {
            index: 4,
            label: intl.formatMessage({ id: 'steg.inntekt' }),
            step: Søknadsteg.DinInntekt,
        },
        {
            index: 5,
            label: intl.formatMessage({ id: 'steg.ektefellesformue' }),
            step: Søknadsteg.EktefellesFormue,
        },
        {
            index: 6,
            label: intl.formatMessage({ id: 'steg.utenlandsopphold' }),
            step: Søknadsteg.ReiseTilUtlandet,
        },
        {
            index: 7,
            label: intl.formatMessage({ id: 'steg.forVeileder' }),
            step: Søknadsteg.ForVeileder,
        },
        {
            index: 8,
            label: intl.formatMessage({ id: 'steg.oppsummering' }),
            step: Søknadsteg.Oppsummering,
        },
    ];
    const aktivtSteg = steg.findIndex((s) => s.step === step);

    const manglendeData = () => (
        <div>
            <Feilmelding className={styles.feilmeldingTekst}>
                {intl.formatMessage({ id: 'feilmelding.tekst' })}
            </Feilmelding>
            <Link to={routes.soknad.createURL({ step: null })} className="knapp">
                {intl.formatMessage({ id: 'feilmelding.knapp' })}
            </Link>
        </div>
    );

    return (
        <div className={styles.container}>
            {pipe(
                søkerFraStore,
                RemoteData.fold(
                    manglendeData,
                    () => <NavFrontendSpinner />,
                    manglendeData,
                    (søker) => (
                        <>
                            <div className={styles.headerContainer}>
                                <div className={styles.sidetittelContainer}>
                                    <Innholdstittel>{intl.formatMessage({ id: 'tittel' })}</Innholdstittel>
                                </div>

                                <div className={styles.personkortContainer}>
                                    <Personkort person={søker} />
                                </div>
                                <>
                                    <div className={styles.stegindikatorContainer}>
                                        <Stegindikator
                                            steg={steg
                                                .filter(
                                                    (s) =>
                                                        borMedEktefelleSamboer === DelerBoligMed.EKTEMAKE_SAMBOER ||
                                                        s.step !== Søknadsteg.EktefellesFormue
                                                )
                                                .map((s) => {
                                                    console.log(s);
                                                    return {
                                                        index: s.index,
                                                        label: s.label,
                                                    };
                                                })}
                                            aktivtSteg={aktivtSteg}
                                            visLabel={false}
                                            onChange={
                                                process.env.NODE_ENV === 'development'
                                                    ? (index) => {
                                                          const nyttSteg = steg[index];
                                                          if (nyttSteg) {
                                                              history.push(
                                                                  routes.soknad.createURL({ step: nyttSteg.step })
                                                              );
                                                          }
                                                      }
                                                    : undefined
                                            }
                                        />
                                    </div>
                                    <Undertittel>{steg.find((s) => s.step === step)?.label}</Undertittel>
                                </>
                            </div>
                            {step === Søknadsteg.Uførevedtak ? (
                                <Uførevedtak
                                    forrigeUrl={routes.soknad.createURL({ step: null })}
                                    nesteUrl={routes.soknad.createURL({
                                        step: Søknadsteg.FlyktningstatusOppholdstillatelse,
                                    })}
                                />
                            ) : step === Søknadsteg.FlyktningstatusOppholdstillatelse ? (
                                <FlyktningstatusOppholdstillatelse
                                    forrigeUrl={routes.soknad.createURL({ step: Søknadsteg.Uførevedtak })}
                                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.BoOgOppholdINorge })}
                                />
                            ) : step === Søknadsteg.BoOgOppholdINorge ? (
                                <BoOgOppholdINorge
                                    forrigeUrl={routes.soknad.createURL({
                                        step: Søknadsteg.FlyktningstatusOppholdstillatelse,
                                    })}
                                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.DinFormue })}
                                />
                            ) : step === Søknadsteg.DinFormue ? (
                                <Formue
                                    forrigeUrl={routes.soknad.createURL({ step: Søknadsteg.BoOgOppholdINorge })}
                                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.DinInntekt })}
                                />
                            ) : step === Søknadsteg.DinInntekt ? (
                                <Inntekt
                                    forrigeUrl={routes.soknad.createURL({ step: Søknadsteg.DinFormue })}
                                    nesteUrl={
                                        borMedEktefelleSamboer === DelerBoligMed.EKTEMAKE_SAMBOER
                                            ? routes.soknad.createURL({ step: Søknadsteg.EktefellesFormue })
                                            : routes.soknad.createURL({ step: Søknadsteg.ReiseTilUtlandet })
                                    }
                                />
                            ) : step === Søknadsteg.EktefellesFormue ? (
                                <EktefellesFormue
                                    forrigeUrl={routes.soknad.createURL({ step: Søknadsteg.DinInntekt })}
                                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.ReiseTilUtlandet })}
                                />
                            ) : step === Søknadsteg.ReiseTilUtlandet ? (
                                <Utenlandsopphold
                                    forrigeUrl={
                                        borMedEktefelleSamboer === DelerBoligMed.EKTEMAKE_SAMBOER
                                            ? routes.soknad.createURL({ step: Søknadsteg.EktefellesFormue })
                                            : routes.soknad.createURL({ step: Søknadsteg.DinInntekt })
                                    }
                                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.ForVeileder })}
                                />
                            ) : step === Søknadsteg.ForVeileder ? (
                                <ForVeileder
                                    forrigeUrl={routes.soknad.createURL({ step: Søknadsteg.ReiseTilUtlandet })}
                                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.Oppsummering })}
                                />
                            ) : step === Søknadsteg.Oppsummering ? (
                                <Oppsummering
                                    forrigeUrl={routes.soknad.createURL({ step: Søknadsteg.ForVeileder })}
                                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.Kvittering })}
                                    søker={søker}
                                />
                            ) : step === Søknadsteg.Kvittering ? (
                                <Kvittering />
                            ) : (
                                '404'
                            )}
                        </>
                    )
                )
            )}
        </div>
    );
};

export default index;
