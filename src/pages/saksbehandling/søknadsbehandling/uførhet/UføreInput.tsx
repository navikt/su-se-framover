import { TextField, Label } from '@navikt/ds-react';
import { Feilmelding, Normaltekst } from 'nav-frontend-typografi';
import React from 'react';

import styles from './Uførhet.module.less';

export const UførhetInput = (props: {
    tittel: string;
    inputName: string;
    inputTekst: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    feil: string | undefined;
}) => (
    <div className={styles.uføreAndFeilmeldingInputContainer}>
        <Label as="label" htmlFor={props.inputName}>
            {props.tittel}
        </Label>
        <span>
            <span className={styles.uføreInputContainer}>
                <TextField
                    label={props.tittel}
                    hideLabel
                    className={styles.uførehetInputFelt}
                    name={props.inputName}
                    onChange={props.onChange}
                    id={props.inputName}
                    value={props.value}
                    error={!!props.feil}
                />
                <Normaltekst>{props.inputTekst}</Normaltekst>
            </span>
            {props.feil && <Feilmelding>{props.feil}</Feilmelding>}
        </span>
    </div>
);
