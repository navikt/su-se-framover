import React from 'react';
import { IntlShape } from 'react-intl';

import { useI18n } from '~lib/hooks';
import { SøknadInnhold } from '~types/Søknad';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

const InstitusjonsoppholdBlokk = (props: FaktablokkProps) => {
    const intl = useI18n({ messages });

    return (
        <Faktablokk
            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
            brukUndertittel={props.brukUndertittel}
            fakta={createListOfFakta(props.søknadInnhold, intl)}
        />
    );
};

const createListOfFakta = (søknadInnhold: SøknadInnhold, intl: IntlShape) => {
    const arr = [
        {
            tittel: intl.formatMessage({ id: 'institusjonsopphold.innlagtPåInstitusjonSiste3Måneder' }),
            verdi: søknadInnhold.boforhold.innlagtPåInstitusjon
                ? intl.formatMessage({ id: 'fraSøknad.ja' })
                : intl.formatMessage({ id: 'fraSøknad.nei' }),
        },
    ];

    if (søknadInnhold.boforhold.innlagtPåInstitusjon?.datoForInnleggelse) {
        arr.push({
            tittel: intl.formatMessage({ id: 'institusjonsopphold.datoForInnleggelse' }),
            verdi: intl.formatDate(søknadInnhold.boforhold.innlagtPåInstitusjon.datoForInnleggelse),
        });

        arr.push({
            tittel: intl.formatMessage({ id: 'institusjonsopphold.datoForUtskrivelse' }),
            verdi: søknadInnhold.boforhold.innlagtPåInstitusjon.datoForUtskrivelse
                ? intl.formatDate(søknadInnhold.boforhold.innlagtPåInstitusjon.datoForUtskrivelse)
                : søknadInnhold.boforhold.innlagtPåInstitusjon.fortsattInnlagt
                ? intl.formatMessage({ id: 'institusjonsopphold.fortsattInnlagt' })
                : '',
        });
    }

    return arr;
};

export default InstitusjonsoppholdBlokk;
