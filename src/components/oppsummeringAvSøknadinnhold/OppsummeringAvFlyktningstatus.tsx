import classNames from 'classnames';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Flyktningstatus } from '~src/types/Søknadinnhold';

import { OppsummeringPar } from '../oppsummeringspar/Oppsummeringsverdi';

import messages from './OppsummeringAvSøknadinnhold-nb';
import styles from './OppsummeringAvSøknadinnhold.module.less';

const OppsummeringAvFlyktningstatus = (props: { flyktningstatus: Flyktningstatus; visesIVedtak?: boolean }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div
            className={classNames({
                [styles.oppsummeringsContainer]: !props.visesIVedtak,
            })}
        >
            <OppsummeringPar
                label={formatMessage('flyktning.registrertSomFlyktning')}
                verdi={formatMessage(`bool.${props.flyktningstatus.registrertFlyktning}`)}
            />
        </div>
    );
};

export default OppsummeringAvFlyktningstatus;
