import {
    HelpText,
    useDatepicker,
    DatePicker as DatePickerDS,
    useMonthpicker,
    MonthPicker as MonthPickerDS,
    useRangeDatepicker,
} from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import * as React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { NullablePeriode } from '~src/types/Periode';

import messages from './DatePicker-nb';
import styles from './datePicker.module.less';

export const DatePicker = (props: {
    label: string;
    value: Nullable<Date>;
    size?: 'medium' | 'small';
    fromDate?: Nullable<Date>;
    toDate?: Nullable<Date>;
    onChange: (date: Nullable<Date>) => void;
    error?: string;
    hjelpetekst?: string;
    disabled?: boolean;
}) => {
    const { datepickerProps, inputProps } = useDatepicker({
        fromDate: props.fromDate ?? new Date('jan 01 2021'),
        toDate: props.toDate ?? DateFns.addYears(new Date(new Date().getFullYear(), 12, 0), 1),
        onDateChange: (d) => props.onChange(d ?? null),
        defaultSelected: props.value ?? undefined,
    });

    return (
        <div>
            <DatePickerDS {...datepickerProps}>
                <DatePickerDS.Input
                    {...inputProps}
                    label={
                        <div className={styles.datepickerLabelContainer}>
                            {props.label} {props.hjelpetekst ? <HelpText>{props.hjelpetekst}</HelpText> : null}
                        </div>
                    }
                    size={props.size ?? 'medium'}
                    error={props.error}
                    disabled={props.disabled}
                />
            </DatePickerDS>
        </div>
    );
};

export const MonthPicker = (props: {
    label: string;
    value: Nullable<Date>;
    size?: 'medium' | 'small';
    fromDate?: Nullable<Date>;
    toDate?: Nullable<Date>;
    onChange: (date: Nullable<Date>) => void;
    error?: string;
}) => {
    const { monthpickerProps, inputProps } = useMonthpicker({
        fromDate: props.fromDate ?? new Date('2021-01-01'),
        toDate: props.toDate ?? new Date('2023-12-01'),
        onMonthChange: (d) => props.onChange(d ?? null),
        defaultSelected: props.value ?? undefined,
    });

    return (
        <div>
            <MonthPickerDS {...monthpickerProps} selected={props.value ?? undefined} dropdownCaption>
                <MonthPickerDS.Input {...inputProps} label={props.label} size={props.size} error={props.error} />
            </MonthPickerDS>
        </div>
    );
};

/**
 * TilOgMed settes automatisk til siste dag i måneden
 */
export const RangePickerMonth = (props: {
    name: 'periode';
    label?: { fraOgMed?: string; tilOgMed?: string };
    size?: 'medium' | 'small';
    value: { fraOgMed: Nullable<Date>; tilOgMed: Nullable<Date> };
    fromDate?: Nullable<Date>;
    toDate?: Nullable<Date>;
    onChange: (periode: NullablePeriode) => void;
    error?: { fraOgMed?: string; tilOgMed?: string };
}) => {
    const { formatMessage } = useI18n({ messages });
    const [fraOgMed, setFraOgMed] = React.useState<Nullable<Date>>(props.value.fraOgMed);
    const [tilOgMed, setTilOgMed] = React.useState<Nullable<Date>>(props.value.tilOgMed);

    React.useEffect(() => {
        props.onChange({ fraOgMed, tilOgMed });
    }, [fraOgMed, tilOgMed]);

    return (
        <div className={styles.rangePickerContainer}>
            <MonthPicker
                {...props}
                label={props.label?.fraOgMed ?? formatMessage('date.fraOgMed')}
                value={fraOgMed}
                onChange={setFraOgMed}
                error={props.error?.fraOgMed}
            />
            <MonthPicker
                {...props}
                label={props.label?.tilOgMed ?? formatMessage('date.tilOgMed')}
                value={tilOgMed}
                onChange={(d) => (d ? setTilOgMed(DateFns.endOfMonth(d)) : d)}
                error={props.error?.tilOgMed}
            />
        </div>
    );
};

export const RangePickerDate = (props: {
    label?: { fraOgMed?: string; tilOgMed?: string };
    value: { fraOgMed: Nullable<Date>; tilOgMed: Nullable<Date> };
    size?: 'medium' | 'small';
    fromDate?: Nullable<Date>;
    toDate?: Nullable<Date>;
    onChange: (periode: NullablePeriode) => void;
    error?: { fraOgMed?: string; tilOgMed?: string };
}) => {
    const { formatMessage } = useI18n({ messages });
    const { datepickerProps, fromInputProps, toInputProps } = useRangeDatepicker({
        fromDate: props.fromDate ?? new Date('2021-01-01'),
        toDate: props.toDate ?? DateFns.addYears(new Date(new Date().getFullYear(), 12, 0), 1),
        onRangeChange: (v) => props.onChange({ fraOgMed: v?.from ?? null, tilOgMed: v?.to ?? null }),
        defaultSelected: { from: props.value.fraOgMed ?? undefined, to: props.value.tilOgMed ?? undefined },
    });

    return (
        <DatePickerDS wrapperClassName={styles.rangePickerContainer} {...datepickerProps} dropdownCaption>
            <DatePickerDS.Input
                {...fromInputProps}
                label={props.label?.fraOgMed ?? formatMessage('date.fraOgMed')}
                size={props.size ?? 'medium'}
                error={props.error?.fraOgMed}
            />
            <DatePickerDS.Input
                {...toInputProps}
                label={props.label?.tilOgMed ?? formatMessage('date.tilOgMed')}
                size={props.size ?? 'medium'}
                error={props.error?.tilOgMed}
            />
        </DatePickerDS>
    );
};
