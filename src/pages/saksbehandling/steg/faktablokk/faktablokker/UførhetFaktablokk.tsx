import React from 'react';

import { useI18n } from '~lib/hooks';
import { SøknadInnhold } from '~types/Søknad';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';

const UførhetFaktablokk = (props: { søknadInnhold: SøknadInnhold }) => {
    const intl = useI18n({ messages });

    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            fakta={[
                {
                    tittel: intl.formatMessage({ id: 'uførhet.vedtakOmUføretrygd' }),
                    verdi: props.søknadInnhold.uførevedtak.harUførevedtak
                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                        : intl.formatMessage({ id: 'fraSøknad.nei' }),
                },
            ]}
        />
    );
};

export default UførhetFaktablokk;
