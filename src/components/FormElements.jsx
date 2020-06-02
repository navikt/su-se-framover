import React from 'react';
import { Input, Radio, RadioGruppe } from 'nav-frontend-skjema';

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
