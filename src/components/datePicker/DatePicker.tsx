import { HelpText, Label, UNSAFE_MonthPicker, UNSAFE_DatePicker } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';
import { v4 as uuid } from 'uuid';

import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding';

import * as styles from './datePicker.module.less';

const MonthPicker = () => {
    return (
        <div>
            <UNSAFE_MonthPicker />
        </div>
    );
};

const DatePicker2 = () => {
    return (
        <div>
            <UNSAFE_DatePicker />
        </div>
    );
};

const DatePicker = (
    { label, value, feil, id = uuid(), className, hjelpetekst, ...datePickerProps },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: React.ForwardedRef<any>
) => {
    return (
        <div className={classNames(styles.container, className)}>
            <div className={styles.label}>
                <Label as="label" htmlFor={id}>
                    {label}
                </Label>
                {hjelpetekst && <HelpText>{hjelpetekst}</HelpText>}
            </div>
            <MonthPicker />
            <DatePicker2 />
            {feil && <SkjemaelementFeilmelding>{feil}</SkjemaelementFeilmelding>}
        </div>
    );
};

export default React.forwardRef(DatePicker);
