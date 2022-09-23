import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import søknadMessages from '~src/pages/søknad/steg/oppholdstillatelse/oppholdstillatelse-nb';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';

//TODO: - lag ny oppsummering

export const FamilieforeningBlokk = (props: { familieforening: Nullable<boolean> }) => {
    const { formatMessage } = useI18n({
        messages: {
            ...messages,
            ...søknadMessages,
        },
    });

    return (
        <Faktablokk
            tittel={formatMessage('display.fraSøknad')}
            fakta={[
                {
                    tittel: formatMessage('familieforening.label'),
                    verdi: props.familieforening ? formatMessage('fraSøknad.ja') : formatMessage('fraSøknad.nei'),
                },
            ]}
        />
    );
};
