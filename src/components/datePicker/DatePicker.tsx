import { Label, SkjemaelementFeilmelding } from 'nav-frontend-skjema';
import * as React from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import { v4 as uuid } from 'uuid';

interface Props extends Omit<ReactDatePickerProps, 'selected' | 'value'> {
    label: string;
    value?: Date | null;
    feil?: string;
}

const DatePicker = (
    { label, value, feil, id = uuid(), className, ...datePickerProps }: Props,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: React.ForwardedRef<any>
) => {
    return (
        <div className={className}>
            <Label htmlFor={id}>{label}</Label>
            <ReactDatePicker id={id} selected={value} {...datePickerProps} ref={ref} />
            {feil && <SkjemaelementFeilmelding>{feil}</SkjemaelementFeilmelding>}
        </div>
    );
};

export default React.forwardRef(DatePicker);
