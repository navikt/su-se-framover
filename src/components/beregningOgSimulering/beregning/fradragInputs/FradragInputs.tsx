import { Delete } from '@navikt/ds-icons';
import { BodyShort, Button, Checkbox, Fieldset, Label, Panel, Select, TextField } from '@navikt/ds-react';
import classNames from 'classnames';
import { lastDayOfMonth } from 'date-fns';
import * as DateFns from 'date-fns';
import { FormikErrors } from 'formik';
import React from 'react';

import { PeriodeForm } from '~src/components/formElements/FormElements';
import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding';
import { useI18n } from '~src/lib/i18n';
import { Nullable, KeyDict } from '~src/lib/types';
import yup, { validateStringAsPositiveNumber } from '~src/lib/validering';
import { Fradragskategori, IkkeVelgbareFradragskategorier, VelgbareFradragskategorier } from '~src/types/Fradrag';
import { toStringDateOrNull } from '~src/utils/date/dateUtils';

import { UtenlandskInntektFormData } from '../beregningstegTypes';

import messages from './fradragInputs-nb';
import styles from './fradragInputs.module.less';
import InntektFraUtland from './InntektFraUtland';

export interface FradragFormData {
    kategori: Nullable<Fradragskategori>;
    spesifisertkategori: Nullable<string>;
    beløp: Nullable<string>;
    fraUtland: boolean;
    utenlandskInntekt: UtenlandskInntektFormData;
    tilhørerEPS: boolean;
    periode: Nullable<{
        fraOgMed: Nullable<Date>;
        tilOgMed: Nullable<Date>;
    }>;
}

const FradragObjectKeys: KeyDict<FradragFormData> = {
    kategori: 'kategori',
    spesifisertkategori: 'spesifisertkategori',
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
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    feil: string | undefined;
    disabled?: boolean;
}) => (
    <div className={classNames('navds-form-field')}>
        <Label as="label" htmlFor={props.inputName} spacing>
            {props.tittel}
        </Label>
        <span className={styles.inputOgtekstContainer}>
            <TextField
                className={styles.inputWithFollowTextInputfelt}
                id={props.inputName}
                label={props.tittel}
                name={props.inputName}
                value={props.value}
                onChange={props.onChange}
                disabled={props.disabled}
                error={!!props.feil}
                hideLabel
            />
            <BodyShort>{props.inputTekst}</BodyShort>
        </span>
        {props.feil && <SkjemaelementFeilmelding>{props.feil}</SkjemaelementFeilmelding>}
    </div>
);

const FradragsSelection = (props: {
    label: string;
    id: string;
    name: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    feil: string | undefined;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Select
            onChange={props.onChange}
            id={props.id}
            name={props.name}
            value={props.value}
            label={props.label}
            error={props.feil}
        >
            <option value="">{formatMessage('fradrag.type.emptyLabel')}</option>
            {Object.values(VelgbareFradragskategorier)
                .sort()
                .map((f) => (
                    <option value={f} key={f}>
                        {formatMessage(f)}
                    </option>
                ))}
            <option disabled value={IkkeVelgbareFradragskategorier.NAVytelserTilLivsopphold}>
                {formatMessage(IkkeVelgbareFradragskategorier.NAVytelserTilLivsopphold)}
            </option>
        </Select>
    );
};

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
    kategori: yup
        .string()
        .defined()
        .oneOf(
            [...Object.values(VelgbareFradragskategorier), IkkeVelgbareFradragskategorier.NAVytelserTilLivsopphold],
            'Du må velge en fradragstype'
        ),
    spesifisertkategori: yup.string().defined().when(FradragObjectKeys.kategori, {
        is: VelgbareFradragskategorier.Annet,
        then: yup.string().required(),
    }),
    fraUtland: yup.boolean(),
    utenlandskInntekt: utenlandskInntekt,
    tilhørerEPS: yup.boolean(),
    periode: yup
        .object()
        .shape({
            fraOgMed: yup.date().required().typeError('Dato må fylles inn'),
            tilOgMed: yup
                .date()
                .required()
                .typeError('Dato må fylles inn')
                .test(
                    'Ugyldig datokombinasjon',
                    'Til-og-med-dato må være senere enn fra-og-med-dato',
                    function (tilOgMed) {
                        const fraOgMed = this.parent.fraOgMed as Nullable<string>;
                        return Boolean(
                            fraOgMed &&
                                tilOgMed &&
                                DateFns.isAfter(lastDayOfMonth(new Date(tilOgMed)), new Date(fraOgMed))
                        );
                    }
                ),
        })
        .defined(),
});

