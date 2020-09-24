import { FormikErrors } from 'formik';
import { Input } from 'nav-frontend-skjema';
import React from 'react';
import { IntlShape } from 'react-intl';

import { FradragFormData } from '~features/beregning';
import { FraUtlandInntekt } from '~types/Fradrag';

import styles from './beregning.module.less';

const InntektFraUtland = (props: {
    utenlandsBeløpId: string;
    valutaId: string;
    kursId: string;
    fradrag: FradragFormData;
    fradragsArray: FradragFormData[];
    index: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    utenlandsInntektChanger: (
        keyNavn: keyof Pick<FraUtlandInntekt, 'valuta' | 'kurs' | 'beløpUtenlandskValuta'>,
        value: string,
        index: number,
        fradrag: Array<FradragFormData>
    ) => void;
    fraUtlandInntektErrors: FormikErrors<FraUtlandInntekt> | undefined;
    intl: IntlShape;
}) => {
    const beløpUtenlandskValutaError = props.fraUtlandInntektErrors?.beløpUtenlandskValuta;
    const valutaError = props.fraUtlandInntektErrors?.valuta;
    const kursError = props.fraUtlandInntektErrors?.kurs;

    return (
        <div className={styles.inntektFraUtlandContainer}>
            <Input
                label={props.intl.formatMessage({ id: 'display.input.beløpUtenlandskValuta' })}
                name={props.utenlandsBeløpId}
                value={props.fradrag.fraUtlandInntekt?.beløpUtenlandskValuta ?? ''}
                bredde={'M'}
                onChange={(e) => {
                    props.utenlandsInntektChanger(
                        'beløpUtenlandskValuta',
                        e.target.value,
                        props.index,
                        props.fradragsArray
                    );
                }}
                feil={beløpUtenlandskValutaError}
            />
            <Input
                label={props.intl.formatMessage({ id: 'display.input.valuta' })}
                name={props.valutaId}
                value={props.fradrag.fraUtlandInntekt?.valuta ?? ''}
                bredde={'S'}
                onChange={(e) => {
                    props.utenlandsInntektChanger('valuta', e.target.value, props.index, props.fradragsArray);
                }}
                feil={valutaError}
            />
            <Input
                label={props.intl.formatMessage({ id: 'display.input.kurs' })}
                name={props.kursId}
                value={props.fradrag.fraUtlandInntekt?.kurs ?? ''}
                bredde={'S'}
                onChange={(e) => {
                    props.utenlandsInntektChanger('kurs', e.target.value, props.index, props.fradragsArray);
                }}
                feil={kursError}
            />
        </div>
    );
};

export default InntektFraUtland;
