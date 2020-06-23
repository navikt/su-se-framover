import React from 'react';
import { Input, RadioPanelGruppe } from 'nav-frontend-skjema';

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
            onChange={(e) => props.onChange(e.target.value)}
        />
    </span>
);

const InputFieldsStyle = {
    marginRight: '1em',
};

export const JaNeiSpørsmål = (props: {
    id: string;
    legend: React.ReactNode;
    feil?: React.ReactNode;
    state: boolean | null;
    onChange: (value: boolean) => void;
    className?: string;
}) => {
    return (
        <div id={props.id}>
            <RadioPanelGruppe
                className={props.className}
                feil={props.feil}
                legend={props.legend}
                name={props.id}
                radios={[
                    { label: 'Ja', value: 'true' },
                    { label: 'Nei', value: 'false' },
                ]}
                onChange={(_e, value) => props.onChange(value === 'true')}
                checked={props.state?.toString()}
            />
        </div>
    );
};
