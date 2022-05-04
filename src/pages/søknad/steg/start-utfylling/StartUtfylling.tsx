import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, ContentContainer, Heading, Loader, StepIndicator } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchMe } from '~src/api/meApi';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { Personkort } from '~src/components/personkort/Personkort';
import { useUserContext } from '~src/context/userContext';
import { DelerBoligMed } from '~src/features/søknad/types';
import { pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { soknadsutfylling, useRouteParams } from '~src/lib/routes';
import * as styles from '~src/pages/søknad/index.module.less';
import messages from '~src/pages/søknad/nb';
import { Steg } from '~src/pages/søknad/steg/Steg';
import { Alderssteg, Fellessteg, Uføresteg } from '~src/pages/søknad/types';
import { useAppSelector } from '~src/redux/Store';
import { Rolle } from '~src/types/LoggedInUser';
import { Søknadstema, Søknadstype } from '~src/types/Søknad';

const StartUtfylling = () => {
    const { søker: søkerFraStore } = useAppSelector((s) => s.søker);
    const søknad = useAppSelector((s) => s.soknad);
    const { step, soknadstema } = useRouteParams<typeof soknadsutfylling>();
    const { formatMessage } = useI18n({ messages });
    const user = useUserContext();
    const navigate = useNavigate();
    const [sisteStartetSteg, setSisteStartetSteg] = useState(0);
    const isLocal = process.env.NODE_ENV === 'development';

    useEffect(() => {
        // check that user is still logged in first
        fetchMe().then(() => {
            if (!RemoteData.isSuccess(søkerFraStore)) {
                return;
            }
        });
    }, [step]);

    const steg = [
        { step: Uføresteg.Uførevedtak, onlyIf: soknadstema === Søknadstema.Uføre },
        {
            step: Uføresteg.FlyktningstatusOppholdstillatelse,
            onlyIf: soknadstema === Søknadstema.Uføre,
        },
        {
            step: Alderssteg.Alderspensjon,
            onlyIf: soknadstema === Søknadstema.Alder,
        },
        { step: Fellessteg.BoOgOppholdINorge },
        { step: Fellessteg.DinFormue },
        {
            step: Fellessteg.DinInntekt,
            hjelpetekst: formatMessage('steg.inntekt.hjelpetekst'),
        },
        {
            step: Fellessteg.EktefellesFormue,
            onlyIf: søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
        },
        {
            step: Fellessteg.EktefellesInntekt,
            onlyIf: søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
            hjelpetekst: formatMessage('steg.inntekt.hjelpetekst'),
        },
        { step: Fellessteg.ReiseTilUtlandet },
        søknad.forVeileder.type === Søknadstype.Papirsøknad && user.roller.includes(Rolle.Saksbehandler)
            ? { step: Fellessteg.InformasjonOmPapirsøknad }
            : { step: Fellessteg.ForVeileder },
        {
            step: Fellessteg.Oppsummering,
            hjelpetekst: formatMessage('steg.oppsummering.hjelpetekst'),
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
        <ContentContainer className={classNames(styles.content, styles.feilmeldingContainer)}>
            <Alert variant="error" className={styles.feilmeldingTekst}>
                {formatMessage('feilmelding.tekst')}
            </Alert>
            <LinkAsButton
                variant="secondary"
                href={routes.soknadPersonSøk.createURL({ soknadstema: soknadstema ?? Søknadstema.Uføre })}
            >
                {formatMessage('feilmelding.knapp')}
            </LinkAsButton>
        </ContentContainer>
    );

    return (
        <div>
            {pipe(
                søkerFraStore,
                RemoteData.fold(
                    () => <ManglendeData />,
                    () => <Loader />,
                    () => <ManglendeData />,
                    (søker) => (
                        <>
                            <div className={styles.headerContainer}>
                                <Heading level="2" size="large" className={styles.personkortContainer}>
                                    <Personkort person={søker} variant="wide" />
                                </Heading>
                            </div>
                            <div className={styles.content}>
                                <div className={styles.stegindikatorContainer}>
                                    <StepIndicator
                                        activeStep={aktivtStegIndex}
                                        hideLabels
                                        onStepChange={(index) => {
                                            const nyttSteg = steg[index];
                                            if (nyttSteg) {
                                                navigate(
                                                    routes.soknadsutfylling.createURL({
                                                        step: nyttSteg.step,
                                                        soknadstema: soknadstema ?? Søknadstema.Uføre,
                                                    })
                                                );
                                            }
                                        }}
                                    >
                                        {steg.map((s, index) => (
                                            <StepIndicator.Step
                                                key={index}
                                                disabled={
                                                    isLocal
                                                        ? false
                                                        : aktivtStegIndex !== index && index > sisteStartetSteg
                                                }
                                            >
                                                {formatMessage(s.step)}
                                            </StepIndicator.Step>
                                        ))}
                                    </StepIndicator>
                                    <Steg
                                        title={formatMessage(aktivtSteg?.step ?? Uføresteg.Uførevedtak)}
                                        step={step ?? Uføresteg.Uførevedtak}
                                        søknad={søknad}
                                        søker={søker}
                                        soknadstema={soknadstema ?? Søknadstema.Uføre}
                                        erSaksbehandler={user.roller.includes(Rolle.Saksbehandler)}
                                        hjelpetekst={aktivtSteg?.hjelpetekst}
                                    />
                                </div>
                            </div>
                        </>
                    )
                )
            )}
        </div>
    );
};

export default StartUtfylling;
