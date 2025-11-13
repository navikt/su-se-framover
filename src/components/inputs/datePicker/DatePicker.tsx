import {
    DatePicker as DatePickerDS,
    HelpText,
    MonthPicker as MonthPickerDS,
    useDatepicker,
    useMonthpicker,
    useRangeDatepicker,
} from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import { useEffect } from 'react';

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
    const { datepickerProps, inputProps, setSelected } = useDatepicker({
        fromDate: props.fromDate ?? new Date(2000, 0, 1),
        toDate: props.toDate ?? new Date(2099, 11, 31),
        onDateChange: (d) => props.onChange(d ?? null),
        defaultSelected: props.value ?? undefined,
    });

    useEffect(() => {
        setSelected(props.value ?? undefined);
    }, [props.value?.toDateString()]);

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
    hjelpetekst?: string | React.ReactNode;
    value: Nullable<Date>;
    size?: 'medium' | 'small';
    fromDate?: Nullable<Date>;
    toDate?: Nullable<Date>;
    onChange: (date: Nullable<Date>) => void;
    error?: string;
}) => {
    const { monthpickerProps, inputProps } = useMonthpicker({
        fromDate: props.fromDate ?? new Date(2000, 0, 1),
        toDate: props.toDate ?? new Date(2099, 11, 31),
        onMonthChange: (d) => props.onChange(d ?? null),
        defaultSelected: props.value ?? undefined,
    });

    return (
        <div>
            <MonthPickerDS {...monthpickerProps} selected={props.value ?? undefined}>
                <MonthPickerDS.Input
                    {...inputProps}
                    label={
                        <div className={styles.datepickerLabelContainer}>
                            {props.label}
                            {props.hjelpetekst ? <HelpText placement="bottom">{props.hjelpetekst}</HelpText> : null}
                        </div>
                    }
                    size={props.size}
                    error={props.error}
                />
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

    return (
        <div className={styles.rangePickerContainer}>
            <MonthPicker
                {...props}
                key={props.value.fraOgMed?.toString()}
                label={props.label?.fraOgMed ?? formatMessage('date.fraOgMed')}
                value={props.value.fraOgMed}
                onChange={(d) => props.onChange({ fraOgMed: d, tilOgMed: props.value.tilOgMed })}
                error={props.error?.fraOgMed}
            />
            <MonthPicker
                {...props}
                key={props.value.tilOgMed?.toString()}
                label={props.label?.tilOgMed ?? formatMessage('date.tilOgMed')}
                value={props.value.tilOgMed}
                onChange={(d) =>
                    props.onChange({
                        fraOgMed: props.value.fraOgMed,
                        tilOgMed: d ? DateFns.endOfMonth(d) : d,
                    })
                }
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
        fromDate: props.fromDate ?? new Date(2000, 0, 0),
        toDate: props.toDate ?? new Date(2099, 11, 31),
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
