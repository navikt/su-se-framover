import { BodyLong, GuidePanel, Heading, Ingress, Panel } from '@navikt/ds-react';
import * as React from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';

import { FeatureToggle } from '~src/api/featureToggleApi';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useFeatureToggle } from '~src/lib/featureToggles';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { SøknadContext } from '~src/pages/søknad/index';

import messages from './nb';
import * as styles from './søknadsvelger.module.less';

const Søknadsvelger = () => {
    const { isPapirsøknad } = useOutletContext<SøknadContext>();
    const { formatMessage } = useI18n({ messages });

    if (!useFeatureToggle(FeatureToggle.Alder)) {
        return (
            <Navigate
                replace
                to={Routes.soknadtema.createURL({ papirsøknad: isPapirsøknad, soknadstema: Routes.URL_TEMA_UFØRE })}
            />
        );
    }

    return (
        <div>
            <GuidePanel>
                <BodyLong>
                    {formatMessage('velg-grupper', {
                        strong: (text) => <strong>{text}</strong>,
                        br: () => <br />,
                    })}
                </BodyLong>
            </GuidePanel>

            <Heading className={styles.tittel} level="1" size="xlarge" spacing>
                {formatMessage('velg-tittel')}
            </Heading>
            <Ingress spacing>{formatMessage('velg-undertittel')}</Ingress>

            <div className={styles.linkgruppe}>
                <Panel border>
                    <Heading level="2" size="medium">
                        {formatMessage('velg-alder-tittel')}
                    </Heading>
                    <Ingress>{formatMessage('alder-beskrivelse')}</Ingress>

                    <LinkAsButton
                        variant="secondary"
                        href={Routes.soknadtema.createURL({
                            papirsøknad: isPapirsøknad,
                            soknadstema: Routes.URL_TEMA_ALDER,
                        })}
                    >
                        {formatMessage('alder-lenke')}
                    </LinkAsButton>
                </Panel>
                <Panel border>
                    <Heading level="2" size="medium">
                        {formatMessage('velg-ufør-tittel')}
                    </Heading>
                    <Ingress>{formatMessage('ufør-beskrivelse')}</Ingress>
                    <LinkAsButton
                        variant="secondary"
                        href={Routes.soknadtema.createURL({
                            papirsøknad: isPapirsøknad,
                            soknadstema: Routes.URL_TEMA_UFØRE,
                        })}
                    >
                        {formatMessage('ufør-lenke')}
                    </LinkAsButton>
                </Panel>
            </div>
        </div>
    );
};

export default Søknadsvelger;
