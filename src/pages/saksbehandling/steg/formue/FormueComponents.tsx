import { Input, Label } from 'nav-frontend-skjema';
import { Element, Undertittel } from 'nav-frontend-typografi';
import React from 'react';
import { useIntl } from 'react-intl';

export const FormueInput = (props: {
    className: string;
    tittel: string;
    inputName: string;
    defaultValue: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    feil: string | undefined;
}) => (
    <>
        <Label htmlFor={props.inputName}> {props.tittel} </Label>
        <Input
            className={props.className}
            name={props.inputName}
            type="numeric"
            pattern="[0-9]*"
            feil={props.feil}
            defaultValue={props.defaultValue}
            onChange={props.onChange}
        />
    </>
);

export const ShowSum = ({ sum, tittel }: { sum: number; tittel: string }) => {
    const intl = useIntl();

    return (
        <div>
            <Element>{tittel}</Element>
            <Undertittel>{`${intl.formatNumber(sum)} ,-`}</Undertittel>
        </div>
    );
};
