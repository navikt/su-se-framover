import React from 'react';

import { useI18n } from '~lib/hooks';
import { SøknadInnhold } from '~types/Søknad';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';

const FlyktningFaktablokk = (props: { søknadInnhold: SøknadInnhold }) => {
    const intl = useI18n({ messages });

    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            fakta={[
                {
                    tittel: intl.formatMessage({ id: 'flyktning.registrertFlyktning' }),
                    verdi: props.søknadInnhold.flyktningsstatus.registrertFlyktning
                        ? intl.formatMessage({ id: 'fraSøknad.ja' })
                        : intl.formatMessage({ id: 'fraSøknad.nei' }),
                },
            ]}
        />
    );
};

export default FlyktningFaktablokk;
