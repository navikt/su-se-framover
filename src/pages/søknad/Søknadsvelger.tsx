import { BodyLong, GuidePanel, Heading, Ingress, Panel } from '@navikt/ds-react';
import { Navigate } from 'react-router-dom';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useUserContext } from '~src/context/userContext';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';

import messages from './nb';
import styles from './søknadsvelger.module.less';

const Søknadsvelger = () => {
    const isPapirsøknad = location.search.includes('papirsoknad');
    const user = useUserContext();
    const { formatMessage } = useI18n({ messages });

    if (user.isProd) {
        return (
            <Navigate
                replace
                to={Routes.soknadtema.createURL({ papirsøknad: isPapirsøknad, soknadstema: Routes.URL_TEMA_UFØRE })}
            />
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
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
        </div>
    );
};

export default Søknadsvelger;
