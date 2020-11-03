import classNames from 'classnames';
import { Systemtittel, Element } from 'nav-frontend-typografi';
import React from 'react';

import styles from './faktablokk.module.less';

export interface Fakta {
    tittel: string;
    verdi: string | JSX.Element;
}

const Faktablokk = (props: {
    tittel: string;
    fakta: Fakta[];
    containerClassName?: string;
    faktaBlokkerClassName?: string;
}) => (
    <div className="styles.faktablokk">
        <Systemtittel className={styles.overskrift}>{props.tittel}</Systemtittel>
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
