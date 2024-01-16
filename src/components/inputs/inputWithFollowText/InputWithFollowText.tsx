import { BodyShort, Label, TextField } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import SkjemaelementFeilmelding from '../../formElements/SkjemaelementFeilmelding';

import * as styles from './inputWithFollowText.module.less';

export const InputWithFollowText = (props: {
    tittel: string;
    inputName: string;
    inputTekst: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    feil: string | undefined;
    disabled?: boolean;
}) => (
    <div className={classNames('navds-form-field')}>
        <Label as="label" htmlFor={props.inputName} spacing>
            {props.tittel}
        </Label>
        <span className={styles.inputOgtekstContainer}>
            <TextField
                className={styles.inputWithFollowTextInputfelt}
                id={props.inputName}
                label={props.tittel}
                name={props.inputName}
                value={props.value}
                onChange={props.onChange}
                disabled={props.disabled}
                error={!!props.feil}
                hideLabel
            />
            <BodyShort>{props.inputTekst}</BodyShort>
        </span>
        {props.feil && <SkjemaelementFeilmelding>{props.feil}</SkjemaelementFeilmelding>}
    </div>
);
