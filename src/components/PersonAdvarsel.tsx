import { EtikettAdvarsel } from 'nav-frontend-etiketter';
import * as React from 'react';

import { Person, Adressebeskyttelse } from '~api/personApi';
import { EPSMedAlder } from '~pages/saksbehandling/steg/sats/utils';

export const PersonAdvarsel = (props: { person: Person | EPSMedAlder }) => {
    const { adressebeskyttelse, skjermet } = props.person;

    if (adressebeskyttelse && adressebeskyttelse !== Adressebeskyttelse.Ugradert) {
        return <EtikettAdvarsel mini>{humanize(adressebeskyttelse)}</EtikettAdvarsel>;
    } else if (skjermet) {
        return <EtikettAdvarsel mini>Skjermet</EtikettAdvarsel>;
    } else if ('vergemål' in props.person && props.person.vergemål) {
        return <EtikettAdvarsel mini>Vergemål</EtikettAdvarsel>;
    } else if ('fullmakt' in props.person && props.person.fullmakt) {
        return <EtikettAdvarsel mini>Fullmakt</EtikettAdvarsel>;
    } else {
        return <></>;
    }
};

function humanize(upperSnakeCase: string): string {
    const lowercase = upperSnakeCase.toLowerCase();
    const parts = lowercase.split('_');
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return parts.join(' ');
}
