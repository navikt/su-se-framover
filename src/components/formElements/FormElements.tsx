import { CollapseFilled, ExpandFilled } from '@navikt/ds-icons';
import { Radio, RadioGroup, RadioGroupProps } from '@navikt/ds-react';
import { endOfMonth, startOfMonth } from 'date-fns';
import React, { forwardRef, useState } from 'react';
import { Collapse } from 'react-collapse';
import { FieldError } from 'react-hook-form';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { getDateErrorMessage } from '~src/lib/validering';

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
    fraOgMed: {
        id?: string;
        value?: Nullable<Date>;
        minDate?: Nullable<Date>;
        maxDate?: Nullable<Date>;
        setFraOgMed: (date: Nullable<Date>) => void;
        error?: FieldError;
    };
    tilOgMed: {
        id?: string;
        value?: Nullable<Date>;
        minDate?: Nullable<Date>;
        maxDate?: Nullable<Date>;
        setTilOgMed: (date: Nullable<Date>) => void;
        error?: FieldError;
    };
}) => {
    const { formatMessage } = useI18n({ messages: nb });

    return (
        <div className={styles.periodeFormContainer}>
            <DatePicker
                id={props.fraOgMed.id}
                label={formatMessage('periodeForm.label.fraOgMed')}
                feil={getDateErrorMessage(props.fraOgMed.error)}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                isClearable
                autoComplete="off"
                value={props.fraOgMed.value}
                minDate={props.fraOgMed.minDate}
                maxDate={props.fraOgMed.maxDate}
                onChange={(date: Nullable<Date>) => props.fraOgMed.setFraOgMed(date ? startOfMonth(date) : null)}
                startDate={props.fraOgMed.value}
                endDate={props.tilOgMed.value}
            />
            <DatePicker
                id={props.tilOgMed.id}
                label={formatMessage('periodeForm.label.tilOgMed')}
                feil={getDateErrorMessage(props.tilOgMed.error)}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                isClearable
                autoComplete="off"
                value={props.tilOgMed.value}
                minDate={props.tilOgMed.minDate}
                maxDate={props.tilOgMed.maxDate}
                onChange={(date: Date) => props.tilOgMed.setTilOgMed(date ? endOfMonth(date) : null)}
                startDate={props.fraOgMed.value}
                endDate={props.tilOgMed.value}
            />
        </div>
    );
};
