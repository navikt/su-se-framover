import * as React from 'react';

import { Person, Kjønn } from '~api/personApi';
import { KjønnKvinne, KjønnMann, KjønnUkjent } from '~assets/Icons';

import { showName } from '../../utils/person/personUtils';
import { PersonAdvarsel } from '../personadvarsel/PersonAdvarsel';

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
                <p>{showName(props.person.navn)}</p>
                <div>
                    <span>{`${props.person.fnr}, `}</span>
                    <span>{props.person.alder} år</span>
                </div>
                <PersonAdvarsel person={props.person} />
            </div>
        </div>
    );
};
