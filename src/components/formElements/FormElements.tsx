import { CollapseFilled, ExpandFilled } from '@navikt/ds-icons';
import { Radio, RadioGroup, RadioGroupProps } from '@navikt/ds-react';
import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

import { useI18n } from '~lib/i18n';
import { trackEvent } from '~lib/tracking/amplitude';
import { søknadHjelpeTekstKlikk } from '~lib/tracking/trackingEvents';
import { Nullable } from '~lib/types';

import nb from './formElements-nb';
import styles from './formElements.module.less';

interface BooleanRadioGroupProps extends Omit<RadioGroupProps, 'value' | 'onChange' | 'children'> {
    value: Nullable<boolean> | undefined;
    labels?: {
        true: string;
        false: string;
    };
    ref?: React.Ref<HTMLInputElement>;
    onChange(val: boolean): void;
}

/**
 * Første radioboks (true-alternativet) vil få `id = props.id ?? props.name`, og ref vil også bli gitt til denne.
 */
export const BooleanRadioGroup = ({ ref, labels, value, onChange, ...props }: BooleanRadioGroupProps) => {
    const { formatMessage } = useI18n({ messages: nb });
    return (
        <RadioGroup {...props} value={value?.toString()} onChange={(val) => onChange(val === true.toString())}>
            <Radio id={props.id ?? props.name} ref={ref} value={true.toString()}>
                {labels?.true ?? formatMessage('label.ja')}
            </Radio>
            <Radio value={false.toString()}>{labels?.false ?? formatMessage('label.nei')}</Radio>
        </RadioGroup>
    );
};

export const CollapsableFormElementDescription = (props: { title: string; children: React.ReactNode }) => {
    const [visMer, setVisMer] = useState(false);

    return (
        <div className={styles.hjelpetekstContainer}>
            <button
                className={styles.hjelpetekstKnapp}
                onClick={(e) => {
                    e.preventDefault();
                    setVisMer(!visMer);
                    trackEvent(søknadHjelpeTekstKlikk());
                }}
            >
                {props.title}
                {visMer ? <CollapseFilled /> : <ExpandFilled />}
            </button>
            <Collapse isOpened={visMer}>{props.children}</Collapse>
        </div>
    );
};
