import { format, lastDayOfMonth } from 'date-fns';
import { FormikErrors } from 'formik';
import { Knapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import { SkjemaGruppe, Select, Input, Checkbox, InputProps, Label } from 'nav-frontend-skjema';
import { Normaltekst, Feilmelding } from 'nav-frontend-typografi';
import React from 'react';
import DatePicker from 'react-datepicker';
import { IntlShape } from 'react-intl';

import { TrashBin } from '~assets/Icons';
import { Nullable, KeyDict } from '~lib/types';
import yup, { validateStringAsPositiveNumber } from '~lib/validering';
import InntektFraUtland from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/InntektFraUtland';
import { Fradrag, Fradragstype } from '~types/Fradrag';

import { UtenlandskInntektFormData } from './beregningstegTypes';
import * as BeregningUtils from './beregningUtils';
import styles from './fradragInputs.module.less';

export interface FradragFormData {
    type: Nullable<Fradragstype>;
    beløp: Nullable<string>;
    fraUtland: boolean;
    utenlandskInntekt: UtenlandskInntektFormData;
    tilhørerEPS: boolean;
    periode: Nullable<{
        fraOgMed: Nullable<string>;
        tilOgMed: Nullable<string>;
    }>;
}

const FradragObjectKeys: KeyDict<FradragFormData> = {
    type: 'type',
    beløp: 'beløp',
    fraUtland: 'fraUtland',
    utenlandskInntekt: 'utenlandskInntekt',
    tilhørerEPS: 'tilhørerEPS',
    periode: 'periode',
};

const InputWithFollowText = (props: {
    tittel: string;
    inputName: string;
    inputTekst: string;
    value: string;
    bredde?: InputProps['bredde'];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    feil: string | undefined;
    disabled?: boolean;
}) => (
    <div>
        <h3>{props.tittel}</h3>
        <span className={styles.inputOgtekstContainer}>
            <Input
                className={styles.inputWithFollowTextInputfelt}
                id={props.inputName}
                name={props.inputName}
                value={props.value}
                bredde={props.bredde}
                onChange={props.onChange}
                disabled={props.disabled}
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
            {velgbareFradragstyper
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

const velgbareFradragstyper = Object.values(Fradragstype).filter((f) => f !== Fradragstype.BeregnetFradragEPS);

export const fradragSchema = yup.object<FradragFormData>({
    beløp: validateStringAsPositiveNumber,
    type: yup.string().defined().oneOf(velgbareFradragstyper, 'Du må velge en fradragstype'),
    fraUtland: yup.boolean(),
    utenlandskInntekt: utenlandskInntekt,
    tilhørerEPS: yup.boolean(),
    periode: yup
        .object()
        .shape({
            fraOgMed: yup.string().required().typeError('Dato må fylles inn'),
            tilOgMed: yup
                .string()
                .required()
                .typeError('Dato må fylles inn')
                .test(
                    'Ugyldig datokombinasjon',
                    'Til-og-med-dato må være senere enn fra-og-med-dato',
                    function (tilOgMed) {
                        const fraOgMed = this.parent.fraOgMed as Nullable<Date>;
                        return Boolean(fraOgMed && tilOgMed && this.parent.fraOgMed < tilOgMed);
                    }
                ),
        })
        .defined(),
});

export const isValidFradrag = (f: unknown): f is Fradrag => fradragSchema.isValidSync(f);

export const FradragInputs = (props: {
    harEps: boolean;
    fradrag: FradragFormData[];
    feltnavn: string;
    errors: string | string[] | Array<FormikErrors<FradragFormData>> | undefined;
    intl: IntlShape;
    onChange: (e: React.ChangeEvent<unknown>) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
    onFradragChange: (index: number, value: FradragFormData) => void;
    beregningsDato: Nullable<{ fom: Date; tom: Date }>;
}) => {
    return (
        <div className={styles.fradragContainer}>
            {props.fradrag.map((fradrag, index) => {
                const errorForLinje = Array.isArray(props.errors) ? props.errors[index] : null;
                const name = `${props.feltnavn}[${index}]`;
                const typeId = `${name}.${FradragObjectKeys.type}`;
                const belopId = `${name}.${FradragObjectKeys.beløp}`;
                const fraUtlandId = `${name}.${FradragObjectKeys.fraUtland}`;
                const periode = `${name}.${FradragObjectKeys.periode}`;
                const tilhørerEPSId = `${name}.${FradragObjectKeys.tilhørerEPS}`;
                const utenlandskInntektId = `${name}.${FradragObjectKeys.utenlandskInntekt}`;

                const visDelerAvPeriode = Boolean(
                    fradrag.periode &&
                        !(
                            fradrag.periode?.fraOgMed === toStringDateOrNull(props.beregningsDato?.fom ?? null) &&
                            fradrag.periode?.tilOgMed === toStringDateOrNull(props.beregningsDato?.tom ?? null)
                        )
                );

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
                                    disabled={fradrag.fraUtland}
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
                                {props.harEps && (
                                    <Checkbox
                                        label={props.intl.formatMessage({ id: 'display.checkbox.tilhørerEPS' })}
                                        name={tilhørerEPSId}
                                        className={styles.checkbox}
                                        checked={fradrag.tilhørerEPS}
                                        onChange={props.onChange}
                                    />
                                )}
                                <Checkbox
                                    label={props.intl.formatMessage({ id: 'display.checkbox.fraUtland' })}
                                    name={fraUtlandId}
                                    checked={fradrag.fraUtland}
                                    className={styles.checkbox}
                                    onChange={(e) => {
                                        if (!e.target.checked) {
                                            props.onFradragChange(index, {
                                                ...fradrag,
                                                utenlandskInntekt: {
                                                    beløpIUtenlandskValuta: '',
                                                    kurs: '',
                                                    valuta: '',
                                                },
                                            });
                                        }
                                        props.onChange(e);
                                    }}
                                />
                                <Checkbox
                                    label={props.intl.formatMessage({ id: 'fradrag.delerAvPeriode' })}
                                    name={periode}
                                    checked={visDelerAvPeriode}
                                    onChange={(e) =>
                                        props.onFradragChange(index, {
                                            ...fradrag,
                                            periode: e.target.checked
                                                ? {
                                                      fraOgMed: null,
                                                      tilOgMed: null,
                                                  }
                                                : null,
                                        })
                                    }
                                    className={styles.checkbox}
                                />
                            </div>
                            {fradrag.fraUtland && (
                                <InntektFraUtland
                                    name={utenlandskInntektId}
                                    value={fradrag.utenlandskInntekt}
                                    onChange={(v) => {
                                        const beløp = Math.round(
                                            Number.parseFloat(v.kurs) * Number(v.beløpIUtenlandskValuta)
                                        );
                                        props.onFradragChange(index, {
                                            ...fradrag,
                                            utenlandskInntekt: v,
                                            beløp: Number.isNaN(beløp) ? '' : beløp.toString(),
                                        });
                                    }}
                                    errors={
                                        errorForLinje &&
                                        typeof errorForLinje === 'object' &&
                                        errorForLinje.utenlandskInntekt
                                            ? errorForLinje.utenlandskInntekt
                                            : undefined
                                    }
                                    intl={props.intl}
                                />
                            )}
                            {visDelerAvPeriode && (
                                <div className={styles.periode}>
                                    <div className={styles.fraOgMed}>
                                        <Label htmlFor={periode} className={styles.label}>
                                            {props.intl.formatMessage({ id: 'fradrag.delerAvPeriode.fom' })}
                                        </Label>

                                        <DatePicker
                                            id={`fradrag[${index}].periode.fraOgMed`}
                                            selected={
                                                fradrag.periode?.fraOgMed ? new Date(fradrag.periode.fraOgMed) : null
                                            }
                                            onChange={(e) =>
                                                props.onFradragChange(index, {
                                                    ...fradrag,
                                                    periode: {
                                                        tilOgMed: fradrag.periode?.tilOgMed ?? null,
                                                        fraOgMed: toStringDateOrNull(e as Nullable<Date>),
                                                    },
                                                })
                                            }
                                            dateFormat="MM/yyyy"
                                            showMonthYearPicker
                                            maxDate={props.beregningsDato?.tom}
                                            minDate={props.beregningsDato?.fom}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={periode} className={styles.label}>
                                            {props.intl.formatMessage({ id: 'fradrag.delerAvPeriode.tom' })}
                                        </Label>

                                        <DatePicker
                                            id={`fradrag[${index}].periode.tilOgMed`}
                                            selected={
                                                fradrag.periode?.tilOgMed ? new Date(fradrag.periode.tilOgMed) : null
                                            }
                                            onChange={(e) =>
                                                props.onFradragChange(index, {
                                                    ...fradrag,
                                                    periode: {
                                                        fraOgMed: fradrag.periode?.fraOgMed ?? null,
                                                        tilOgMed: toLastDayOfMonthString(e as Nullable<Date>),
                                                    },
                                                })
                                            }
                                            dateFormat="MM/yyyy"
                                            showMonthYearPicker
                                            selectsEnd={true}
                                            endDate={props.beregningsDato?.tom}
                                            minDate={
                                                fradrag.periode?.fraOgMed
                                                    ? new Date(fradrag.periode.fraOgMed)
                                                    : props.beregningsDato?.fom
                                            }
                                            maxDate={props.beregningsDato?.tom}
                                        />
                                    </div>
                                </div>
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

function toStringDateOrNull(date: Date | null) {
    if (!date) return null;

    return format(date, 'yyyy-MM-dd');
}

function toLastDayOfMonthString(date: Date | null) {
    if (!date) return null;

    return toStringDateOrNull(lastDayOfMonth(date));
}
