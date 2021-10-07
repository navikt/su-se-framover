import { TextField, Label, Select } from '@navikt/ds-react';
import { currencies } from 'country-data-list';
import { FormikErrors } from 'formik';
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
            <Label as="label" htmlFor={beløpId} className={styles.label}>
                {props.intl.formatMessage({ id: 'display.input.beløpIUtenlandskValuta' })}
            </Label>
            <TextField
                id={beløpId}
                label={props.intl.formatMessage({ id: 'display.input.beløpIUtenlandskValuta' })}
                name={beløpId}
                hideLabel
                value={props.value.beløpIUtenlandskValuta}
                onChange={(a) =>
                    props.onChange({
                        ...props.value,
                        beløpIUtenlandskValuta: a.target.value,
                    })
                }
                error={!!props.errors?.beløpIUtenlandskValuta}
            />
            <Label as="label" htmlFor={valutaId} className={styles.label}>
                {props.intl.formatMessage({ id: 'display.input.valuta' })}
            </Label>
            <Select
                id={valutaId}
                name={valutaId}
                label={props.intl.formatMessage({ id: 'display.input.valuta' })}
                hideLabel
                value={props.value.valuta}
                onChange={(a) =>
                    props.onChange({
                        ...props.value,
                        valuta: a.target.value,
                    })
                }
                error={!!props.errors?.valuta}
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
            <div className={styles.labelAndDescription}>
                <Label as="label" htmlFor={kursId} className={styles.label}>
                    {props.intl.formatMessage({ id: 'display.input.kurs' })}
                </Label>
                <p className={styles.description}>{props.intl.formatMessage({ id: 'display.input.kurs.desimal' })}</p>
            </div>
            <TextField
                id={kursId}
                label={props.intl.formatMessage({ id: 'display.input.kurs' })}
                hideLabel
                name={kursId}
                value={props.value.kurs}
                onChange={(a) =>
                    props.onChange({
                        ...props.value,
                        kurs: a.target.value,
                    })
                }
                error={!!props.errors?.kurs}
            />
        </div>
    );
};

export default InntektFraUtland;
