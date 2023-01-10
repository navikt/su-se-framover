import React from 'react';

import { DelerBoligMed } from '~src/features/søknad/types';
import { useI18n } from '~src/lib/i18n';
import { Boforhold } from '~src/types/Søknadinnhold';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import messages from './OppsummeringAvSøknadinnhold-nb';

const OppsummeringAvBoforhold = (props: { boforhold: Boforhold }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <OppsummeringPar
                label={formatMessage('boforhold.delerBoligMedNoenOver18år')}
                verdi={formatMessage(`bool.${props.boforhold.delerBoligMedVoksne}`)}
            />
            {props.boforhold.delerBoligMedVoksne && (
                <OppsummeringPar
                    label={formatMessage('boforhold.hvemDelerBoligMed')}
                    verdi={formatMessage(props.boforhold.delerBoligMed!)}
                />
            )}

            {props.boforhold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER && (
                <>
                    <OppsummeringPar
                        label={formatMessage('boforhold.epsFnr')}
                        verdi={props.boforhold.ektefellePartnerSamboer!.fnr}
                    />
                    <OppsummeringPar
                        label={formatMessage('boforhold.ektemakeEllerSamboerUførFlyktning')}
                        verdi={formatMessage(`bool.${props.boforhold.ektefellePartnerSamboer!.erUførFlyktning!}`)}
                    />
                </>
            )}
        </div>
    );
};

export default OppsummeringAvBoforhold;
