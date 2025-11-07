import { TrashIcon } from '@navikt/aksel-icons';
import { Button, Checkbox, Label, Panel, Select, TextField } from '@navikt/ds-react';
import { currencies } from 'country-data-list';
import {
    ArrayPath,
    Control,
    Controller,
    FieldValues,
    Path,
    UseFormSetValue,
    useFieldArray,
    useWatch,
} from 'react-hook-form';

import { PeriodeForm } from '~src/components/formElements/FormElements';
import { InputWithFollowText } from '~src/components/inputs/inputWithFollowText/InputWithFollowText';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { IkkeVelgbareFradragskategorier, VelgbareFradragskategorier } from '~src/types/Fradrag';
import { NullablePeriode } from '~src/types/Periode';

import messages from '../VilkårOgGrunnlagForms-nb';

import styles from './FradragForm.module.less';
import { nyFradrag } from './FradragFormUtils';

interface Props<T extends FieldValues> {
    name: keyof T & 'fradrag';
    control: Control<T>;
    setValue: UseFormSetValue<T>;
    harEPS: boolean;
    beregningsDato: Nullable<NullablePeriode>;
}

const FradragForm = <T extends FieldValues>(props: Props<T>) => {
    const { formatMessage } = useI18n({ messages });

    const watch = useWatch({ name: props.name as Path<T>, control: props.control });
    const { fields, append, remove, update } = useFieldArray({
        name: props.name as ArrayPath<T>,
        control: props.control,
    });

    return (
        <div className={styles.fradragContainer}>
            <ul>
                {fields.map((el, idx) => {
                    const watchedFradrag = watch[idx];
                    const partialFradragNavn = `${props.name}.${idx}` as `fradrag.${number}`;

                    return (
                        <li key={el.id}>
                            <Panel border className={styles.fradragItemContainer}>
                                <div className={styles.tittelOgSøppelbøtteContainer}>
                                    <Label>{formatMessage('fradrag.heading')}</Label>
                                    <div className={styles.søppelbøtteContainer}>
                                        <Button variant="secondary" type="button" onClick={() => remove(idx)}>
                                            <TrashIcon />
                                        </Button>
                                    </div>
                                </div>
                                <div className={styles.fradragTypeOgBelopContainer}>
                                    <div className={styles.fradragTypeOgBelopInputs}>
                                        <Controller
                                            control={props.control}
                                            name={`${partialFradragNavn}.kategori` as Path<T>}
                                            render={({ field, fieldState }) => (
                                                <Select
                                                    label={formatMessage('fradrag.type')}
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    error={fieldState.error?.message}
                                                >
                                                    <option value="">{formatMessage('fradrag.type.emptyLabel')}</option>
                                                    {Object.values(VelgbareFradragskategorier)
                                                        .sort()
                                                        .map((f) => (
                                                            <option value={f} key={f}>
                                                                {formatMessage(f)}
                                                            </option>
                                                        ))}
                                                    <option
                                                        disabled
                                                        value={IkkeVelgbareFradragskategorier.NAVytelserTilLivsopphold}
                                                    >
                                                        {formatMessage(
                                                            IkkeVelgbareFradragskategorier.NAVytelserTilLivsopphold,
                                                        )}
                                                    </option>
                                                </Select>
                                            )}
                                        />
                                        <Controller
                                            control={props.control}
                                            name={`${partialFradragNavn}.beløp` as Path<T>}
                                            render={({ field, fieldState }) => (
                                                <InputWithFollowText
                                                    tittel={formatMessage('fradrag.beløp')}
                                                    inputName={field.name}
                                                    value={field.value ?? ''}
                                                    inputTekst="NOK"
                                                    onChange={field.onChange}
                                                    feil={fieldState.error?.message}
                                                    disabled={watchedFradrag?.fraUtland}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                                {watchedFradrag?.kategori === VelgbareFradragskategorier.Annet && (
                                    <div className={styles.spesifiserFradragsTypeContainer}>
                                        <Controller
                                            control={props.control}
                                            name={`${partialFradragNavn}.spesifisertkategori` as Path<T>}
                                            render={({ field, fieldState }) => (
                                                <TextField
                                                    label={formatMessage('fradrag.type.spesifiserFradrag')}
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    error={fieldState.error?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                )}
                                <div className={styles.checkboxContainer}>
                                    {(props.harEPS || watchedFradrag?.tilhørerEPS) && (
                                        <Controller
                                            control={props.control}
                                            name={`${partialFradragNavn}.tilhørerEPS` as Path<T>}
                                            render={({ field }) => (
                                                <Checkbox
                                                    className={styles.checkbox}
                                                    checked={!!field.value}
                                                    {...field}
                                                    disabled={!props.harEPS}
                                                >
                                                    {formatMessage('fradrag.checkbox.tilhørerEPS')}
                                                </Checkbox>
                                            )}
                                        />
                                    )}
                                    <Controller
                                        control={props.control}
                                        name={`${partialFradragNavn}.fraUtland` as Path<T>}
                                        render={({ field }) => (
                                            <Checkbox checked={!!field.value} className={styles.checkbox} {...field}>
                                                {formatMessage('fradrag.checkbox.fraUtland')}
                                            </Checkbox>
                                        )}
                                    />
                                    <Controller
                                        control={props.control}
                                        name={`${partialFradragNavn}.visDelerAvPeriode` as Path<T>}
                                        render={({ field }) => (
                                            <Checkbox
                                                className={styles.checkbox}
                                                name={field.name}
                                                checked={field.value}
                                                onChange={field.onChange}
                                            >
                                                {formatMessage('fradrag.delerAvPeriode')}
                                            </Checkbox>
                                        )}
                                    />
                                </div>
                                {watchedFradrag?.fraUtland && (
                                    <InntektFraUtland
                                        controller={props.control}
                                        name={`${partialFradragNavn}.utenlandskInntekt`}
                                        setValue={props.setValue}
                                    />
                                )}
                                {watchedFradrag?.visDelerAvPeriode && (
                                    <Controller
                                        control={props.control}
                                        name={`${partialFradragNavn}.periode` as Path<T>}
                                        render={({ field }) => (
                                            <PeriodeForm
                                                value={field.value}
                                                onChange={(periode: NullablePeriode) => {
                                                    update(idx, { ...watchedFradrag, periode: periode });
                                                }}
                                                minDate={props.beregningsDato?.fraOgMed ?? null}
                                                maxDate={props.beregningsDato?.tilOgMed ?? null}
                                            />
                                        )}
                                    />
                                )}
                            </Panel>
                        </li>
                    );
                })}
            </ul>
            <div>
                {/* Ts klager på at vi ikke returnerer en full objekt av typen T, selv om vi bare ønsker at komponentet skal håndtere FradragFormData. */}
                {/* @ts-ignore */}
                <Button variant="secondary" type="button" size="small" onClick={() => append(nyFradrag())}>
                    {fields.length === 0
                        ? formatMessage('knapp.fradrag.leggtil')
                        : formatMessage('knapp.fradrag.leggtil.annet')}
                </Button>
            </div>
        </div>
    );
};

interface InntektFraUtlandProps<T extends FieldValues> {
    name: `fradrag.${number}.utenlandskInntekt`;
    controller: Control<T>;
    setValue: UseFormSetValue<T>;
}

export const InntektFraUtland = <T extends FieldValues>(props: InntektFraUtlandProps<T>) => {
    const { formatMessage } = useI18n({ messages });
    const splitName = props.name.split('.');
    const fradragName = `${splitName[0]}.${splitName[1]}` as Path<T>;
    const fradrag = useWatch({ name: fradragName, control: props.controller });

    const onFradragChange = (arg: { kurs: string; beløp: string }) => {
        const utenlandsinntektBeløp = Math.round(Number.parseFloat(arg.kurs) * Number(arg.beløp));
        const faktiskBeløp = Number.isNaN(utenlandsinntektBeløp) ? '' : utenlandsinntektBeløp;
        props.setValue(fradragName, {
            ...fradrag,
            beløp: faktiskBeløp,
            utenlandskInntekt: {
                ...fradrag.utenlandskInntekt,
                beløpIUtenlandskValuta: arg.beløp,
                kurs: arg.kurs,
            },
        });
    };

    return (
        <div className={styles.utlandOgPeriodeContainer}>
            <Controller
                control={props.controller}
                name={`${props.name}.beløpIUtenlandskValuta` as Path<T>}
                render={({ field, fieldState }) => (
                    <TextField
                        label={formatMessage('fradrag.utenland.beløpIUtenlandskValuta')}
                        {...field}
                        onChange={(e) =>
                            onFradragChange({
                                kurs: fradrag.utenlandskInntekt.kurs,
                                beløp: e.target.value,
                            })
                        }
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    />
                )}
            />
            <Controller
                control={props.controller}
                name={`${props.name}.valuta` as Path<T>}
                render={({ field, fieldState }) => (
                    <Select
                        label={formatMessage('fradrag.utenland.valuta')}
                        {...field}
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    >
                        <option value="" disabled={true}>
                            {formatMessage('fradrag.utenland.valuta.velg')}
                        </option>
                        {currencies.all.map((c) => (
                            <option value={c.code} key={c.number}>
                                {c.code}
                            </option>
                        ))}
                    </Select>
                )}
            />
            <Controller
                control={props.controller}
                name={`${props.name}.kurs` as Path<T>}
                render={({ field, fieldState }) => (
                    <TextField
                        label={
                            <div>
                                <Label>{formatMessage('fradrag.utenland.kurs')}</Label>
                                <p className={styles.description}>{formatMessage('fradrag.utenland.kurs.desimal')}</p>
                            </div>
                        }
                        {...field}
                        onChange={(e) =>
                            onFradragChange({
                                kurs: e.target.value,
                                beløp: fradrag.utenlandskInntekt.beløpIUtenlandskValuta,
                            })
                        }
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    />
                )}
            />
        </div>
    );
};

export default FradragForm;
