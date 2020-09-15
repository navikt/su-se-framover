import { FormikErrors } from 'formik';
import { Knapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import { SkjemaGruppe, Select, Input } from 'nav-frontend-skjema';
import React from 'react';
import { IntlShape } from 'react-intl';

import { Fradrag, Fradragstype } from '~api/behandlingApi';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';

import styles from './beregning.module.less';

export interface FradragFormData {
    type: Nullable<Fradragstype>;
    beløp: Nullable<number>;
    beskrivelse: Nullable<string>;
}

export const fradragSchema = yup.object<FradragFormData>({
    beløp: yup.number().typeError('Beløp må være et tall').required(),
    beskrivelse: yup.string().defined().default(null),
    type: yup.string().defined().oneOf(Object.values(Fradragstype), 'Du må velge en fradragstype'),
});

export const isValidFradrag = (f: FradragFormData): f is Fradrag => fradragSchema.isValidSync(f);

export const FradragInputs = (props: {
    fradrag: Array<FradragFormData>;
    feltnavn: string;
    errors: string | string[] | FormikErrors<FradragFormData>[] | undefined;
    intl: IntlShape;
    onChange: (e: React.ChangeEvent<unknown>) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    return (
        <div className={styles.fradragContainer}>
            {typeof props.errors === 'string' && props.errors}
            {props.fradrag.map((fradrag, index) => {
                const errorForLinje = Array.isArray(props.errors) ? props.errors[index] : null;
                const name = `${props.feltnavn}[${index}]`;
                const typeId = `${name}.type`;
                const belopId = `${name}.beløp`;
                const beskrivelseId = `${name}.beskrivelse`;

                return (
                    <Panel key={index} border className={styles.fradragItemContainer}>
                        <SkjemaGruppe legend={`Fradrag ${index + 1}`}>
                            <div className={styles.fradragTypeOgBelopContainer}>
                                <Select
                                    label={props.intl.formatMessage({ id: 'input.fradragstype.label' })}
                                    onChange={props.onChange}
                                    id={typeId}
                                    name={typeId}
                                    value={fradrag.type?.toString() ?? ''}
                                    feil={
                                        errorForLinje && typeof errorForLinje === 'object'
                                            ? errorForLinje.type
                                            : undefined
                                    }
                                    className={styles.fradragtype}
                                >
                                    <option value="">
                                        {props.intl.formatMessage({ id: 'input.fradragstype.emptyLabel' })}
                                    </option>
                                    {Object.values(Fradragstype).map((f) => (
                                        <option value={f} key={f}>
                                            {props.intl.formatMessage({ id: fradragstypeResourceId(f) })}
                                        </option>
                                    ))}
                                </Select>
                                <Input
                                    label={props.intl.formatMessage({ id: 'input.fradragsbeløp.label' })}
                                    id={belopId}
                                    name={belopId}
                                    onChange={props.onChange}
                                    inputMode="decimal"
                                    value={fradrag.beløp ?? ''}
                                    feil={
                                        errorForLinje && typeof errorForLinje === 'object'
                                            ? errorForLinje.beløp
                                            : undefined
                                    }
                                />
                            </div>
                            <Input
                                label={props.intl.formatMessage({ id: 'input.fradragsbeskrivelse.label' })}
                                id={beskrivelseId}
                                name={beskrivelseId}
                                onChange={props.onChange}
                                value={fradrag.beskrivelse ?? ''}
                                feil={
                                    errorForLinje && typeof errorForLinje === 'object'
                                        ? errorForLinje.beskrivelse
                                        : undefined
                                }
                            />
                            <Knapp onClick={() => props.onFjernClick(index)} htmlType="button">
                                {props.intl.formatMessage({ id: 'knapp.fradrag.fjern' })}
                            </Knapp>
                            {errorForLinje && typeof errorForLinje === 'string' && errorForLinje}
                        </SkjemaGruppe>
                    </Panel>
                );
            })}
            <div>
                <Knapp onClick={() => props.onLeggTilClick()} htmlType="button">
                    {props.intl.formatMessage({ id: 'knapp.fradrag.leggtil' })}
                </Knapp>
            </div>
        </div>
    );
};

const fradragstypeResourceId = (f: Fradragstype): string => {
    switch (f) {
        case Fradragstype.Uføretrygd:
            return 'fradrag.type.uføre';
        case Fradragstype.Barnetillegg:
            return 'fradrag.type.barnetillegg';
        case Fradragstype.Arbeidsinntekt:
            return 'fradrag.type.arbeidsinntekt';
        case Fradragstype.Pensjon:
            return 'fradrag.type.pensjon';
        case Fradragstype.Kapitalinntekt:
            return 'fradrag.type.kapitalinntekt';
        case Fradragstype.AndreYtelser:
            return 'fradrag.type.andreytelser';
    }
};
