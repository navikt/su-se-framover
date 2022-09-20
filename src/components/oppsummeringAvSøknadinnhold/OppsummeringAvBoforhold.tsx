import classNames from 'classnames';
import React from 'react';

import { DelerBoligMed } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import { Boforhold } from '~src/types/Søknadinnhold';

import { OppsummeringPar } from '../revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';

import messages from './OppsummeringAvSøknadinnhold-nb';
import styles from './OppsummeringAvSøknadinnhold.module.less';

const OppsummeringAvBoforhold = (props: { boforhold: Boforhold; visesIVedtak?: boolean }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div
            className={classNames({
                [styles.oppsummeringsContainer]: !props.visesIVedtak,
            })}
        >
            <OppsummeringPar
                label={formatMessage('boforhold.delerBoligMedNoenOver18år')}
                verdi={formatMessage(`bool.${props.boforhold.delerBoligMedVoksne}`)}
            />
            {props.boforhold.delerBoligMedVoksne && (
                <OppsummeringPar
                    label={formatMessage('boforhold.delerBoligMedNoenOver18år')}
                    verdi={formatMessage(props.boforhold.delerBoligMed!)}
                />
            )}

            {props.boforhold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER && (
                <OppsummeringPar
                    label={formatMessage('boforhold.ektemakeEllerSamboerUførFlyktning')}
                    verdi={formatMessage(`bool.${props.boforhold.ektefellePartnerSamboer!.erUførFlyktning!}`)}
                />
            )}
        </div>
    );
};

export default OppsummeringAvBoforhold;
