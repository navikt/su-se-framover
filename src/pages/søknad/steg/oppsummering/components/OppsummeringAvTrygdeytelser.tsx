import { Element, Normaltekst } from 'nav-frontend-typografi';
import React from 'react';

import styles from '../Søknadoppsummering/oppsummering.module.less';

export const OppsummeringAvTrygdeytelser = (props: {
    labelFirstEl: React.ReactNode;
    labelScndEl: React.ReactNode;
    labelThirdEl: React.ReactNode;
    arr: Array<{ beløp: string; type: string; valuta: string }>;
}) => {
    return (
        <div>
            {props.arr.map((el, idx) => {
                return (
                    <div className={styles.oppsummeringsfeltTrygdeytelserContainer} key={idx}>
                        <div className={styles.oppsummeringElement}>
                            <Element>{props.labelFirstEl}</Element>
                            <Normaltekst>{el.beløp}</Normaltekst>
                        </div>
                        <div className={styles.oppsummeringElement}>
                            <Element>{props.labelScndEl}</Element>
                            <Normaltekst>{el.type}</Normaltekst>
                        </div>
                        <div className={styles.oppsummeringElement}>
                            <Element>{props.labelThirdEl}</Element>
                            <Normaltekst>{el.valuta}</Normaltekst>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
