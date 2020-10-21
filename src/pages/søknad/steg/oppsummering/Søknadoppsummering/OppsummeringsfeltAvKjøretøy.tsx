import { Element, Normaltekst } from 'nav-frontend-typografi';
import React from 'react';

import styles from './oppsummering.module.less';

export const OppsummeringsfeltAvKjøretøy = (props: {
    labelFirstEl: React.ReactNode;
    labelScndEl: React.ReactNode;
    arr: Array<{ verdiPåKjøretøy: string; kjøretøyDeEier: string }>;
}) => {
    return (
        <div>
            {props.arr.map((el, idx) => {
                return (
                    <div className={styles.oppsummeringsfeltKjøretøyContainer} key={idx}>
                        <div className={styles.oppsummeringElement}>
                            <Element>{props.labelScndEl}</Element>
                            <Normaltekst>{el.kjøretøyDeEier}</Normaltekst>
                        </div>
                        <div className={styles.oppsummeringElement}>
                            <Element>{props.labelFirstEl}</Element>
                            <Normaltekst>{el.verdiPåKjøretøy}</Normaltekst>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
