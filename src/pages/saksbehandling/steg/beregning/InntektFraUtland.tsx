import { currencies } from 'country-data-list';
import { FormikErrors } from 'formik';
import { Input, Select } from 'nav-frontend-skjema';
import React from 'react';
import { IntlShape } from 'react-intl';

import { UtenlandskInntekt } from '~types/Fradrag';

import { FradragFormData } from './FradragInputs';
import styles from './fradragInputs.module.less';

const InntektFraUtland = (props: {
    utenlandsBeløpId: string;
    valutaId: string;
    kursId: string;
    fradrag: FradragFormData;
    onChange: (e: React.ChangeEvent<HTMLElement>) => void;
    utenlandskInntektErrors: FormikErrors<UtenlandskInntekt> | undefined;
    intl: IntlShape;
}) => {
    const beløpIUtenlandskValutaError = props.utenlandskInntektErrors?.beløpIUtenlandskValuta;
    const valutaError = props.utenlandskInntektErrors?.valuta;
    const kursError = props.utenlandskInntektErrors?.kurs;
    const valuta = props.fradrag.utenlandskInntekt.valuta;

    return (
        <div className={styles.utlandOgPeriodeContainer}>
            <Input
                label={props.intl.formatMessage({ id: 'display.input.beløpIUtenlandskValuta' })}
                name={props.utenlandsBeløpId}
                value={props.fradrag.utenlandskInntekt?.beløpIUtenlandskValuta ?? ''}
                bredde="S"
                onChange={props.onChange}
                feil={beløpIUtenlandskValutaError}
            />
            <Select
                label={props.intl.formatMessage({ id: 'display.input.valuta' })}
                name={props.valutaId}
                value={valuta ?? ''}
                onChange={props.onChange}
                feil={valutaError}
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
                name={props.kursId}
                value={props.fradrag.utenlandskInntekt?.kurs ?? ''}
                bredde="S"
                onChange={props.onChange}
                feil={kursError}
            />
        </div>
    );
};

export default InntektFraUtland;
