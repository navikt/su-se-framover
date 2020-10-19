import * as React from 'react';

import { Person, Kjønn } from '~api/personApi';
import { KjønnKvinne, KjønnMann, KjønnUkjent } from '~assets/Icons';

import { showName } from '../features/person/personUtils';

import { PersonAdvarsel } from './PersonAdvarsel';
import styles from './personkort.module.less';

export const Personkort = (props: { person: Person }) => {
    return (
        <div className={styles.personkortContainer}>
            <div>
                <span className={styles.personkortSVG}>
                    {props.person.kjønn === Kjønn.Kvinne ? (
                        <KjønnKvinne />
                    ) : props.person.kjønn === Kjønn.Mann ? (
                        <KjønnMann />
                    ) : (
                        <KjønnUkjent />
                    )}
                </span>
            </div>
            <div>
                <p>{showName(props.person)}</p>
                <div>
                    <span>{`${props.person.fnr} - `}</span>
                    <span>{`${props.person.fnr.substring(0, 2)}.`}</span>
                    <span>{`${props.person.fnr.substring(2, 4)}.`}</span>
                    <span>{`${props.person.fnr.substring(4, 6)}`}</span>
                </div>
                <PersonAdvarsel person={props.person} />
            </div>
        </div>
    );
};
