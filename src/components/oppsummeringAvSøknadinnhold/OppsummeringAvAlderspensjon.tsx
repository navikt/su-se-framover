import classNames from 'classnames';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Alderspensjon } from '~src/types/Søknadinnhold';

import { OppsummeringPar } from '../oppsummeringspar/Oppsummeringsverdi';

import messages from './OppsummeringAvSøknadinnhold-nb';
import styles from './OppsummeringAvSøknadinnhold.module.less';

const OppsummeringAvAlderspensjon = (props: { alderspensjon: Alderspensjon; visesIVedtak?: boolean }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div
            className={classNames({
                [styles.oppsummeringsContainer]: !props.visesIVedtak,
            })}
        >
            <OppsummeringPar
                label={formatMessage('alderspensjon.søktOmAlderspensjon')}
                verdi={formatMessage(`bool.${props.alderspensjon.harSøktAlderspensjon}`)}
            />
        </div>
    );
};

export default OppsummeringAvAlderspensjon;
