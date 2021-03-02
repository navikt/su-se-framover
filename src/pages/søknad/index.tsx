import * as RemoteData from '@devexperts/remote-data-ts';
import NavFrontendSpinner from 'nav-frontend-spinner';
import Stegindikator from 'nav-frontend-stegindikator';
import { Undertittel, Feilmelding, Systemtittel } from 'nav-frontend-typografi';
import * as React from 'react';
import { useEffect } from 'react';
import { IntlShape } from 'react-intl';
import { useParams, useHistory, Link, Switch, Route } from 'react-router-dom';

import { Person } from '~api/personApi';
import { Personkort } from '~components/Personkort';
import { useUserContext } from '~context/userContext';
import { SøknadState } from '~features/søknad/søknad.slice';
import { DelerBoligMed } from '~features/søknad/types';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as routes from '~lib/routes';
import { trackEvent } from '~lib/tracking/amplitude';
import { søknadNesteSteg } from '~lib/tracking/trackingEvents';
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
import Infoside from './steg/infoside/Infoside';
import Inngang from './steg/inngang/Inngang';
import Inntekt from './steg/inntekt/Inntekt';
import Kvittering from './steg/kvittering/Kvittering';
import Oppsummering from './steg/oppsummering/Oppsummering';
import Uførevedtak from './steg/uførevedtak/Uførevedtak';
import Utenlandsopphold from './steg/utenlandsopphold/Utenlandsopphold';
import { Søknadsteg } from './types';

const Steg = (props: {
    title: string;
    step: Søknadsteg;
    søknad: SøknadState;
    søker: Person;
    intl: IntlShape;
    erSaksbehandler: boolean;
    hjelpetekst: string | undefined;
}) => {
    const sectionRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (sectionRef.current) {
            sectionRef.current.focus();
        }
    }, [props.step]);

    return (
        <section aria-labelledby="steg-heading" className={styles.stegContainer}>
            <div className={styles.stegHeadingContainer} ref={sectionRef} tabIndex={-1}>
                <Undertittel tag="h3" id="steg-heading">
                    {props.title}
                </Undertittel>
                {props.hjelpetekst}
            </div>
            {showSteg(props.step, props.søknad, props.søker, props.erSaksbehandler)}
        </section>
    );
};

const showSteg = (step: Søknadsteg, søknad: SøknadState, søker: Person, erSaksbehandler: boolean) => {
    const avbrytUrl =
        søknad.forVeileder.type === Søknadstype.Papirsøknad && erSaksbehandler
            ? routes.soknadPersonSøk.createURL({ papirsøknad: true })
            : routes.soknadPersonSøk.createURL({});

    switch (step) {
        case Søknadsteg.Uførevedtak:
            return (
                <Uførevedtak
                    forrigeUrl={avbrytUrl}
                    nesteUrl={routes.soknadsutfylling.createURL({
                        step: Søknadsteg.FlyktningstatusOppholdstillatelse,
                    })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.FlyktningstatusOppholdstillatelse:
            return (
                <FlyktningstatusOppholdstillatelse
                    forrigeUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.Uførevedtak })}
                    nesteUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.BoOgOppholdINorge })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.BoOgOppholdINorge:
            return (
                <BoOgOppholdINorge
                    forrigeUrl={routes.soknadsutfylling.createURL({
                        step: Søknadsteg.FlyktningstatusOppholdstillatelse,
                    })}
                    nesteUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.DinFormue })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.DinFormue:
            return (
                <Formue
                    forrigeUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.BoOgOppholdINorge })}
                    nesteUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.DinInntekt })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.DinInntekt:
            return (
                <Inntekt
                    forrigeUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.DinFormue })}
                    nesteUrl={
                        søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
                            ? routes.soknadsutfylling.createURL({ step: Søknadsteg.EktefellesFormue })
                            : routes.soknadsutfylling.createURL({ step: Søknadsteg.ReiseTilUtlandet })
                    }
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.EktefellesFormue:
            return (
                <EktefellesFormue
                    forrigeUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.DinInntekt })}
                    nesteUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.EktefellesInntekt })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.EktefellesInntekt:
            return (
                <EktefellesInntekt
                    forrigeUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.EktefellesFormue })}
                    nesteUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.ReiseTilUtlandet })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.ReiseTilUtlandet:
            return (
                <Utenlandsopphold
                    forrigeUrl={
                        søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER
                            ? routes.soknadsutfylling.createURL({ step: Søknadsteg.EktefellesInntekt })
                            : routes.soknadsutfylling.createURL({ step: Søknadsteg.DinInntekt })
                    }
                    nesteUrl={routes.soknadsutfylling.createURL({
                        step:
                            søknad.forVeileder.type === Søknadstype.DigitalSøknad
                                ? Søknadsteg.ForVeileder
                                : Søknadsteg.InformasjonOmPapirsøknad,
                    })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.ForVeileder:
            return (
                <ForVeileder
                    søker={søker}
                    forrigeUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.ReiseTilUtlandet })}
                    nesteUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.Oppsummering })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.InformasjonOmPapirsøknad:
            return (
                <InformasjonOmPapirsøknad
                    forrigeUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.ReiseTilUtlandet })}
                    nesteUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.Oppsummering })}
                    avbrytUrl={avbrytUrl}
                />
            );
        case Søknadsteg.Oppsummering:
            return (
                <Oppsummering
                    forrigeUrl={routes.soknadsutfylling.createURL({
                        step:
                            søknad.forVeileder.type === Søknadstype.DigitalSøknad
                                ? Søknadsteg.ForVeileder
                                : Søknadsteg.InformasjonOmPapirsøknad,
                    })}
                    nesteUrl={routes.soknadsutfylling.createURL({ step: Søknadsteg.Kvittering })}
                    avbrytUrl={avbrytUrl}
                    søker={søker}
                />
            );
        case Søknadsteg.Kvittering:
            return <Kvittering />;
    }
};

