import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';

import styles from '../Søknadoppsummering/søknadsoppsummering.module.less';

export const OppsummeringsfeltAvKjøretøy = (props: {
    labelFirstEl: React.ReactNode;
    labelScndEl: React.ReactNode;
    arr: Array<{ verdiPåKjøretøy: string; kjøretøyDeEier: string }>;
}) => {
    return (
        <ul>
            {props.arr.map((el, idx) => {
                return (
                    <li className={styles.oppsummeringsfeltKjøretøyContainer} key={idx}>
                        <div className={styles.oppsummeringElement}>
                            <Label size="small">{props.labelScndEl}</Label>
                            <BodyShort size="small">{el.kjøretøyDeEier}</BodyShort>
                        </div>
                        <div className={styles.oppsummeringElement}>
                            <Label size="small">{props.labelFirstEl}</Label>
                            <BodyShort size="small">{el.verdiPåKjøretøy}</BodyShort>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};
