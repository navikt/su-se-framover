import { CollapseFilled, ExpandFilled } from '@navikt/ds-icons';
import { Radio, RadioGroup, RadioGroupProps } from '@navikt/ds-react';
import { endOfMonth, startOfMonth } from 'date-fns';
import React, { forwardRef, useState } from 'react';
import { Collapse } from 'react-collapse';
import { FieldErrors } from 'react-hook-form';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { NullablePeriode } from '~src/types/Periode';

import DatePicker from '../datePicker/DatePicker';

import nb from './formElements-nb';
import * as styles from './formElements.module.less';

interface BooleanRadioGroupProps extends Omit<RadioGroupProps, 'value' | 'onChange' | 'children' | 'disabled'> {
    value: Nullable<boolean> | undefined;
    labels?: {
        true: string;
        false: string;
    };
    onChange(val: boolean): void;
}

/**
 * Første radioboks (true-alternativet) vil få `id = props.id ?? props.name`, og ref vil også bli gitt til denne.
 */
export const BooleanRadioGroup: React.ForwardRefExoticComponent<
    BooleanRadioGroupProps & React.RefAttributes<HTMLInputElement>
> = forwardRef<HTMLInputElement, BooleanRadioGroupProps>(({ labels, value, onChange, ...props }, ref) => {
    const { formatMessage } = useI18n({ messages: nb });
    return (
        <RadioGroup {...props} value={value?.toString() ?? ''} onChange={(val) => onChange(val === true.toString())}>
            <Radio id={props.id ?? props.name} ref={ref} value={true.toString()}>
                {labels?.true ?? formatMessage('label.ja')}
            </Radio>
            <Radio value={false.toString()}>{labels?.false ?? formatMessage('label.nei')}</Radio>
        </RadioGroup>
    );
});
BooleanRadioGroup.displayName = 'BooleanRadioGroup';

export const CollapsableFormElementDescription = (props: { title: string; children: React.ReactNode }) => {
    const [visMer, setVisMer] = useState(false);

    return (
        <div className={styles.hjelpetekstContainer}>
            <button
                className={styles.hjelpetekstKnapp}
                onClick={(e) => {
                    e.preventDefault();
                    setVisMer(!visMer);
                }}
            >
                {props.title}
                {visMer ? <CollapseFilled /> : <ExpandFilled />}
            </button>
            <Collapse isOpened={visMer}>{props.children}</Collapse>
        </div>
    );
};

export const PeriodeForm = (props: {
    containerClassname?: string;
    value: Nullable<NullablePeriode>;
    name: string;
    onChange: (periode: NullablePeriode) => void;
    error?: FieldErrors<NullablePeriode>;
    size?: 'S' | 'L';
    minDate: {
        fraOgMed?: Nullable<Date>;
        tilOgMed?: Nullable<Date>;
    };
    maxDate: {
        fraOgMed?: Nullable<Date>;
        tilOgMed?: Nullable<Date>;
    };
    disableTom?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages: nb });

    const lagNyPeriode = () => {
        return { fraOgMed: null, tilOgMed: null };
    };

    return (
        <div className={props.containerClassname ?? styles.periodeFormContainer}>
            <DatePicker
                id={`${props.name}.fraOgMed`}
                className={props.size === 'S' ? styles.dato : undefined}
                label={formatMessage('periodeForm.label.fraOgMed')}
                feil={props.error?.fraOgMed?.message}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                isClearable
                autoComplete="off"
                value={props.value?.fraOgMed}
                minDate={props.minDate.fraOgMed}
                maxDate={props.maxDate.tilOgMed}
                onChange={(date: Nullable<Date>) =>
                    props.onChange({
                        ...(props.value ?? lagNyPeriode()),
                        fraOgMed: date ? startOfMonth(date) : null,
                    })
                }
                startDate={props.value?.fraOgMed}
                endDate={props.value?.tilOgMed}
            />
            <DatePicker
                id={`${props.name}.tilOgMed`}
                className={props.size === 'S' ? styles.dato : undefined}
                label={formatMessage('periodeForm.label.tilOgMed')}
                feil={props.error?.tilOgMed?.message}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                disabled={props.disableTom}
                isClearable={!props.disableTom}
                autoComplete="off"
                value={props.value?.tilOgMed}
                minDate={props.minDate.fraOgMed}
                maxDate={props.maxDate.tilOgMed}
                onChange={(date: Nullable<Date>) =>
                    props.onChange({ ...(props.value ?? lagNyPeriode()), tilOgMed: date ? endOfMonth(date) : null })
                }
                startDate={props.value?.fraOgMed}
                endDate={props.value?.tilOgMed}
            />
        </div>
    );
};
