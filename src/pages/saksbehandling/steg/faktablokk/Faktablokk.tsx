import classNames from 'classnames';
import { Systemtittel, Element, Undertittel } from 'nav-frontend-typografi';
import React from 'react';

import styles from './faktablokk.module.less';
import { FaktablokkTitteltype } from './faktablokker/faktablokkUtils';

export interface Fakta {
    tittel: string;
    verdi: string | JSX.Element;
}

const Faktablokk = (props: {
    tittel: string;
    tittelType?: FaktablokkTitteltype;
    fakta: Fakta[];
    containerClassName?: string;
    faktaBlokkerClassName?: string;
}) => (
    <div className="styles.faktablokk">
        {props.tittelType === FaktablokkTitteltype.undertittel ? (
            <Undertittel className={styles.overskrift}>{props.tittel}</Undertittel>
        ) : (
            <Systemtittel className={styles.overskrift}>{props.tittel}</Systemtittel>
        )}
        <div className={props.containerClassName}>
            {props.fakta.map((f, index) => (
                <div className={classNames(props.faktaBlokkerClassName, styles.linje)} key={index}>
                    <Element>{f.tittel}</Element>
                    <span className={styles.verdi}>{f.verdi}</span>
                </div>
            ))}
        </div>
    </div>
);

export default Faktablokk;
