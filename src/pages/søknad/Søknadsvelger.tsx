import { Heading } from '@navikt/ds-react';
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
        <div className={styles.søknadsvelger}>
            <Heading level="2" size="small">
                {formatMessage('søknadsvelger.tittel')}
            </Heading>
            <div className={styles.buttonGroup}>
                <LinkAsButton
                    href={Routes.soknadtema.createURL({
                        papirsøknad: isPapirsøknad,
                        soknadstema: Søknadstema.Alder,
                    })}
                >
                    {formatMessage('alderssøknad')}
                </LinkAsButton>
                <LinkAsButton
                    href={Routes.soknadtema.createURL({
                        papirsøknad: isPapirsøknad,
                        soknadstema: Søknadstema.Uføre,
                    })}
                >
                    {formatMessage('uføresøknad')}
                </LinkAsButton>
            </div>
        </div>
    );
};

export default Søknadsvelger;
