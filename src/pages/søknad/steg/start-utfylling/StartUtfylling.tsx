import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader, Page, Stepper } from '@navikt/ds-react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchMe } from '~src/api/meApi';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { Personkort } from '~src/components/personkort/Personkort';
import { useUserContext } from '~src/context/userContext';
import * as personSlice from '~src/features/person/person.slice';
import { DelerBoligMed } from '~src/features/søknad/types';
import { pipe } from '~src/lib/fp';
import * as routes from '~src/lib/routes';
import { soknadsutfylling, useRouteParams } from '~src/lib/routes';
import styles from '~src/pages/søknad/index.module.less';
import { Steg } from '~src/pages/søknad/steg/Steg';
import { Alderssteg, Fellessteg, Søknadssteg, Uføresteg } from '~src/pages/søknad/types';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import { Rolle } from '~src/types/LoggedInUser';
import { Sakstype } from '~src/types/Sak';
import { Søknadstype } from '~src/types/Søknadinnhold';

const StartUtfylling = () => {
    const { søker: søkerFraStore } = useAppSelector((s) => s.personopplysninger);
    const søknad = useAppSelector((s) => s.soknad);
    const { step, soknadstema } = useRouteParams<typeof soknadsutfylling>();
    const sakstype = routes.sakstypeFraTemaIUrl(soknadstema);

    const user = useUserContext();
    const navigate = useNavigate();
    const [sisteStartetSteg, setSisteStartetSteg] = useState(0);
    const isLocal = process.env.NODE_ENV === 'development';
    const dispatch = useAppDispatch();

    useEffect(() => {
        // check that user is still logged in first
        fetchMe().then(() => {
            if (!RemoteData.isSuccess(søkerFraStore)) {
                return;
            }
        });
    }, [step]);

    const steg = [
        { step: Uføresteg.Uførevedtak, onlyIf: sakstype === Sakstype.Uføre },
        {
            step: Uføresteg.FlyktningstatusOppholdstillatelse,
            onlyIf: sakstype === Sakstype.Uføre,
        },
        {
            step: Alderssteg.Alderspensjon,
            onlyIf: sakstype === Sakstype.Alder,
        },
        {
            step: Alderssteg.Oppholdstillatelse,
            onlyIf: sakstype === Sakstype.Alder,
        },
        { step: Fellessteg.BoOgOppholdINorge },
        { step: Fellessteg.DinFormue },
        {
            step: Fellessteg.DinInntekt,
            hjelpetekst: 'Oppgi brutto beløp (før skatt).',
        },
        {
            step: Fellessteg.EktefellesFormue,
            onlyIf: søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
        },
        {
            step: Fellessteg.EktefellesInntekt,
            onlyIf: søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
            hjelpetekst: 'Oppgi brutto beløp (før skatt).',
        },
        { step: Fellessteg.ReiseTilUtlandet },
        søknad.forVeileder.type === Søknadstype.Papirsøknad && user.roller.includes(Rolle.Saksbehandler)
            ? { step: Fellessteg.InformasjonOmPapirsøknad }
            : { step: Fellessteg.ForVeileder },
        {
            step: Fellessteg.Oppsummering,
            hjelpetekst:
                'Les gjennom oppsummeringen før du sender inn søknaden. Hvis du trenger å gjøre endringer, kan du gjøre det ved å klikke på lenken under hver del.',
        },
    ].filter((s) => s.onlyIf ?? true);

    const aktivtStegIndex = steg.findIndex((s) => s.step === step);
    const aktivtSteg = steg[aktivtStegIndex];

    useEffect(() => {
        if (aktivtStegIndex > sisteStartetSteg) {
            setSisteStartetSteg(aktivtStegIndex);
        }
    }, [aktivtStegIndex]);

    const ManglendeData = () => (
        <Page>
            <Page.Block className={classNames(styles.content, styles.feilmeldingContainer)}>
                <Alert variant="error" className={styles.feilmeldingTekst}>
                    En feil oppstod
                </Alert>
                <LinkAsButton
                    variant="secondary"
                    href={routes.soknadPersonSøk.createURL({
                        soknadstema: routes.urlForSakstype(sakstype),
                    })}
                >
                    Start ny søknad
                </LinkAsButton>
            </Page.Block>
        </Page>
    );

    const StartSøknadMedDefaultPerson = () => {
        return (
            <div>
                <Button
                    type="button"
                    onClick={() => {
                        dispatch(personSlice.default.actions.setSøker());
                        navigate(
                            routes.soknadsutfylling.createURL({
                                step: sakstype === Sakstype.Uføre ? Uføresteg.Uførevedtak : Alderssteg.Alderspensjon,
                                soknadstema: routes.urlForSakstype(sakstype),
                                papirsøknad:
                                    søknad.forVeileder.type === Søknadstype.Papirsøknad &&
                                    user.roller.includes(Rolle.Saksbehandler),
                            }),
                        );
                    }}
                >
                    Start søknad med en default person
                </Button>
                <ManglendeData />
            </div>
        );
    };

    return (
        <div>
            {pipe(
                søkerFraStore,
                RemoteData.fold(
                    () => (isLocal ? <StartSøknadMedDefaultPerson /> : <ManglendeData />),
                    () => <Loader />,
                    () => <ManglendeData />,
                    (søker) => (
                        <>
                            <Personkort person={søker} variant="wide" />
                            <div className={styles.content}>
                                <div className={styles.stepperContainer}>
                                    <Stepper
                                        activeStep={aktivtStegIndex + 1}
                                        orientation={'horizontal'}
                                        onStepChange={(index) => {
                                            navigate(
                                                routes.soknadsutfylling.createURL({
                                                    step: steg[index - 1].step,
                                                    soknadstema: routes.urlForSakstype(sakstype),
                                                }),
                                            );
                                        }}
                                    >
                                        {steg.map((s) => (
                                            <Stepper.Step key={s.step} as="button">
                                                {' '}
                                            </Stepper.Step>
                                        ))}
                                    </Stepper>
                                </div>
                                <Steg
                                    title={stegTilTitle(aktivtSteg!.step)}
                                    step={step!}
                                    søknad={søknad}
                                    søker={søker}
                                    sakstype={sakstype}
                                    erSaksbehandler={user.roller.includes(Rolle.Saksbehandler)}
                                    hjelpetekst={aktivtSteg?.hjelpetekst}
                                />
                            </div>
                        </>
                    ),
                ),
            )}
        </div>
    );
};

const stegTilTitle = (steg: Søknadssteg) => {
    switch (steg) {
        case Uføresteg.Uførevedtak:
            return 'Uførevedtak';
        case Uføresteg.FlyktningstatusOppholdstillatelse:
            return 'Flyktningstatus';
        case Alderssteg.Alderspensjon:
            return 'Alderspensjon';
        case Alderssteg.Oppholdstillatelse:
            return 'Oppholdstillatelse';
        case Fellessteg.BoOgOppholdINorge:
            return 'Bo og opphold i Norge';
        case Fellessteg.DinFormue:
            return 'Din formue';
        case Fellessteg.DinInntekt:
            return 'Din inntekt';
        case Fellessteg.EktefellesFormue:
            return 'Ektefelle/samboers formue';
        case Fellessteg.EktefellesInntekt:
            return 'Ektefelle/samboers inntekt';
        case Fellessteg.ReiseTilUtlandet:
            return 'Reise til utlandet';
        case Fellessteg.ForVeileder:
            return 'For veileder';
        case Fellessteg.InformasjonOmPapirsøknad:
            return 'Informasjon om søknaden';
        case Fellessteg.Oppsummering:
            return 'Oppsummering';
    }
};

export default StartUtfylling;
