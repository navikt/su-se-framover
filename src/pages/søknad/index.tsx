import * as RemoteData from '@devexperts/remote-data-ts';
import NavFrontendSpinner from 'nav-frontend-spinner';
import Stegindikator from 'nav-frontend-stegindikator';
import { Undertittel, Feilmelding, Systemtittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';

import { Person } from '~api/personApi';
import { Personkort } from '~components/Personkort';
import { useUserContext } from '~context/userContext';
import { SøknadState } from '~features/søknad/søknad.slice';
import { DelerBoligMed } from '~features/søknad/types';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as routes from '~lib/routes';
import { trackEvent, søknadNesteSteg } from '~lib/tracking/trackingEvents';
import { useAppSelector } from '~redux/Store';
import { Rolle } from '~types/LoggedInUser';
import { Søknadstype } from '~types/Søknad';

import styles from './index.module.less';
import messages from './nb';
import BoOgOppholdINorge from './steg/bo-og-opphold-i-norge/Bo-og-opphold-i-norge';
import EktefellesFormue from './steg/ektefelle/EktefellesFormue';
import EktefellesInntekt from './steg/ektefelle/EktefellesInntekt';
import FlyktningstatusOppholdstillatelse from './steg/flyktningstatus-oppholdstillatelse/Flyktningstatus-oppholdstillatelse';
import ForVeileder from './steg/for-veileder/ForVeileder';
import Formue from './steg/formue/DinFormue';
import InformasjonOmPapirsøknad from './steg/informasjon-om-papirsøknad/InformasjonOmPapirsøknad';
import Inngang from './steg/inngang/Inngang';
import Inntekt from './steg/inntekt/Inntekt';
import Kvittering from './steg/kvittering/Kvittering';
import Oppsummering from './steg/oppsummering/Oppsummering';
import Uførevedtak from './steg/uførevedtak/Uførevedtak';
import Utenlandsopphold from './steg/utenlandsopphold/Utenlandsopphold';
import { Søknadsteg } from './types';

const showSteg = (step: Søknadsteg, søknad: SøknadState, søker: Person) => {
    switch (step) {
        case Søknadsteg.Uførevedtak:
            return (
                <Uførevedtak
                    forrigeUrl={routes.soknad.createURL({ step: null })}
                    nesteUrl={routes.soknad.createURL({
                        step: Søknadsteg.FlyktningstatusOppholdstillatelse,
                    })}
                />
            );
        case Søknadsteg.FlyktningstatusOppholdstillatelse:
            return (
                <FlyktningstatusOppholdstillatelse
                    forrigeUrl={routes.soknad.createURL({ step: Søknadsteg.Uførevedtak })}
                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.BoOgOppholdINorge })}
                />
            );
        case Søknadsteg.BoOgOppholdINorge:
            return (
                <BoOgOppholdINorge
                    forrigeUrl={routes.soknad.createURL({
                        step: Søknadsteg.FlyktningstatusOppholdstillatelse,
                    })}
                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.DinFormue })}
                />
            );
        case Søknadsteg.DinFormue:
            return (
                <Formue
                    forrigeUrl={routes.soknad.createURL({ step: Søknadsteg.BoOgOppholdINorge })}
                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.DinInntekt })}
                />
            );
        case Søknadsteg.DinInntekt:
            return (
                <Inntekt
                    forrigeUrl={routes.soknad.createURL({ step: Søknadsteg.DinFormue })}
                    nesteUrl={
                        søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
                            ? routes.soknad.createURL({ step: Søknadsteg.EktefellesFormue })
                            : routes.soknad.createURL({ step: Søknadsteg.ReiseTilUtlandet })
                    }
                />
            );
        case Søknadsteg.EktefellesFormue:
            return (
                <EktefellesFormue
                    forrigeUrl={routes.soknad.createURL({ step: Søknadsteg.DinInntekt })}
                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.EktefellesInntekt })}
                />
            );
        case Søknadsteg.EktefellesInntekt:
            return (
                <EktefellesInntekt
                    forrigeUrl={routes.soknad.createURL({ step: Søknadsteg.EktefellesFormue })}
                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.ReiseTilUtlandet })}
                />
            );
        case Søknadsteg.ReiseTilUtlandet:
            return (
                <Utenlandsopphold
                    forrigeUrl={
                        søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
                            ? routes.soknad.createURL({ step: Søknadsteg.EktefellesInntekt })
                            : routes.soknad.createURL({ step: Søknadsteg.DinInntekt })
                    }
                    nesteUrl={routes.soknad.createURL({
                        step:
                            søknad.forVeileder.type === Søknadstype.DigitalSøknad
                                ? Søknadsteg.ForVeileder
                                : Søknadsteg.InformasjonOmPapirsøknad,
                    })}
                />
            );
        case Søknadsteg.ForVeileder:
            return (
                <ForVeileder
                    søker={søker}
                    forrigeUrl={routes.soknad.createURL({ step: Søknadsteg.ReiseTilUtlandet })}
                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.Oppsummering })}
                />
            );
        case Søknadsteg.InformasjonOmPapirsøknad:
            return (
                <InformasjonOmPapirsøknad
                    forrigeUrl={routes.soknad.createURL({ step: Søknadsteg.ReiseTilUtlandet })}
                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.Oppsummering })}
                />
            );
        case Søknadsteg.Oppsummering:
            return (
                <Oppsummering
                    forrigeUrl={routes.soknad.createURL({
                        step:
                            søknad.forVeileder.type === Søknadstype.DigitalSøknad
                                ? Søknadsteg.ForVeileder
                                : Søknadsteg.InformasjonOmPapirsøknad,
                    })}
                    nesteUrl={routes.soknad.createURL({ step: Søknadsteg.Kvittering })}
                    søker={søker}
                />
            );
        case Søknadsteg.Kvittering:
            return <Kvittering />;
    }
};

