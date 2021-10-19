import { BodyShort, TextField, Label } from '@navikt/ds-react';
import React from 'react';

import SkjemaelementFeilmelding from '~components/formElements/SkjemaelementFeilmelding';

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
                <BodyShort>{props.inputTekst}</BodyShort>
            </span>
            {props.feil && <SkjemaelementFeilmelding>{props.feil}</SkjemaelementFeilmelding>}
        </span>
    </div>
);
