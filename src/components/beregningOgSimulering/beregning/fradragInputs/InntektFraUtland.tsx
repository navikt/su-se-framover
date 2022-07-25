import { TextField, Label, Select } from '@navikt/ds-react';
import { currencies } from 'country-data-list';
import React from 'react';
import { FieldErrors } from 'react-hook-form';

import { useI18n } from '~src/lib/i18n';
import { UtenlandskInntekt } from '~src/types/Fradrag';

import { UtenlandskInntektFormData } from '../beregningstegTypes';

import messages from './fradragInputs-nb';
import styles from './fradragInputs.module.less';

const InntektFraUtland = (props: {
    name: string;
    value: UtenlandskInntektFormData;
    onChange: (e: UtenlandskInntektFormData) => void;
    errors: FieldErrors<UtenlandskInntekt> | undefined;
}) => {
    const { formatMessage } = useI18n({ messages });

    const beløpId = `${props.name}.beløp`;
    const kursId = `${props.name}.kurs`;
    const valutaId = `${props.name}.valuta`;

    return (
        <div className={styles.utlandOgPeriodeContainer}>
            <Label as="label" htmlFor={beløpId} className={styles.label}>
                {formatMessage('display.input.beløpIUtenlandskValuta')}
            </Label>
            <TextField
                id={beløpId}
                label={formatMessage('display.input.beløpIUtenlandskValuta')}
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
                {formatMessage('display.input.valuta')}
            </Label>
            <Select
                id={valutaId}
                name={valutaId}
                label={formatMessage('display.input.valuta')}
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
                    {formatMessage('display.input.kurs')}
                </Label>
                <p className={styles.description}>{formatMessage('display.input.kurs.desimal')}</p>
            </div>
            <TextField
                id={kursId}
                label={formatMessage('display.input.kurs')}
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
