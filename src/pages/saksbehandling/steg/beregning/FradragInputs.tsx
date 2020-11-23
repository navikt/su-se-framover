import { FormikErrors } from 'formik';
import { Knapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import { SkjemaGruppe, Select, Input, Checkbox, InputProps } from 'nav-frontend-skjema';
import { Normaltekst, Feilmelding } from 'nav-frontend-typografi';
import React from 'react';
import { IntlShape } from 'react-intl';

import { TrashBin } from '~assets/Icons';
import { Nullable, KeyDict } from '~lib/types';
import yup, { validateStringAsPositiveNumber } from '~lib/validering';
import InntektFraUtland from '~pages/saksbehandling/steg/beregning/InntektFraUtland';
import { Fradrag, Fradragstype, UtenlandskInntekt } from '~types/Fradrag';

import * as BeregningUtils from './beregningUtils';
import styles from './fradragInputs.module.less';

export interface FradragFormData {
    type: Nullable<Fradragstype>;
    beløp: Nullable<string>;
    fraUtland: boolean;
    utenlandskInntekt: UtenlandskInntektFormData;
    tilhørerEPS: boolean;
}

export interface UtenlandskInntektFormData {
    beløpIUtenlandskValuta: string;
    valuta: string;
    kurs: string;
}

const FradragObjectKeys: KeyDict<FradragFormData> = {
    type: 'type',
    beløp: 'beløp',
    fraUtland: 'fraUtland',
    utenlandskInntekt: 'utenlandskInntekt',
    tilhørerEPS: 'tilhørerEPS',
};

const UtenlandskInntektKeys: KeyDict<UtenlandskInntekt> = {
    beløpIUtenlandskValuta: 'beløpIUtenlandskValuta',
    valuta: 'valuta',
    kurs: 'kurs',
};

const InputWithFollowText = (props: {
    tittel: string;
    inputName: string;
    inputTekst: string;
    value: string;
    bredde?: InputProps['bredde'];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    feil: string | undefined;
}) => (
    <div>
        <h3>{props.tittel}</h3>
        <span className={styles.inputOgtekstContainer}>
            <Input
                className={styles.inputWithFollowTextInputfelt}
                name={props.inputName}
                value={props.value}
                bredde={props.bredde}
                onChange={props.onChange}
            />
            <Normaltekst>{props.inputTekst}</Normaltekst>
        </span>
        {props.feil && <Feilmelding>{props.feil}</Feilmelding>}
    </div>
);

const FradragsSelection = (props: {
    label: string;
    id: string;
    className: string;
    name: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    feil: string | undefined;
    intl: IntlShape;
    optionLabel: string;
}) => (
    <div>
        <h3>{props.label}</h3>
        <Select
            onChange={props.onChange}
            id={props.id}
            name={props.name}
            value={props.value}
            className={props.className}
        >
            <option value="">{props.intl.formatMessage({ id: 'fradrag.type.emptyLabel' })}</option>
            {Object.values(Fradragstype)
                .filter((type) => type !== Fradragstype.ForventetInntekt)
                .map((f) => (
                    <option value={f} key={f}>
                        {props.intl.formatMessage({ id: BeregningUtils.fradragstypeResourceId(f) })}
                    </option>
                ))}
        </Select>
        {props.feil && <Feilmelding>{props.feil}</Feilmelding>}
    </div>
);

const utenlandskInntekt = yup
    .object<UtenlandskInntektFormData>()
    .defined()
    .when('fraUtland', {
        is: true,
        then: yup.object<UtenlandskInntektFormData>({
            beløpIUtenlandskValuta: validateStringAsPositiveNumber,
            valuta: yup.string().required(),
            kurs: validateStringAsPositiveNumber,
        }),
        otherwise: yup.object<UtenlandskInntektFormData>(),
    });

export const fradragSchema = yup.object<FradragFormData>({
    beløp: validateStringAsPositiveNumber,
    type: yup.string().defined().oneOf(Object.values(Fradragstype), 'Du må velge en fradragstype'),
    fraUtland: yup.boolean(),
    utenlandskInntekt: utenlandskInntekt,
    tilhørerEPS: yup.boolean(),
});

export const isValidFradrag = (f: unknown): f is Fradrag => fradragSchema.isValidSync(f);

export const FradragInputs = (props: {
    fradrag: FradragFormData[];
    feltnavn: string;
    errors: string | string[] | Array<FormikErrors<FradragFormData>> | undefined;
    intl: IntlShape;
    onChange: (e: React.ChangeEvent<unknown>) => void;
    setFieldValue: (field: string, value: Date | [Date, Date] | null | string) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    return (
        <div className={styles.fradragContainer}>
            {typeof props.errors === 'string' && props.errors}

            {props.fradrag.map((fradrag, index) => {
                const errorForLinje = Array.isArray(props.errors) ? props.errors[index] : null;
                const name = `${props.feltnavn}[${index}]`;
                const typeId = `${name}.${FradragObjectKeys.type}`;
                const belopId = `${name}.${FradragObjectKeys.beløp}`;
                const fraUtlandId = `${name}.${FradragObjectKeys.fraUtland}`;
                const tilhørerEPSId = `${name}.${FradragObjectKeys.tilhørerEPS}`;
                const beløpIUtenlandskValuta = `${name}.${FradragObjectKeys.utenlandskInntekt}.${UtenlandskInntektKeys.beløpIUtenlandskValuta}`;
                const valutaId = `${name}.${FradragObjectKeys.utenlandskInntekt}.${UtenlandskInntektKeys.valuta}`;
                const kursId = `${name}.${FradragObjectKeys.utenlandskInntekt}.${UtenlandskInntektKeys.kurs}`;

                return (
                    <Panel key={index} border className={styles.fradragItemContainer}>
                        <SkjemaGruppe>
                            <div className={styles.fradragTypeOgBelopContainer}>
                                <FradragsSelection
                                    label={props.intl.formatMessage({ id: 'display.fradrag.type' })}
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
                                    optionLabel={props.intl.formatMessage({ id: 'fradrag.type.emptyLabel' })}
                                    intl={props.intl}
                                />
                                <InputWithFollowText
                                    tittel={props.intl.formatMessage({ id: 'display.fradrag.beløp' })}
                                    inputName={belopId}
                                    value={fradrag.beløp?.toString() ?? ''}
                                    bredde={'S'}
                                    inputTekst="NOK"
                                    onChange={props.onChange}
                                    feil={
                                        errorForLinje && typeof errorForLinje === 'object'
                                            ? errorForLinje.beløp
                                            : undefined
                                    }
                                />
                                <Knapp
                                    className={styles.søppelbøtteContainer}
                                    htmlType={'button'}
                                    onClick={() => props.onFjernClick(index)}
                                >
                                    <TrashBin width={'10'} height={'10'} />
                                </Knapp>
                            </div>
                            <div className={styles.checkboxContainer}>
                                <Checkbox
                                    label={props.intl.formatMessage({ id: 'display.checkbox.tilhørerEPS' })}
                                    name={tilhørerEPSId}
                                    className={styles.checkbox}
                                    checked={fradrag.tilhørerEPS}
                                    onChange={props.onChange}
                                />
                                <Checkbox
                                    label={props.intl.formatMessage({ id: 'display.checkbox.fraUtland' })}
                                    name={fraUtlandId}
                                    checked={fradrag.fraUtland}
                                    className={styles.checkbox}
                                    onChange={(e) => {
                                        props.onChange(e);
                                        if (fradrag.fraUtland) {
                                            props.setFieldValue(beløpIUtenlandskValuta, '');
                                            props.setFieldValue(valutaId, '');
                                            props.setFieldValue(kursId, '');
                                        }
                                    }}
                                />
                            </div>
                            {fradrag.fraUtland && (
                                <InntektFraUtland
                                    utenlandsBeløpId={beløpIUtenlandskValuta}
                                    valutaId={valutaId}
                                    kursId={kursId}
                                    fradrag={fradrag}
                                    onChange={props.onChange}
                                    utenlandskInntektErrors={
                                        errorForLinje &&
                                        typeof errorForLinje === 'object' &&
                                        errorForLinje.utenlandskInntekt
                                            ? errorForLinje.utenlandskInntekt
                                            : undefined
                                    }
                                    intl={props.intl}
                                />
                            )}
                        </SkjemaGruppe>
                    </Panel>
                );
            })}

            <div className={styles.leggTilNyttFradragContainer}>
                <Knapp onClick={() => props.onLeggTilClick()} htmlType="button" mini>
                    {props.intl.formatMessage({ id: 'knapp.fradrag.leggtil' })}
                </Knapp>
            </div>
        </div>
    );
};
