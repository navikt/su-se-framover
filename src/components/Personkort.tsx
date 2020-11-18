import * as React from 'react';

import { Person, Kjønn } from '~api/personApi';
import { KjønnKvinne, KjønnMann, KjønnUkjent } from '~assets/Icons';
import { Nullable } from '~lib/types';
import { EPSMedAlder } from '~pages/saksbehandling/steg/sats/utils';

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
                <p>{showName(props.person.navn)}</p>
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

export const PersonkortEPS = (props: { eps: Nullable<EPSMedAlder> }) => {
    if (!props.eps || !props.eps.navn || !props.eps.fnr) {
        return null;
    }

    return (
        <div className={styles.personkortContainer}>
            <div>
                <span className={styles.personkortSVG}>
                    {props.eps.kjønn === Kjønn.Kvinne ? (
                        <KjønnKvinne />
                    ) : props.eps.kjønn === Kjønn.Mann ? (
                        <KjønnMann />
                    ) : (
                        <KjønnUkjent />
                    )}
                </span>
            </div>
            <div>
                <p>{showName(props.eps.navn)}</p>
                <div>
                    <span>{`${props.eps.fnr.substring(0, 6)} `}</span>
                    <span>{`${props.eps.fnr.substring(6, 11)}, `}</span>
                    <span>{props.eps.alder} år</span>
                </div>
                <PersonAdvarsel person={props.eps} />
            </div>
        </div>
    );
};
