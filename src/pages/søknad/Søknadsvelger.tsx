import { BodyLong, BodyShort, GuidePanel, Heading, Panel } from '@navikt/ds-react';
import * as React from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { ALDERSØKNAD_FEATURE_ENABLED } from '~src/lib/featureToggles';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { SøknadContext } from '~src/pages/søknad/index';
import { Søknadstema } from '~src/types/Søknad';

import messages from './nb';
import * as styles from './søknadsvelger.module.less';
import { VelgSoknad } from './types';

const Søknadsvelger = () => {
    const { isPapirsøknad } = useOutletContext<SøknadContext>();
    const { formatMessage } = useI18n({ messages });

    if (!ALDERSØKNAD_FEATURE_ENABLED) {
        return (
            <Navigate
                replace
                to={Routes.soknadtema.createURL({ papirsøknad: isPapirsøknad, soknadstema: Søknadstema.Uføre })}
            />
        );
    }

    return (
        <div>
            <GuidePanel>
                <BodyLong>
                    {formatMessage(VelgSoknad.Grupper, {
                        strong: (text) => <strong>{text}</strong>,
                        br: () => <br />,
                    })}
                </BodyLong>
            </GuidePanel>

            <Heading className={styles.tittel} level="1" size="xlarge" spacing>
                {formatMessage(VelgSoknad.Tittel)}
            </Heading>
            <BodyShort spacing>{formatMessage(VelgSoknad.Undertittel)}</BodyShort>

            <div className={styles.linkgruppe}>
                <Panel border>
                    <Heading level="2" size="medium">
                        {formatMessage(VelgSoknad.VelgAlderTittel)}
                    </Heading>
                    <BodyShort>{formatMessage(VelgSoknad.AlderBeskrivelse)}</BodyShort>

                    <LinkAsButton
                        variant="secondary"
                        href={Routes.soknadtema.createURL({
                            papirsøknad: isPapirsøknad,
                            soknadstema: Søknadstema.Alder,
                        })}
                    >
                        {formatMessage(VelgSoknad.AlderLenke)}
                    </LinkAsButton>
                </Panel>
                <Panel border>
                    <Heading level="2" size="medium">
                        {formatMessage(VelgSoknad.VelgUførTittel)}
                    </Heading>
                    <BodyShort>{formatMessage(VelgSoknad.UførBeskrivelse)}</BodyShort>
                    <LinkAsButton
                        variant="secondary"
                        href={Routes.soknadtema.createURL({
                            papirsøknad: isPapirsøknad,
                            soknadstema: Søknadstema.Uføre,
                        })}
                    >
                        {formatMessage(VelgSoknad.UførLenke)}
                    </LinkAsButton>
                </Panel>
            </div>
        </div>
    );
};

export default Søknadsvelger;
