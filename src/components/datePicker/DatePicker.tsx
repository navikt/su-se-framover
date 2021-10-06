import { Label, TextField } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import { v4 as uuid } from 'uuid';

import SkjemaelementFeilmelding from '~components/formElements/SkjemaelementFeilmelding';

import styles from './datePicker.module.less';

interface Props extends Omit<ReactDatePickerProps, 'selected' | 'value'> {
    label: string;
    value?: Date | null;
    feil?: string;
}

const CustomInput = React.forwardRef<HTMLInputElement, { label: string; error?: boolean }>(function C(props, ref) {
    return <TextField {...props} label={props.label} hideLabel error={props.error} ref={ref} />;
});

const DatePicker = (
    { label, value, feil, id = uuid(), className, ...datePickerProps }: Props,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: React.ForwardedRef<any>
) => {
    return (
        <div className={classNames(styles.container, className)}>
            <Label as="label" htmlFor={id}>
                {label}
            </Label>
            <ReactDatePicker
                id={id}
                selected={value}
                {...datePickerProps}
                customInput={<CustomInput label={label} error={!!feil} />}
                popperPlacement="bottom"
                ref={ref}
            />
            {feil && <SkjemaelementFeilmelding>{feil}</SkjemaelementFeilmelding>}
        </div>
    );
};

export default React.forwardRef(DatePicker);
