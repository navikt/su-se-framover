import React from 'react';
import { IntlShape } from 'react-intl';

import { IngenAdresseGrunn } from '~api/personApi';
import { formatAdresse } from '~lib/formatUtils';
import { useI18n } from '~lib/hooks';
import { SøknadInnhold } from '~types/Søknad';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

const FastOppholdFaktablokk = (props: FaktablokkProps) => {
    const intl = useI18n({ messages });
    return (
        <Faktablokk
            tittel="Fra søknad"
            brukUndertittel={props.brukUndertittel}
            fakta={createFaktaBlokkArray(props.søknadInnhold, intl)}
        />
    );
};

const createFaktaBlokkArray = (søknadsInnhold: SøknadInnhold, intl: IntlShape) => {
    const arr = [];
    arr.push({
        tittel: intl.formatMessage({ id: 'fastOpphold.erNorskStatsborger' }),
        verdi: søknadsInnhold.oppholdstillatelse.erNorskStatsborger ? 'Ja' : 'Nei',
    });
    if (!søknadsInnhold.oppholdstillatelse.erNorskStatsborger) {
        arr.push({
            tittel: intl.formatMessage({ id: 'fastOpphold.harOppholdstillatelse' }),
            verdi: søknadsInnhold.oppholdstillatelse.harOppholdstillatelse
                ? intl.formatMessage({ id: 'fraSøknad.ja' })
                : intl.formatMessage({ id: 'fraSøknad.nei' }),
        });
        arr.push({
            tittel: intl.formatMessage({ id: 'fastOpphold.typeOppholdstillatelse' }),
            verdi:
                søknadsInnhold.oppholdstillatelse.typeOppholdstillatelse ??
                intl.formatMessage({ id: 'fraSøknad.ikkeRegistert' }),
        });
    }
    arr.push({
        tittel: 'Adresse',
        verdi: søknadsInnhold.boforhold.borPåAdresse
            ? formatAdresse(søknadsInnhold.boforhold.borPåAdresse)
            : søknadsInnhold.boforhold.ingenAdresseGrunn === IngenAdresseGrunn.BOR_PÅ_ANNEN_ADRESSE
            ? intl.formatMessage({ id: 'adresse.borPåAnnenAdresse' })
            : søknadsInnhold.boforhold.ingenAdresseGrunn === IngenAdresseGrunn.HAR_IKKE_FAST_BOSTED
            ? intl.formatMessage({ id: 'adresse.ikkeFastBosted' })
            : 'Ubesvart',
    });
    return arr;
};

export default FastOppholdFaktablokk;
