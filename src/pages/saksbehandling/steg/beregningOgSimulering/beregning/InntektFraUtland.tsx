import { currencies } from 'country-data-list';
import { FormikErrors } from 'formik';
import { Input, Label, Select } from 'nav-frontend-skjema';
import React from 'react';
import { IntlShape } from 'react-intl';

import { UtenlandskInntekt } from '~types/Fradrag';

import { UtenlandskInntektFormData } from './beregningstegTypes';
import styles from './fradragInputs.module.less';

const InntektFraUtland = (props: {
    name: string;
    value: UtenlandskInntektFormData;
    onChange: (e: UtenlandskInntektFormData) => void;
    errors: FormikErrors<UtenlandskInntekt> | undefined;
    intl: IntlShape;
}) => {
    const beløpId = `${props.name}.beløp`;
    const kursId = `${props.name}.kurs`;
    const valutaId = `${props.name}.valuta`;

    return (
        <div className={styles.utlandOgPeriodeContainer}>
            <Label htmlFor={beløpId} className={styles.label}>
                {props.intl.formatMessage({ id: 'display.input.beløpIUtenlandskValuta' })}
            </Label>
            <Input
                id={beløpId}
                value={props.value.beløpIUtenlandskValuta}
                onChange={(a) =>
                    props.onChange({
                        ...props.value,
                        beløpIUtenlandskValuta: a.target.value,
                    })
                }
                feil={props.errors?.beløpIUtenlandskValuta}
            />
            <Label htmlFor={valutaId} className={styles.label}>
                {props.intl.formatMessage({ id: 'display.input.valuta' })}
            </Label>
            <Select
                id={valutaId}
                value={props.value.valuta}
                onChange={(a) =>
                    props.onChange({
                        ...props.value,
                        valuta: a.target.value,
                    })
                }
                feil={props.errors?.valuta}
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
            <Label htmlFor={kursId} className={styles.label}>
                {props.intl.formatMessage({ id: 'display.input.kurs' })}
            </Label>
            <Input
                id={kursId}
                value={props.value.kurs}
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