export const FradragInputs = (props: {
    harEps: boolean;
    fradrag: FradragFormData[];
    feltnavn: string;
    errors: string | string[] | Array<FormikErrors<FradragFormData>> | undefined;
    onChange: (e: React.ChangeEvent<unknown>) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
    onFradragChange: (index: number, value: FradragFormData) => void;
    beregningsDato: Nullable<{ fom: Nullable<Date>; tom: Nullable<Date> }>;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.fradragContainer}>
            {props.fradrag.map((fradrag, index) => {
                const errorForLinje = Array.isArray(props.errors) ? props.errors[index] : null;
                const name = `${props.feltnavn}[${index}]`;
                const typeId = `${name}.${FradragObjectKeys.kategori}`;
                const belopId = `${name}.${FradragObjectKeys.beløp}`;
                const fraUtlandId = `${name}.${FradragObjectKeys.fraUtland}`;
                const periode = `${name}.${FradragObjectKeys.periode}`;
                const tilhørerEPSId = `${name}.${FradragObjectKeys.tilhørerEPS}`;
                const utenlandskInntektId = `${name}.${FradragObjectKeys.utenlandskInntekt}`;
                const spesifisertTypeId = `${name}.${FradragObjectKeys.spesifisertkategori}`;

                const visDelerAvPeriode = Boolean(
                    fradrag.periode &&
                        !(
                            toStringDateOrNull(fradrag.periode?.fraOgMed) ===
                                toStringDateOrNull(props.beregningsDato?.fom ?? null) &&
                            toStringDateOrNull(fradrag.periode?.tilOgMed) ===
                                toStringDateOrNull(props.beregningsDato?.tom ?? null)
                        )
                );

                return (
                    <Panel key={index} border className={styles.fradragItemContainer}>
                        <Fieldset legend="Fradrag" hideLegend={false}>
                            <div className={styles.fradragTypeOgBelopContainer}>
                                <div className={styles.fradragTypeOgBelopInputs}>
                                    <FradragsSelection
                                        label={formatMessage('display.fradrag.type')}
                                        onChange={props.onChange}
                                        id={typeId}
                                        name={typeId}
                                        value={fradrag.kategori?.toString() ?? ''}
                                        feil={
                                            errorForLinje && typeof errorForLinje === 'object'
                                                ? errorForLinje.kategori
                                                : undefined
                                        }
                                    />
                                    <InputWithFollowText
                                        tittel={formatMessage('display.fradrag.beløp')}
                                        inputName={belopId}
                                        value={fradrag.beløp?.toString() ?? ''}
                                        inputTekst="NOK"
                                        onChange={props.onChange}
                                        feil={
                                            errorForLinje && typeof errorForLinje === 'object'
                                                ? errorForLinje.beløp
                                                : undefined
                                        }
                                        disabled={fradrag.fraUtland}
                                    />
                                </div>
                                <div className={styles.søppelbøtteContainer}>
                                    <Button variant="secondary" type="button" onClick={() => props.onFjernClick(index)}>
                                        <Delete />
                                    </Button>
                                </div>
                            </div>
                            {fradrag.kategori === VelgbareFradragskategorier.Annet && (
                                <div className={styles.spesifiserFradragsTypeContainer}>
                                    <TextField
                                        label={formatMessage('fradrag.input.spesifiserFradrag')}
                                        name={spesifisertTypeId}
                                        value={fradrag.spesifisertkategori ?? ''}
                                        onChange={props.onChange}
                                        error={
                                            errorForLinje && typeof errorForLinje === 'object'
                                                ? errorForLinje.spesifisertkategori
                                                : undefined
                                        }
                                    />
                                </div>
                            )}
                            <div className={styles.checkboxContainer}>
                                {(props.harEps || fradrag.tilhørerEPS) && (
                                    <Checkbox
                                        name={tilhørerEPSId}
                                        className={styles.checkbox}
                                        checked={fradrag.tilhørerEPS}
                                        onChange={props.onChange}
                                        disabled={!props.harEps}
                                    >
                                        {formatMessage('display.checkbox.tilhørerEPS')}
                                    </Checkbox>
                                )}
                                <Checkbox
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
                                >
                                    {formatMessage('display.checkbox.fraUtland')}
                                </Checkbox>
                                <Checkbox
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
                                >
                                    {formatMessage('fradrag.delerAvPeriode')}
                                </Checkbox>
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
                                />
                            )}

                            {visDelerAvPeriode && (
                                <PeriodeForm
                                    fraOgMed={{
                                        id: `${periode}.fraOgMed`,
                                        value: fradrag.periode?.fraOgMed ? new Date(fradrag.periode.fraOgMed) : null,
                                        minDate: props.beregningsDato?.fom,
                                        maxDate: props.beregningsDato?.tom,
                                        setFraOgMed: (date: Nullable<Date>) => {
                                            props.onFradragChange(index, {
                                                ...fradrag,
                                                periode: {
                                                    fraOgMed: date,
                                                    tilOgMed: fradrag.periode?.tilOgMed ?? null,
                                                },
                                            });
                                        },
                                        error:
                                            typeof errorForLinje === 'object' && errorForLinje?.periode
                                                ? // formik sin typing er ikke god på nøstede feil
                                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                  (errorForLinje.periode as any)?.fraOgMed
                                                : undefined,
                                        size: 'S',
                                    }}
                                    tilOgMed={{
                                        id: `${periode}.tilOgMed`,
                                        value: fradrag.periode?.tilOgMed ? new Date(fradrag.periode.tilOgMed) : null,
                                        minDate: fradrag.periode?.fraOgMed,
                                        maxDate: props.beregningsDato?.tom,
                                        setTilOgMed: (date: Nullable<Date>) => {
                                            props.onFradragChange(index, {
                                                ...fradrag,
                                                periode: {
                                                    fraOgMed: fradrag.periode?.fraOgMed ?? null,
                                                    tilOgMed: date ? DateFns.endOfMonth(date) : null,
                                                },
                                            });
                                        },
                                        error:
                                            typeof errorForLinje === 'object' && errorForLinje?.periode
                                                ? // formik sin typing er ikke god på nøstede feil
                                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                  (errorForLinje.periode as any)?.tilOgMed
                                                : undefined,
                                        size: 'S',
                                    }}
                                />
                            )}
                        </Fieldset>
                    </Panel>
                );
            })}

            <div className={styles.leggTilNyttFradragContainer}>
                <Button variant="secondary" onClick={() => props.onLeggTilClick()} type="button" size="small">
                    {props.fradrag.length === 0
                        ? formatMessage('knapp.fradrag.leggtil')
                        : formatMessage('knapp.fradrag.leggtil.annet')}
                </Button>
            </div>
        </div>
    );
};
