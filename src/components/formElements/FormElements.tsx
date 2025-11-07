import { Radio, RadioGroup, RadioGroupProps } from '@navikt/ds-react';
import { endOfMonth } from 'date-fns';
import { ForwardRefExoticComponent, forwardRef, RefAttributes } from 'react';
import { FieldErrorsImpl } from 'react-hook-form';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { NullablePeriode } from '~src/types/Periode';

import { MonthPicker } from '../inputs/datePicker/DatePicker';
import styles from './formElements.module.less';
import nb from './formElements-nb';

interface BooleanRadioGroupProps extends Omit<RadioGroupProps, 'value' | 'onChange' | 'children' | 'disabled'> {
    value: Nullable<boolean> | undefined;
    children?: React.ReactNode;
    labels?: {
        true: string;
        false: string;
    };
    onChange(val: boolean): void;
}

/**
 * Første radioboks (true-alternativet) vil få `id = props.id ?? props.name`, og ref vil også bli gitt til denne.
 */
export const BooleanRadioGroup: ForwardRefExoticComponent<BooleanRadioGroupProps & RefAttributes<HTMLInputElement>> =
    forwardRef<HTMLInputElement, BooleanRadioGroupProps>(({ labels, value, onChange, ...props }, ref) => {
        const { formatMessage } = useI18n({ messages: nb });
        return (
            <RadioGroup
                {...props}
                value={value?.toString() ?? ''}
                onChange={(val) => onChange(val === true.toString())}
            >
                {props.children}
                <Radio id={props.id ?? props.name} ref={ref} value={true.toString()}>
                    {labels?.true ?? formatMessage('label.ja')}
                </Radio>
                <Radio value={false.toString()}>{labels?.false ?? formatMessage('label.nei')}</Radio>
            </RadioGroup>
        );
    });
BooleanRadioGroup.displayName = 'BooleanRadioGroup';

export const PeriodeForm = (props: {
    containerClassname?: string;
    value: Nullable<NullablePeriode>;
    onChange: (periode: NullablePeriode) => void;
    error?: FieldErrorsImpl<NullablePeriode>;
    size?: 'medium' | 'small';
    minDate: Nullable<Date>;
    maxDate: Nullable<Date>;
}) => {
    const { formatMessage } = useI18n({ messages: nb });

    return (
        <div className={props.containerClassname ?? styles.periodeFormContainer}>
            <MonthPicker
                label={formatMessage('periodeForm.label.fraOgMed')}
                value={props.value?.fraOgMed ?? null}
                size={props.size}
                fromDate={props.minDate}
                toDate={props.maxDate}
                onChange={(date: Nullable<Date>) =>
                    props.onChange({
                        fraOgMed: date ? date : null,
                        tilOgMed: props.value?.tilOgMed ?? null,
                    })
                }
                error={props.error?.fraOgMed?.message}
            />
            <MonthPicker
                label={formatMessage('periodeForm.label.tilOgMed')}
                value={props.value?.tilOgMed ?? null}
                fromDate={props.minDate}
                size={props.size}
                toDate={props.maxDate}
                onChange={(date: Nullable<Date>) =>
                    props.onChange({
                        fraOgMed: props.value?.fraOgMed ?? null,
                        tilOgMed: date ? endOfMonth(date) : null,
                    })
                }
                error={props.error?.tilOgMed?.message}
            />
        </div>
    );
};
