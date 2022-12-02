import { CollapseFilled, ExpandFilled } from '@navikt/ds-icons';
import { Radio, RadioGroup, RadioGroupProps } from '@navikt/ds-react';
import classNames from 'classnames';
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
import './formElements.module.less';

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

export const CollapsableFormElementDescription = (props: {
    title: string | JSX.Element;
    elementerEtterTittel?: JSX.Element;
    children: React.ReactNode;
    className?: string;
}) => {
    const [visMer, setVisMer] = useState(false);

    return (
        <div className={props.className}>
            <button className={styles.hjelpetekstKnapp} type="button" onClick={() => setVisMer(!visMer)}>
                {props.title}
                {visMer ? <CollapseFilled /> : <ExpandFilled />}
                {props.elementerEtterTittel}
            </button>
            <Collapse isOpened={visMer}>{props.children}</Collapse>
        </div>
    );
};

export const PeriodeForm = (props: {
    containerClassname?: string;
    value: Nullable<NullablePeriode>;
    name: string;
    label?: {
        fraOgMed?: string;
        tilOgMed?: string;
    };
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
    medDager?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages: nb });

    const lagNyPeriode = () => {
        return { fraOgMed: null, tilOgMed: null };
    };

    return (
        <div className={props.containerClassname ?? styles.periodeFormContainer}>
            <DatePicker
                id={`${props.name}.fraOgMed`}
                className={classNames({
                    [styles.dato]: props.size === 'S',
                })}
                label={props.label?.fraOgMed ?? formatMessage('periodeForm.label.fraOgMed')}
                feil={props.error?.fraOgMed?.message}
                dateFormat={props.medDager ? 'dd.MM.yyyy' : 'MM.yyyy'}
                showMonthYearPicker={!props.medDager}
                isClearable
                selectsStart
                autoComplete="off"
                value={props.value?.fraOgMed}
                minDate={props.minDate.fraOgMed}
                maxDate={props.maxDate.tilOgMed}
                onChange={(date: Nullable<Date>) =>
                    props.onChange({
                        ...(props.value ?? lagNyPeriode()),
                        fraOgMed: date ? (props.medDager ? date : startOfMonth(date)) : null,
                    })
                }
                startDate={props.value?.fraOgMed}
                endDate={props.value?.tilOgMed}
            />
            <DatePicker
                id={`${props.name}.tilOgMed`}
                className={props.size === 'S' ? styles.dato : undefined}
                label={props.label?.tilOgMed ?? formatMessage('periodeForm.label.tilOgMed')}
                feil={props.error?.tilOgMed?.message}
                dateFormat={props.medDager ? 'dd.MM.yyyy' : 'MM.yyyy'}
                showMonthYearPicker={!props.medDager}
                autoComplete="off"
                isClearable
                selectsEnd
                value={props.value?.tilOgMed}
                minDate={props.minDate.fraOgMed}
                maxDate={props.maxDate.tilOgMed}
                onChange={(date: Nullable<Date>) =>
                    props.onChange({
                        ...(props.value ?? lagNyPeriode()),
                        tilOgMed: date ? (props.medDager ? date : endOfMonth(date)) : null,
                    })
                }
                startDate={props.value?.fraOgMed}
                endDate={props.value?.tilOgMed}
            />
        </div>
    );
};
