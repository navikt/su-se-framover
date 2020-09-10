import { Normaltekst, Undertittel, Element } from 'nav-frontend-typografi';
import React from 'react';

import styles from './faktablokk.module.less';

export interface Fakta {
    tittel: string;
    verdi: string;
}

const Faktablokk = (props: { tittel: string; fakta: Fakta[]; className?: string }) => (
    <div>
        <Undertittel className={styles.overskrift}>{props.tittel}</Undertittel>
        {props.fakta.map((f) => (
            <div className={props.className} key={f.tittel}>
                <Element>{f.tittel}</Element>
                <Normaltekst>{f.verdi}</Normaltekst>
            </div>
        ))}
    </div>
);

export default Faktablokk;
