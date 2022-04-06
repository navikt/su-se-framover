import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, ContentContainer, Heading, Loader, StepIndicator } from '@navikt/ds-react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { fetchMe } from '~src/api/meApi';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { Personkort } from '~src/components/personkort/Personkort';
import { useUserContext } from '~src/context/userContext';
import { DelerBoligMed } from '~src/features/søknad/types';
import { pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { trackEvent } from '~src/lib/tracking/amplitude';
import { søknadNesteSteg } from '~src/lib/tracking/trackingEvents';
import * as styles from '~src/pages/søknad/index.module.less';
import messages from '~src/pages/søknad/nb';
import { Steg } from '~src/pages/søknad/steg/Steg';
import { Søknadsteg } from '~src/pages/søknad/types';
import { useAppSelector } from '~src/redux/Store';
import { Rolle } from '~src/types/LoggedInUser';
import { Søknadstype } from '~src/types/Søknad';

export const StartUtfylling = () => {
    const { søker: søkerFraStore } = useAppSelector((s) => s.søker);
    const søknad = useAppSelector((s) => s.soknad);
    const { step } = useParams<{ step: Søknadsteg }>();
    const { formatMessage } = useI18n({ messages });
    const user = useUserContext();
    const history = useHistory();
    const [sisteStartetSteg, setSisteStartetSteg] = useState(0);
    const isLocal = process.env.NODE_ENV === 'development';

    useEffect(() => {
        // check that user is still logged in first
        fetchMe().then(() => {
            if (!RemoteData.isSuccess(søkerFraStore)) {
                return;
            }

            trackEvent(
                søknadNesteSteg({
                    ident: søkerFraStore.value.aktorId,
                    steg: step,
                })
            );
        });
    }, [step]);

    const steg = [
        { label: formatMessage(Søknadsteg.Uførevedtak), step: Søknadsteg.Uførevedtak },
        {
            label: formatMessage(Søknadsteg.FlyktningstatusOppholdstillatelse),
            step: Søknadsteg.FlyktningstatusOppholdstillatelse,
        },
        { label: formatMessage(Søknadsteg.BoOgOppholdINorge), step: Søknadsteg.BoOgOppholdINorge },
        { label: formatMessage(Søknadsteg.DinFormue), step: Søknadsteg.DinFormue },
        {
            label: formatMessage(Søknadsteg.DinInntekt),
            step: Søknadsteg.DinInntekt,
            hjelpetekst: formatMessage('steg.inntekt.hjelpetekst'),
        },
        {
            label: formatMessage(Søknadsteg.EktefellesFormue),
            step: Søknadsteg.EktefellesFormue,
            onlyIf: søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
        },
        {
            label: formatMessage(Søknadsteg.EktefellesInntekt),
            step: Søknadsteg.EktefellesInntekt,
            onlyIf: søknad.boOgOpphold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
            hjelpetekst: formatMessage('steg.inntekt.hjelpetekst'),
        },
        { label: formatMessage(Søknadsteg.ReiseTilUtlandet), step: Søknadsteg.ReiseTilUtlandet },
        søknad.forVeileder.type === Søknadstype.Papirsøknad && user.roller.includes(Rolle.Saksbehandler)
            ? { label: formatMessage(Søknadsteg.InformasjonOmPapirsøknad), step: Søknadsteg.InformasjonOmPapirsøknad }
            : { label: formatMessage(Søknadsteg.ForVeileder), step: Søknadsteg.ForVeileder },
        {
            label: formatMessage(Søknadsteg.Oppsummering),
            step: Søknadsteg.Oppsummering,
            hjelpetekst: formatMessage('steg.oppsummering.hjelpetekst'),
        },
    ].filter((s) => s.onlyIf ?? true);
    const aktivtSteg = steg.findIndex((s) => s.step === step);

    useEffect(() => {
        if (aktivtSteg > sisteStartetSteg) {
            setSisteStartetSteg(aktivtSteg);
        }
    }, [aktivtSteg]);

    const ManglendeData = () => (
        <ContentContainer className={classNames(styles.content, styles.feilmeldingContainer)}>
            <Alert variant="error" className={styles.feilmeldingTekst}>
                {formatMessage('feilmelding.tekst')}
            </Alert>
            <LinkAsButton variant="secondary" href={routes.soknadPersonSøk.createURL({})}>
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
                                        activeStep={aktivtSteg}
                                        hideLabels
                                        onStepChange={(index) => {
                                            const nyttSteg = steg[index];
                                            if (nyttSteg) {
                                                history.push(
                                                    routes.soknadsutfylling.createURL({
                                                        step: nyttSteg.step,
                                                    })
                                                );
                                            }
                                        }}
                                    >
                                        {steg.map((s, index) => (
                                            <StepIndicator.Step
                                                key={index}
                                                disabled={
                                                    isLocal ? false : aktivtSteg !== index && index > sisteStartetSteg
                                                }
                                            >
                                                {s.label}
                                            </StepIndicator.Step>
                                        ))}
                                    </StepIndicator>
                                    <Steg
                                        title={steg.find((s) => s.step === step)?.label || ''}
                                        step={step}
                                        søknad={søknad}
                                        søker={søker}
                                        erSaksbehandler={user.roller.includes(Rolle.Saksbehandler)}
                                        hjelpetekst={steg.find((s) => s.step === step)?.hjelpetekst}
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
