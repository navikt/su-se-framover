import { Element, Normaltekst } from 'nav-frontend-typografi';
import React from 'react';

import styles from '../Søknadoppsummering/søknadsoppsummering.module.less';

export const Oppsummeringsfelt = (props: { label: React.ReactNode; verdi: string | React.ReactNode }) => (
    <div className={styles.oppsummeringsfelt}>
        <Element>{props.label}</Element>
        <Normaltekst>{props.verdi}</Normaltekst>
    </div>
);
