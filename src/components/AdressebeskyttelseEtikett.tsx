import { EtikettAdvarsel } from 'nav-frontend-etiketter';
import * as React from 'react';

import { Person, Adressebeskyttelse } from '~api/personApi';

export const AdressebeskyttelseEtikett = (props: { person: Person }) => {
    const adressebeskyttelse = props.person.adressebeskyttelse;

    if (adressebeskyttelse === null || adressebeskyttelse === Adressebeskyttelse.Ugradert) {
        return <></>;
    } else if (adressebeskyttelse === Adressebeskyttelse.StrengtFortrolig) {
        return <EtikettAdvarsel mini>Kode 6</EtikettAdvarsel>;
    } else if (adressebeskyttelse === Adressebeskyttelse.Fortrolig) {
        return <EtikettAdvarsel mini>Kode 7</EtikettAdvarsel>;
    } else {
        return <EtikettAdvarsel mini>{humanize(adressebeskyttelse)}</EtikettAdvarsel>;
    }
};

function humanize(upperSnakeCase: string): string {
    const lowercase = upperSnakeCase.toLowerCase();
    const parts = lowercase.split('_');
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return parts.join(' ');
}
