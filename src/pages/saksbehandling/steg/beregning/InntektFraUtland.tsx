import { currencies } from 'country-data-list';
import { FormikErrors } from 'formik';
import { Input, Select } from 'nav-frontend-skjema';
import React from 'react';
import { IntlShape } from 'react-intl';

import { UtenlandskInntekt } from '~types/Fradrag';

import { UtenlandskInntektFormData } from './beregningstegTypes';
import styles from './fradragInputs.module.less';

const InntektFraUtland = (props: {
    value: UtenlandskInntektFormData;
    onChange: (e: UtenlandskInntektFormData) => void;
    errors: FormikErrors<UtenlandskInntekt> | undefined;
    intl: IntlShape;
}) => {
    return (
        <div className={styles.utlandOgPeriodeContainer}>
            <Input
                label={props.intl.formatMessage({ id: 'display.input.beløpIUtenlandskValuta' })}
                value={props.value.beløpIUtenlandskValuta}
                bredde="S"
                onChange={(a) =>
                    props.onChange({
                        ...props.value,
                        beløpIUtenlandskValuta: a.target.value,
                    })
                }
                feil={props.errors?.beløpIUtenlandskValuta}
            />
            <Select
                label={props.intl.formatMessage({ id: 'display.input.valuta' })}
                value={props.value.valuta}
                onChange={(a) =>
                    props.onChange({
                        ...props.value,
                        valuta: a.target.value,
                    })
                }
                feil={props.errors?.valuta}
                bredde="s"
            >
                <option value="" disabled={true}>
                    Velg valuta..
                </option>
                {currencies.all.map((c) => (
                    <option value={c.code} key={c.number}>
                        {c.code}
                    </option>
                ))}
            </Select>
            <Input
                label={props.intl.formatMessage({ id: 'display.input.kurs' })}
                value={props.value.kurs}
                bredde="S"
                onChange={(a) =>
                    props.onChange({
                        ...props.value,
                        kurs: a.target.value,
                    })
                }
                feil={props.errors?.kurs}
            />
        </div>
    );
};

export default InntektFraUtland;
