import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import { Button, Heading, Select, TextField } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Control, Controller, useFieldArray, useForm, UseFormReset, UseFormSetValue } from 'react-hook-form';

import { PeriodeForm } from '~src/components/formElements/FormElements';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import {
    RegistrerteUtenlandsopphold,
    RegistrertUtenlandsopphold,
    UtenlandsoppholdDokumentasjon,
} from '~src/types/RegistrertUtenlandsopphold';

import messages from '../Utenlandsopphold-nb';

import styles from './RegistreringAvUtenlandsopphold.module.less';
import {
    RegisteringAvUtenlandsoppholdFormData,
    registeringAvUtenlandsoppholdFormSchema,
    registrertUtenlandsoppholdTilFormDataEllerDefault,
} from './RegistreringAvUtenlandsoppholdFormUtils';

/**
 * Tar inn form-knapper som children. Dette er for å lettere håndtere de ulike APi-kallene på samme formet
 */
const RegistreringAvUtenlandsoppholdForm = (props: {
    sakId: string;
    saksversjon: number;
    registrertUtenlandsopphold?: RegistrertUtenlandsopphold;
    status: ApiResult<RegistrerteUtenlandsopphold>;
    onFormSubmit: (
        values: RegisteringAvUtenlandsoppholdFormData,
        formReset: UseFormReset<RegisteringAvUtenlandsoppholdFormData>
    ) => void;
    children: React.ReactNode;
}) => {
    const { formatMessage } = useI18n({ messages });
    const [antallDagerIUtlandet, setAntallDagerIUtlandet] = useState<number>(0);

    const { control, handleSubmit, watch, formState, setValue, reset } = useForm<RegisteringAvUtenlandsoppholdFormData>(
        {
            defaultValues: registrertUtenlandsoppholdTilFormDataEllerDefault(props.registrertUtenlandsopphold),
            resolver: yupResolver(registeringAvUtenlandsoppholdFormSchema),
        }
    );
    const watched = watch();

    useEffect(() => {
        const antallDagerIUtlandetMinusUtreiseOgInnreiseDato =
            DateFns.differenceInCalendarDays(watched.periode.tilOgMed ?? 0, watched.periode.fraOgMed ?? 0) - 1;

        setAntallDagerIUtlandet(
            antallDagerIUtlandetMinusUtreiseOgInnreiseDato < 0 ? 0 : antallDagerIUtlandetMinusUtreiseOgInnreiseDato
        );
    }, [watched.periode.fraOgMed, watched.periode.tilOgMed]);

    return (
        <form
            onSubmit={handleSubmit((v) => {
                props.onFormSubmit(v, reset);
            })}
        >
            <div className={styles.inputFieldsContainer}>
                <div className={styles.periodeFormMedDagerTeller}>
                    <Controller
                        control={control}
                        name={'periode'}
                        render={({ field }) => (
                            <PeriodeForm
                                value={field.value}
                                name={field.name}
                                label={{
                                    fraOgMed: formatMessage('registreringAvUtenlandsopphold.form.dato.fraOgMed.label'),
                                    tilOgMed: formatMessage('registreringAvUtenlandsopphold.form.dato.tilOgMed.label'),
                                }}
                                onChange={field.onChange}
                                minDate={{
                                    fraOgMed: new Date('01-01-2021'),
                                    tilOgMed: watched.periode.fraOgMed,
                                }}
                                maxDate={{
                                    fraOgMed: undefined,
                                    tilOgMed: undefined,
                                }}
                                error={formState.errors.periode}
                                medDager
                            />
                        )}
                    />
                    <Heading className={styles.antallDagerTeller} size="large">
                        {antallDagerIUtlandet}
                    </Heading>
                </div>

                <Controller
                    control={control}
                    name={'dokumentasjon'}
                    render={({ field, fieldState }) => (
                        <Select
                            className={styles.select}
                            {...field}
                            value={field.value ?? ''}
                            label={formatMessage('registreringAvUtenlandsopphold.form.dokumentasjon.label')}
                            error={fieldState.error?.message}
                        >
                            <option value="">
                                {formatMessage(
                                    'registreringAvUtenlandsopphold.form.dokumentasjon.defaultValue.velgTypeDokumentasjon'
                                )}
                            </option>
                            {Object.values(UtenlandsoppholdDokumentasjon).map((v) => (
                                <option key={v} value={v}>
                                    {v}
                                </option>
                            ))}
                        </Select>
                    )}
                />
                <JournalpostIderInputs control={control} setValue={setValue} />
                {props.children}
            </div>
        </form>
    );
};

const JournalpostIderInputs = (props: {
    control: Control<RegisteringAvUtenlandsoppholdFormData>;
    setValue: UseFormSetValue<RegisteringAvUtenlandsoppholdFormData>;
}) => {
    const { formatMessage } = useI18n({ messages });

    const journalposter = useFieldArray({
        control: props.control,
        name: 'journalposter',
    });

    return (
        <ul className={styles.journalposterInputsContainer}>
            {journalposter.fields.map((el, idx) => (
                <li key={el.id}>
                    <div className={styles.journalpostIdInputMedDelete}>
                        <Controller
                            control={props.control}
                            name={`journalposter.${idx}.journalpostId`}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    autoComplete="off"
                                    onChange={(e) => {
                                        props.setValue(`journalposter.${idx}`, {
                                            journalpostId: e.target.value,
                                        });
                                    }}
                                    value={field.value ?? ''}
                                    label={formatMessage('registreringAvUtenlandsopphold.form.journalpostId.label')}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />

                        <Button
                            className={styles.fjernJournalpostButton}
                            variant="secondary"
                            type="button"
                            onClick={() => journalposter.remove(idx)}
                            size="small"
                            aria-label={formatMessage('registreringAvUtenlandsopphold.form.button.journalpostId.fjern')}
                        >
                            <Delete />
                        </Button>
                    </div>
                </li>
            ))}
            <Button
                variant="secondary"
                type="button"
                size="small"
                onClick={() => journalposter.append({ journalpostId: null })}
            >
                {formatMessage(
                    journalposter.fields.length === 0
                        ? 'registreringAvUtenlandsopphold.form.button.journalpostId.leggTil'
                        : 'registreringAvUtenlandsopphold.form.button.journalpostId.ny'
                )}
            </Button>
        </ul>
    );
};

export default RegistreringAvUtenlandsoppholdForm;
