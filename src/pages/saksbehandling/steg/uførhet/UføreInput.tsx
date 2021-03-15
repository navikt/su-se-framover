import { Input, Label } from 'nav-frontend-skjema';
import { Feilmelding, Normaltekst } from 'nav-frontend-typografi';
import React from 'react';

import styles from './Uførhet.module.less';

export const UførhetInput = (props: {
    tittel: string;
    inputName: string;
    inputTekst: string;
    value: string;
    bredde?: 'fullbredde' | 'XXL' | 'XL' | 'L' | 'M' | 'S' | 'XS' | 'XXS';
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    feil: string | undefined;
}) => (
    <div className={styles.uføreAndFeilmeldingInputContainer}>
        <Label htmlFor={props.inputName}> {props.tittel} </Label>
        <span>
            <span className={styles.uføreInputContainer}>
                <Input
                    className={styles.uførehetInputFelt}
                    name={props.inputName}
                    bredde={props.bredde}
                    onChange={props.onChange}
                    id={props.inputName}
                    value={props.value}
                />
                <Normaltekst>{props.inputTekst}</Normaltekst>
            </span>
            {props.feil && <Feilmelding>{props.feil}</Feilmelding>}
        </span>
    </div>
);
