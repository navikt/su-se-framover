import Etikett, { EtikettBaseProps } from 'nav-frontend-etiketter';
import * as React from 'react';

import { Person, Adressebeskyttelse } from '~api/personApi';

import styles from './personAdvarsel.module.less';

interface EtikettInfo {
    text: string;
    type: EtikettBaseProps['type'];
}

export const PersonAdvarsel = (props: { person: Person }) => {
    const { adressebeskyttelse, skjermet } = props.person;
    const etiketter: EtikettInfo[] = [];

    if (adressebeskyttelse && adressebeskyttelse !== Adressebeskyttelse.Ugradert) {
        etiketter.push({
            text: humanize(adressebeskyttelse),
            type: 'advarsel',
        });
    }
    if (skjermet) {
        etiketter.push({
            text: 'Skjermet',
            type: 'advarsel',
        });
    }
    if ('vergemål' in props.person && props.person.vergemål) {
        etiketter.push({
            text: 'Vergemål',
            type: 'fokus',
        });
    }
    if ('fullmakt' in props.person && props.person.fullmakt) {
        etiketter.push({
            text: 'Fullmakt',
            type: 'fokus',
        });
    }

    return (
        <div>
            {etiketter.map((etikett) => (
                <Etikett className={styles.etikett} type={etikett.type} key={etikett.text} mini>
                    {etikett.text}
                </Etikett>
            ))}
        </div>
    );
};

function humanize(upperSnakeCase: string): string {
    const lowercase = upperSnakeCase.toLowerCase();
    const parts = lowercase.split('_');
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return parts.join(' ');
}
