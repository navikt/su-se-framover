import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';

import styles from '../Søknadoppsummering/søknadsoppsummering.module.less';

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
                            <Label size="small">{props.labelFirstEl}</Label>
                            <BodyShort size="small">{el.beløp}</BodyShort>
                        </div>
                        <div className={styles.oppsummeringElement}>
                            <Label size="small">{props.labelScndEl}</Label>
                            <BodyShort size="small">{el.valuta}</BodyShort>
                        </div>
                        <div className={styles.oppsummeringElement}>
                            <Label size="small">{props.labelThirdEl}</Label>
                            <BodyShort size="small">{el.type}</BodyShort>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
