import { TextField } from '@navikt/ds-react';
import { Element, Undertittel } from 'nav-frontend-typografi';
import React, { RefCallback } from 'react';
import { useIntl } from 'react-intl';

export const FormueInput = (props: {
    className: string;
    tittel: string;
    inputName: string;
    defaultValue: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    feil: string | undefined;
    inputRef?: RefCallback<HTMLInputElement>;
}) => (
    <TextField
        id={props.inputName}
        label={props.tittel}
        className={props.className}
        name={props.inputName}
        inputMode="numeric"
        pattern="[0-9]*"
        size="small"
        error={props.feil}
        defaultValue={props.defaultValue}
        onChange={props.onChange}
        ref={props.inputRef}
    />
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
