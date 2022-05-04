import { Heading } from '@navikt/ds-react';
import * as React from 'react';
import { useOutletContext } from 'react-router-dom';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { SøknadContext } from '~src/pages/søknad/index';
import { Søknadstema } from '~src/types/Søknad';

import messages from './nb';
import * as styles from './søknadsvelger.module.less';

const Søknadsvelger = () => {
    const { isPapirsøknad } = useOutletContext<SøknadContext>();
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.søknadsvelger}>
            <Heading level="2" size="small">
                {formatMessage('søknadsvelger.tittel')}
            </Heading>
            <div className={styles.buttonGroup}>
                <LinkAsButton
                    href={Routes.soknadPersonSøk.createURL({
                        papirsøknad: isPapirsøknad,
                        soknadstema: Søknadstema.Alder,
                    })}
                >
                    {formatMessage('alderssøknad')}
                </LinkAsButton>
                <LinkAsButton
                    href={Routes.soknadPersonSøk.createURL({
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
