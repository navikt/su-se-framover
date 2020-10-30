import { Input } from 'nav-frontend-skjema';
import { Element, Undertittel } from 'nav-frontend-typografi';
import React from 'react';

export const FormueInput = (props: {
    className: string;
    tittel: string;
    inputName: string;
    defaultValue: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    feil: string | undefined;
}) => (
    <>
        <h3> {props.tittel} </h3>
        <Input
            className={props.className}
            name={props.inputName}
            type="number"
            feil={props.feil}
            defaultValue={props.defaultValue}
            onChange={props.onChange}
        />
    </>
);

export const ShowSum = ({ sum, tittel }: { sum: number; tittel: string }) => (
    <div>
        <Element>{tittel}</Element>
        <Undertittel>{sum} kr</Undertittel>
    </div>
);
