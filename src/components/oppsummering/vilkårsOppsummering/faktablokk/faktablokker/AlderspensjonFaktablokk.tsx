import React from 'react';

import { useI18n } from '~src/lib/i18n';
import søknadMessages from '~src/pages/søknad/steg/alderspensjon/alderspensjon-nb';
import { SøknadInnholdAlder } from '~src/types/Søknadinnhold';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';

//TODO: lag ny oppsummering
export const AlderspensjonBlokk = (props: { harSøktAlderspensjon: SøknadInnholdAlder['harSøktAlderspensjon'] }) => {
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
                    tittel: formatMessage('alderspensjon.label'),
                    verdi: props.harSøktAlderspensjon.harSøktAlderspensjon
                        ? formatMessage('fraSøknad.ja')
                        : formatMessage('fraSøknad.nei'),
                },
            ]}
        />
    );
};
