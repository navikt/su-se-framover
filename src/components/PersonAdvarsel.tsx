import { EtikettAdvarsel } from 'nav-frontend-etiketter';
import * as React from 'react';

import { Person, Adressebeskyttelse } from '~api/personApi';

export const PersonAdvarsel = (props: { person: Person }) => {
    const { adressebeskyttelse, skjermet } = props.person;

    switch (adressebeskyttelse) {
        case null:
        case Adressebeskyttelse.Ugradert:
            return skjermet ? <EtikettAdvarsel mini>Egen ansatt</EtikettAdvarsel> : <></>;

        case Adressebeskyttelse.StrengtFortrolig:
            return <EtikettAdvarsel mini>Kode 6</EtikettAdvarsel>;

        case Adressebeskyttelse.Fortrolig:
            return <EtikettAdvarsel mini>Kode 7</EtikettAdvarsel>;

        default:
            return <EtikettAdvarsel mini>{humanize(adressebeskyttelse)}</EtikettAdvarsel>;
    }
};

function humanize(upperSnakeCase: string): string {
    const lowercase = upperSnakeCase.toLowerCase();
    const parts = lowercase.split('_');
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return parts.join(' ');
}