const index = () => {
    const { søker: søkerFraStore } = useAppSelector((s) => s.søker);
    const søknad = useAppSelector((s) => s.soknad);
    const { step } = useParams<{ step: Søknadsteg }>();
    const history = useHistory();
    const intl = useI18n({ messages });
    const user = useUserContext();

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
            label: intl.formatMessage({ id: 'steg.uforevedtak' }),
            step: Søknadsteg.Uførevedtak,
        },
        {
            label: intl.formatMessage({ id: 'steg.flyktningstatus' }),
            step: Søknadsteg.FlyktningstatusOppholdstillatelse,
        },
        {
            label: intl.formatMessage({ id: 'steg.boOgOppholdINorge' }),
            step: Søknadsteg.BoOgOppholdINorge,
        },
        {
            label: intl.formatMessage({ id: 'steg.formue' }),
            step: Søknadsteg.DinFormue,
        },
        {
            label: intl.formatMessage({ id: 'steg.inntekt' }),
            step: Søknadsteg.DinInntekt,
        },
        {
            label: intl.formatMessage({ id: 'steg.ektefellesFormue' }),
            step: Søknadsteg.EktefellesFormue,
            onlyIf: søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
        },
        {
            label: intl.formatMessage({ id: 'steg.ektefellesInntekt' }),
            step: Søknadsteg.EktefellesInntekt,
            onlyIf: søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
        },
        {
            label: intl.formatMessage({ id: 'steg.utenlandsopphold' }),
            step: Søknadsteg.ReiseTilUtlandet,
        },
        søknad.forVeileder.type === Søknadstype.Papirsøknad && user.roller.includes(Rolle.Saksbehandler)
            ? {
                  label: intl.formatMessage({ id: 'steg.informasjonOmPapirsøknad' }),
                  step: Søknadsteg.InformasjonOmPapirsøknad,
              }
            : {
                  label: intl.formatMessage({ id: 'steg.forVeileder' }),
                  step: Søknadsteg.ForVeileder,
              },
        {
            label: intl.formatMessage({ id: 'steg.oppsummering' }),
            step: Søknadsteg.Oppsummering,
        },
    ].filter((s) => (typeof s.onlyIf !== 'undefined' ? s.onlyIf : true));
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
                                    <Systemtittel>Søknad for</Systemtittel>
                                </div>

                                <div className={styles.personkortContainer}>
                                    <Personkort person={søker} />
                                </div>

                                {step !== Søknadsteg.Kvittering && (
                                    <>
                                        <div className={styles.stegindikatorContainer}>
                                            <Stegindikator
                                                steg={steg.map((s, index) => ({
                                                    index,
                                                    label: s.label,
                                                }))}
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
                                        <Undertittel tag="h3">{steg.find((s) => s.step === step)?.label}</Undertittel>
                                        {(step === Søknadsteg.DinInntekt || step === Søknadsteg.EktefellesInntekt) && (
                                            <p>{intl.formatMessage({ id: 'steg.inntekt.hjelpetekst' })}</p>
                                        )}
                                    </>
                                )}
                            </div>
                            {showSteg(step, søknad, søker)}
                        </>
                    )
                )
            )}
        </div>
    );
};

export default index;
