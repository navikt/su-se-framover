import React, {useState} from 'react';
import {Input, Radio, RadioGruppe, Textarea} from 'nav-frontend-skjema';
import { getRandomSmiley } from '../hooks/getRandomEmoji';
import NavFrontendChevron from 'nav-frontend-chevron';
import { Undertittel } from 'nav-frontend-typografi';
import "./collapsiblePanel/CollapsiblePanel.less"
import classNames from "classnames";
import styled, {keyframes} from "styled-components";
/*eslint no-unused-vars: */

export const InputFields = ({ id, style, labelText: label, value, onChange, bredde, disabled, feil }) => (
    <span style={InputFieldsStyle}>
        <Input
            style={style}
            id={id}
            label={label}
            feil={feil}
            value={value}
            bredde={bredde}
            disabled={disabled}
            onChange={e => onChange(e.target.value)}
        />
    </span>
);

const InputFieldsStyle = {
    marginRight: '1em'
};


export const SUTextArea = ({style, label, value, onChange}) => {
    return <Textarea style={style}
                     label={label} value={value}
                     onChange={e => {onChange(e.target.value)}}/>
};


export const JaNeiSpørsmål = ({ fieldName, legend, onChange, state, feil }) => {
    const options = [
        { label: 'Ja', value: true },
        { label: 'Nei', value: false }
    ];
    return (
        <RadioGruppe legend={legend} feil={feil}>
            {options.map(({ label, value }) => (
                <Radio
                    key={label}
                    name={fieldName}
                    label={label}
                    value={value}
                    checked={state === value}
                    onChange={onChange}
                />
            ))}
        </RadioGruppe>
    );
};



