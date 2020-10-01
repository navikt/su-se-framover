import { FormikErrors } from 'formik';
import { Input } from 'nav-frontend-skjema';
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
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    utenlandskInntektErrors: FormikErrors<UtenlandskInntekt> | undefined;
    intl: IntlShape;
}) => {
    const beløpIUtenlandskValutaError = props.utenlandskInntektErrors?.beløpIUtenlandskValuta;
    const valutaError = props.utenlandskInntektErrors?.valuta;
    const kursError = props.utenlandskInntektErrors?.kurs;

    return (
        <div className={styles.inntektFraUtlandContainer}>
            <Input
                label={props.intl.formatMessage({ id: 'display.input.beløpIUtenlandskValuta' })}
                name={props.utenlandsBeløpId}
                value={props.fradrag.utenlandskInntekt?.beløpIUtenlandskValuta ?? ''}
                bredde={'M'}
                onChange={props.onChange}
                feil={beløpIUtenlandskValutaError}
            />
            <Input
                label={props.intl.formatMessage({ id: 'display.input.valuta' })}
                name={props.valutaId}
                value={props.fradrag.utenlandskInntekt?.valuta ?? ''}
                bredde={'S'}
                onChange={props.onChange}
                feil={valutaError}
            />
            <Input
                label={props.intl.formatMessage({ id: 'display.input.kurs' })}
                name={props.kursId}
                value={props.fradrag.utenlandskInntekt?.kurs ?? ''}
                bredde={'S'}
                onChange={props.onChange}
                feil={kursError}
            />
        </div>
    );
};

export default InntektFraUtland;
