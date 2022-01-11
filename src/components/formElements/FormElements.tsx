import { CollapseFilled, ExpandFilled } from '@navikt/ds-icons';
import { Radio, RadioGroup, RadioGroupProps } from '@navikt/ds-react';
import React, { forwardRef, useState } from 'react';
import { Collapse } from 'react-collapse';

import { useI18n } from '~lib/i18n';
import { trackEvent } from '~lib/tracking/amplitude';
import { søknadHjelpeTekstKlikk } from '~lib/tracking/trackingEvents';
import { Nullable } from '~lib/types';

import nb from './formElements-nb';
import styles from './formElements.module.less';

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
