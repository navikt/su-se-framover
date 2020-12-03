import { currencies } from 'country-data-list';
import { FormikErrors } from 'formik';
import { Input, Label, Select, SkjemaelementFeilmelding } from 'nav-frontend-skjema';
import React, { useRef } from 'react';
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
    const rand = useRef(Math.random());

    const beløpId = `beløp-${rand.current}`;
    const kursId = `kurs-${rand.current}`;
    const valutaId = `valuta-${rand.current}`;

    return (
        <div className={styles.utlandOgPeriodeContainer}>
            <Label htmlFor={beløpId}>{props.intl.formatMessage({ id: 'display.input.beløpIUtenlandskValuta' })}</Label>
            <Input
                id={beløpId}
                value={props.value.beløpIUtenlandskValuta}
                onChange={(a) =>
                    props.onChange({
                        ...props.value,
                        beløpIUtenlandskValuta: a.target.value,
                    })
                }
            />
            {props.errors?.beløpIUtenlandskValuta ? (
                <SkjemaelementFeilmelding>{props.errors.beløpIUtenlandskValuta}</SkjemaelementFeilmelding>
            ) : (
                <span />
            )}
            <Label htmlFor={valutaId}>{props.intl.formatMessage({ id: 'display.input.valuta' })}</Label>
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
            {props.errors?.valuta ? (
                <SkjemaelementFeilmelding>{props.errors.valuta}</SkjemaelementFeilmelding>
            ) : (
                <span />
            )}
            <Label htmlFor={kursId}>{props.intl.formatMessage({ id: 'display.input.kurs' })}</Label>
            <Input
                id={kursId}
                value={props.value.kurs}
                onChange={(a) =>
                    props.onChange({
                        ...props.value,
                        kurs: a.target.value,
                    })
                }
            />
            {props.errors?.kurs ? <SkjemaelementFeilmelding>{props.errors.kurs}</SkjemaelementFeilmelding> : <span />}
        </div>
    );
};

export default InntektFraUtland;
