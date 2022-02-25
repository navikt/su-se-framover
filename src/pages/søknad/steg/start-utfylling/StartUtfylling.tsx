import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, ContentContainer, Heading, Loader, StepIndicator } from '@navikt/ds-react';
import classNames from 'classnames';
import { useEffect } from 'react';
import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { fetchMe } from '~api/meApi';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import { Personkort } from '~components/personkort/Personkort';
import { useUserContext } from '~context/userContext';
import { DelerBoligMed } from '~features/søknad/types';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/i18n';
import * as routes from '~lib/routes';
import { trackEvent } from '~lib/tracking/amplitude';
import { søknadNesteSteg } from '~lib/tracking/trackingEvents';
import styles from '~pages/søknad/index.module.less';
import messages from '~pages/søknad/nb';
import { Steg } from '~pages/søknad/steg/Steg';
import { Søknadsteg } from '~pages/søknad/types';
import { useAppSelector } from '~redux/Store';
import { Rolle } from '~types/LoggedInUser';
import { Søknadstype } from '~types/Søknad';

export const StartUtfylling = () => {
    const { søker: søkerFraStore } = useAppSelector((s) => s.søker);
    const søknad = useAppSelector((s) => s.soknad);
    const { step } = useParams<{ step: Søknadsteg }>();
    const { formatMessage } = useI18n({ messages });
    const user = useUserContext();
    const history = useHistory();

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
                                        // steg={steg.map((s, index) => ({
                                        //     index,
                                        //     label: s.label,
                                        // }))}
                                        activeStep={aktivtSteg}
                                        hideLabels
                                        onStepChange={
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
                                    >
                                        {steg.map((s, index) => (
                                            <StepIndicator.Step key={index}>{s.label}</StepIndicator.Step>
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
