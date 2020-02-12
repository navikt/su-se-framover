import React from 'react';
import { Input, Radio, RadioGruppe } from 'nav-frontend-skjema';

export const InputFields = ({ id, style, labelText: label, value, onChange, bredde }) => (
    <span style={InputFieldsStyle}>
        <Input
            style={style}
            id={id}
            label={label}
            value={value}
            bredde={bredde}
            onChange={e => onChange(e.target.value)}
        />
    </span>
);

const InputFieldsStyle = {
    marginRight: '1em'
};

export const JaNeiSpørsmål = ({ fieldName, legend, onChange, state }) => {
    const options = [
        { label: 'Ja', value: 'true' },
        { label: 'Nei', value: 'false' }
    ];
    return (
        <RadioGruppe legend={legend}>
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
