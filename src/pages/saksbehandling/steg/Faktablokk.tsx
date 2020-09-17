import classNames from 'classnames';
import { Undertittel, Element } from 'nav-frontend-typografi';
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
    <div>
        <Undertittel className={styles.overskrift}>{props.tittel}</Undertittel>
        <div className={props.containerClassName}>
            {props.fakta.map((f) => (
                <div className={classNames(props.faktaBlokkerClassName, styles.linje)} key={f.tittel}>
                    <Element>{f.tittel}</Element>
                    <span>{f.verdi}</span>
                </div>
            ))}
        </div>
    </div>
);

export default Faktablokk;
