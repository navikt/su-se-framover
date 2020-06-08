import React from 'react';
import { Input, Radio, RadioGruppe } from 'nav-frontend-skjema';

export const InputFields = (props: {
    id: string;
    style: React.CSSProperties | undefined;
    labelText: string;
    value: string | string[] | number | undefined;
    onChange: (arg: string) => void;
    bredde: 'fullbredde' | 'XXL' | 'XL' | 'L' | 'M' | 'S' | 'XS' | 'XXS' | undefined;
    disabled: boolean;
    feil?: React.ReactNode;
}) => (
    <span style={InputFieldsStyle}>
        <Input
            style={props.style}
            id={props.id}
            label={props.labelText}
            feil={props.feil}
            value={props.value}
            bredde={props.bredde}
            disabled={props.disabled}
            onChange={e => props.onChange(e.target.value)}
        />
    </span>
);

const InputFieldsStyle = {
    marginRight: '1em'
};

export const JaNeiSpørsmål = (props: {
    legend: React.ReactNode;
    feil?: React.ReactNode;
    fieldName: string;
    state: boolean | null;
    onChange: (value: boolean) => void;
}) => {
    const options = [
        { label: 'Ja', value: true },
        { label: 'Nei', value: false }
    ];
    return (
        <RadioGruppe legend={props.legend} feil={props.feil}>
            {options.map(({ label, value }) => (
                <Radio
                    key={label}
                    name={props.fieldName}
                    label={label}
                    value={value.toString()}
                    checked={props.state === value}
                    onChange={e => {
                        props.onChange(e.target.value === true.toString());
                    }}
                />
            ))}
        </RadioGruppe>
    );
};
