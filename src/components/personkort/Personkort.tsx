import * as React from 'react';

import { Person, Kjønn } from '~api/personApi';
import { KjønnKvinne, KjønnMann, KjønnUkjent } from '~assets/Icons';
import { Nullable } from '~lib/types';

import { showName } from '../../utils/person/personUtils';
import { PersonAdvarsel } from '../personadvarsel/PersonAdvarsel';

import styles from './personkort.module.less';

const KjønnIkon = (props: { kjønn: Nullable<Kjønn> }) => {
    switch (props.kjønn) {
        case Kjønn.Kvinne:
            return <KjønnKvinne />;
        case Kjønn.Mann:
            return <KjønnMann />;
        case Kjønn.Ukjent:
            return <KjønnUkjent />;
    }
    return null;
};

export const Personkort = (props: { person: Person }) => {
    return (
        <div className={styles.personkortContainer}>
            <div>
                <span className={styles.personkortSVG}>
                    <KjønnIkon kjønn={props.person.kjønn} />
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
