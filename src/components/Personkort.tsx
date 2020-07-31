import * as React from 'react';
import { KjønnKvinne, KjønnMann, KjønnUkent } from '~assets/Icons';
import { Person } from '~api/personApi';
import styles from './personkort.module.less';

export const Personkort = (props: { person: Person }) => {
    return (
        <div className={styles.personkortContainer}>
            <div>
                <span className={styles.personkortSVG}>
                    {props.person.kjønn === undefined && <KjønnUkent />}
                    {props.person.kjønn === 'kvinne' && <KjønnKvinne />}
                    {props.person.kjønn === 'mann' && <KjønnMann />}
                </span>
            </div>
            <div>
                <p>{`${props.person.fornavn} ${props.person.mellomnavn} ${props.person.etternavn}`}</p>
                <div>
                    <span>{`${props.person.fnr} - `}</span>
                    <span>{`${props.person.fnr.substring(0, 2)}.`}</span>
                    <span>{`${props.person.fnr.substring(2, 4)}.`}</span>
                    <span>{`${props.person.fnr.substring(4, 6)}`}</span>
                </div>
            </div>
        </div>
    );
};
