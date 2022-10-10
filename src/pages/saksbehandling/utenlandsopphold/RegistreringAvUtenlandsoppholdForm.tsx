import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@navikt/ds-icons';
import { Button, Heading, Select, TextField } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, UseFormReturn } from 'react-hook-form';

import { PeriodeForm } from '~src/components/formElements/FormElements';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import yup, { validerPeriodeTomEtterFomUtenSisteDagBegrensning } from '~src/lib/validering';
import { NullablePeriode } from '~src/types/Periode';
import {
    RegistrerteUtenlandsopphold,
    RegistrertUtenlandsopphold,
    UtenlandsoppholdDokumentasjon,
} from '~src/types/RegistrertUtenlandsopphold';
import { toDateOrNull } from '~src/utils/date/dateUtils';

import messages from './RegistreringAvUtenlandsopphold-nb';
import styles from './RegistreringAvUtenlandsopphold.module.less';

export interface RegisteringAvUtenlandsoppholdFormData {
    periode: NullablePeriode<Date>;
    dokumentasjon: Nullable<UtenlandsoppholdDokumentasjon>;
    journalposter: Array<{ journalpostId: Nullable<string> }>;
}

const registeringAvUtenlandsoppholdFormSchema = yup.object<RegisteringAvUtenlandsoppholdFormData>({
    periode: validerPeriodeTomEtterFomUtenSisteDagBegrensning,
    dokumentasjon: yup
        .string()
        .oneOf([...Object.values(UtenlandsoppholdDokumentasjon)])
        .nullable()
        .required(),
    journalposter: yup
        .array<{ journalpostId: Nullable<string> }>(
            yup
                .object({
                    journalpostId: yup.string().required().typeError('Feltet må fylles ut'),
                })
                .required()
        )
        .notRequired()
        .defined(),
});

/**
 * Tar inn form-knapper som children. Dette er for å lettere håndtere de ulike APi-kallene på samme
 * formet, og samtidig abstrahere dem ut fra selve formet
 */
const RegistreringAvUtenlandsoppholdForm = (props: {
    sakId: string;
    registrertUtenlandsopphold?: RegistrertUtenlandsopphold;
    status: ApiResult<RegistrerteUtenlandsopphold>;
    onFormSubmit: (values: RegisteringAvUtenlandsoppholdFormData) => void;
    children: React.ReactNode;
}) => {
    const { formatMessage } = useI18n({ messages });
    const [antallDagerIUtlandet, setAntallDagerIUtlandet] = useState<number>(0);

    const form = useForm<RegisteringAvUtenlandsoppholdFormData>({
        defaultValues: {
            periode: {
                fraOgMed: toDateOrNull(props.registrertUtenlandsopphold?.periode.fraOgMed),
                tilOgMed: toDateOrNull(props?.registrertUtenlandsopphold?.periode.tilOgMed),
            },
            dokumentasjon: props?.registrertUtenlandsopphold?.dokumentasjon ?? null,
            journalposter: props?.registrertUtenlandsopphold?.journalposter
                ? props?.registrertUtenlandsopphold?.journalposter.map((it) => ({
                      journalpostId: it,
                  }))
                : [],
        },
        resolver: yupResolver(registeringAvUtenlandsoppholdFormSchema),
    });
    const watch = form.watch();

    useEffect(() => {
        const antallDagerIUtlandetMinusUtreiseOgInnreiseDato =
            DateFns.differenceInCalendarDays(watch.periode.tilOgMed ?? 0, watch.periode.fraOgMed ?? 0) - 1;

        setAntallDagerIUtlandet(
            antallDagerIUtlandetMinusUtreiseOgInnreiseDato < 0 ? 0 : antallDagerIUtlandetMinusUtreiseOgInnreiseDato
        );
    }, [watch.periode.fraOgMed, watch.periode.tilOgMed]);

    const onFormSubmit = (values: RegisteringAvUtenlandsoppholdFormData) => {
        props.onFormSubmit(values);
    };

    return (
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <div className={styles.inputFieldsContainer}>
                <div className={styles.periodeFormMedDagerTeller}>
                    <Controller
                        control={form.control}
                        name={'periode'}
                        render={({ field }) => (
                            <PeriodeForm
                                value={field.value}
                                name={field.name}
                                onChange={field.onChange}
                                minDate={{
                                    fraOgMed: new Date('01-01-2021'),
                                    tilOgMed: watch.periode.fraOgMed,
                                }}
                                maxDate={{
                                    fraOgMed: undefined,
                                    tilOgMed: undefined,
                                }}
                                error={form.formState.errors.periode}
                                medDager
                            />
                        )}
                    />
                    <Heading className={styles.antallDagerTeller} size="large">
                        {antallDagerIUtlandet}
                    </Heading>
                </div>

                <Controller
                    control={form.control}
                    name={'dokumentasjon'}
                    render={({ field }) => (
                        <Select
                            className={styles.select}
                            {...field}
                            value={field.value ?? ''}
                            label={formatMessage('grunnlagForm.dokumentasjon')}
                            error={form.formState.errors.dokumentasjon?.message}
                        >
                            <option value="">
                                {formatMessage('grunnlagForm.dokumentasjon.velgTypeDokumentasjon')}
                            </option>
                            {Object.values(UtenlandsoppholdDokumentasjon).map((v) => (
                                <option key={v} value={v}>
                                    {v}
                                </option>
                            ))}
                        </Select>
                    )}
                />
                <JournalpostIderInputs form={form} />
                {props.children}
            </div>
        </form>
    );
};

const JournalpostIderInputs = (props: { form: UseFormReturn<RegisteringAvUtenlandsoppholdFormData> }) => {
    const { formatMessage } = useI18n({ messages });

    const journalposter = useFieldArray({
        control: props.form.control,
        name: 'journalposter',
    });

    return (
        <ul className={styles.journalposterInputsContainer}>
            {journalposter.fields.map((el, idx) => (
                <li key={el.id}>
                    <div className={styles.journalpostIdInputMedDelete}>
                        <Controller
                            control={props.form.control}
                            name={`journalposter.${idx}.journalpostId`}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    autoComplete="off"
                                    onChange={(e) => {
                                        props.form.setValue(`journalposter.${idx}`, {
                                            journalpostId: e.target.value,
                                        });
                                    }}
                                    value={field.value ?? ''}
                                    label={formatMessage('grunnlagForm.journalpostId')}
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
                            aria-label={formatMessage('knapp.fjernJournalpostId')}
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
                    journalposter.fields.length === 0 ? 'knapp.leggtilJournalpostId' : 'knapp.nyJournalpostId'
                )}
            </Button>
        </ul>
    );
};

export default RegistreringAvUtenlandsoppholdForm;
