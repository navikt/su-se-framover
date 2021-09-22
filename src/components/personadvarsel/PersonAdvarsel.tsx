import { Tag, TagProps } from '@navikt/ds-react';
import * as React from 'react';

import { Person, Adressebeskyttelse } from '~api/personApi';

import styles from './personAdvarsel.module.less';

interface EtikettInfo {
    text: string;
    variant: TagProps['variant'];
}

export const PersonAdvarsel = (props: { person: Person }) => {
    const { adressebeskyttelse, skjermet } = props.person;
    const etiketter: EtikettInfo[] = [];

    if (adressebeskyttelse && adressebeskyttelse !== Adressebeskyttelse.Ugradert) {
        etiketter.push({
            text: humanize(adressebeskyttelse),
            variant: 'error',
        });
    }
    if (skjermet) {
        etiketter.push({
            text: 'Skjermet',
            variant: 'error',
        });
    }
    if ('vergemål' in props.person && props.person.vergemål) {
        etiketter.push({
            text: 'Vergemål',
            variant: 'warning',
        });
    }
    if ('fullmakt' in props.person && props.person.fullmakt) {
        etiketter.push({
            text: 'Fullmakt',
            variant: 'warning',
        });
    }

    return (
        <div className={styles.container}>
            {etiketter.map((etikett) => (
                <Tag className={styles.etikett} variant={etikett.variant} key={etikett.text} size="small">
                    {etikett.text}
                </Tag>
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