const StartUtfylling = () => {
    const { søker: søkerFraStore } = useAppSelector((s) => s.søker);
    const søknad = useAppSelector((s) => s.soknad);
    const { step } = useParams<{ step: Søknadsteg }>();
    const intl = useI18n({ messages });
    const user = useUserContext();
    const history = useHistory();

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
            hjelpetekst: intl.formatMessage({ id: 'steg.inntekt.hjelpetekst' }),
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
            hjelpetekst: intl.formatMessage({ id: 'steg.inntekt.hjelpetekst' }),
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
            hjelpetekst: intl.formatMessage({ id: 'steg.oppsummering.hjelpetekst' }),
        },
    ].filter((s) => (typeof s.onlyIf !== 'undefined' ? s.onlyIf : true));
    const aktivtSteg = steg.findIndex((s) => s.step === step);

    const manglendeData = () => (
        <div>
            <Feilmelding className={styles.feilmeldingTekst}>
                {intl.formatMessage({ id: 'feilmelding.tekst' })}
            </Feilmelding>
            <Link to={routes.soknadPersonSøk.createURL({})} className="knapp">
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
                                <Systemtittel>
                                    <div className={styles.sidetittelContainer}>Søknad for</div>

                                    <div className={styles.personkortContainer}>
                                        <Personkort person={søker} />
                                    </div>
                                </Systemtittel>
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
                                                                      routes.soknadsutfylling.createURL({
                                                                          step: nyttSteg.step,
                                                                      })
                                                                  );
                                                              }
                                                          }
                                                        : undefined
                                                }
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <Steg
                                title={steg.find((s) => s.step === step)?.label || ''}
                                step={step}
                                søknad={søknad}
                                søker={søker}
                                intl={intl}
                                erSaksbehandler={user.roller.includes(Rolle.Saksbehandler)}
                                hjelpetekst={steg.find((s) => s.step === step)?.hjelpetekst}
                            />
                        </>
                    )
                )
            )}
        </div>
    );
};

const index = () => {
    const history = useHistory();
    const isPapirsøknad = history.location.search.includes('papirsoknad');

    return (
        <Switch>
            <Route exact={true} path={routes.soknad.path}>
                <Infoside
                    nesteUrl={routes.soknadPersonSøk.createURL({ papirsøknad: isPapirsøknad ? true : undefined })}
                />
            </Route>
            <Route exact={true} path={routes.soknadPersonSøk.path}>
                <Inngang
                    nesteUrl={
                        isPapirsøknad
                            ? routes.soknadsutfylling.createURL({ step: Søknadsteg.Uførevedtak, papirsøknad: true })
                            : routes.soknadsutfylling.createURL({ step: Søknadsteg.Uførevedtak })
                    }
                />
            </Route>
            <Route exact={true} path={routes.soknadsutfylling.path}>
                <StartUtfylling />
            </Route>
        </Switch>
    );
};

export default index;
