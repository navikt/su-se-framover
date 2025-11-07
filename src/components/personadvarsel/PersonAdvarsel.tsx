import { Tag, TagProps } from '@navikt/ds-react';
import classNames from 'classnames';
import * as DateFns from 'date-fns';

import { Adressebeskyttelse, Person } from '~src/types/Person';

import styles from './personAdvarsel.module.less';

type TagVariant = TagProps['variant'] | 'black';

interface EtikettInfo {
    text: string;
    variant: TagVariant;
}

export const TagWithBlack = (props: { etikett: EtikettInfo }) => {
    return (
        <Tag
            className={classNames(styles.etikett, {
                [styles.black]: props.etikett.variant === 'black',
            })}
            //Svart variant er enda ikke publistert i Tag. så vi hacker til at den er en 'info', men endrer CSS at den ser riktig ut.
            variant={props.etikett.variant === 'black' ? 'info' : props.etikett.variant}
            key={props.etikett.text}
            size="medium"
        >
            {props.etikett.text}
        </Tag>
    );
};

export const getEtiketter = (person: Person) => {
    const { adressebeskyttelse, skjermet } = person;
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
    if ('vergemål' in person && person.vergemål) {
        etiketter.push({
            text: 'Vergemål',
            variant: 'warning',
        });
    }
    if (person.dødsdato) {
        etiketter.push({
            text: `Død ${DateFns.format(new Date(person.dødsdato), 'dd.MM.yyyy')}`,
            variant: 'black',
        });
    }

    return etiketter;
};

export const PersonAdvarsel = (props: { person: Person }) => {
    const etiketter = getEtiketter(props.person);
    return (
        <div className={styles.personadvarselContainer}>
            {etiketter.map((etikett) => (
                <TagWithBlack key={etikett.text} etikett={etikett} />
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
