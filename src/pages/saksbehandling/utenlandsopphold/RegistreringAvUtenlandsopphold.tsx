import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete, Close } from '@navikt/ds-icons';
import { Button, Heading, Panel, Select, TextField } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, UseFormReturn } from 'react-hook-form';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { PeriodeForm } from '~src/components/formElements/FormElements';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import * as SakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import yup, { validerPeriodeTomEtterFomUtenSisteDagBegrensning } from '~src/lib/validering';
import { NullablePeriode } from '~src/types/Periode';
import { RegistrertUtenlandsopphold, UtenlandsoppholdDokumentasjon } from '~src/types/RegistrertUtenlandsopphold';
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

const RegistreringAvUtenlandsopphold = (props: { sakId: string }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.utenlandsoppholdContainer}>
            <Heading className={styles.heading} size="large">
                {formatMessage('grunnlagForm.heading')}
            </Heading>
            <RegistreringAvUtenlandsoppholdForm sakId={props.sakId} />
        </div>
    );
};

export const RegistreringAvUtenlandsoppholdForm = (props: {
    sakId: string;
    endrerRegistrertUtenlandsopphold?: {
        avsluttEndringAvUtenlandsopphold: () => void;
        registrertUtenlandsopphold: RegistrertUtenlandsopphold;
    };
}) => {
    const { formatMessage } = useI18n({ messages });
    const [antallDagerIUtlandet, setAntallDagerIUtlandet] = useState<number>(0);
    const [status, registrerUtenlandsOpphold] = useAsyncActionCreator(SakSlice.registrerUtenlandsopphold);
    const [, oppdaterUtenlandsopphold] = useAsyncActionCreator(SakSlice.oppdaterRegistrertUtenlandsopphold);
    const [, ugyldiggjørUtenlandsopphold] = useAsyncActionCreator(SakSlice.ugyldiggjørRegistrertUtenlandsopphold);

    const endrerRegistrertUtenlandsopphold = !!props.endrerRegistrertUtenlandsopphold;

    const form = useForm<RegisteringAvUtenlandsoppholdFormData>({
        defaultValues: {
            periode: {
                fraOgMed: toDateOrNull(
                    props.endrerRegistrertUtenlandsopphold?.registrertUtenlandsopphold?.periode.fraOgMed
                ),
                tilOgMed: toDateOrNull(
                    props.endrerRegistrertUtenlandsopphold?.registrertUtenlandsopphold?.periode.tilOgMed
                ),
            },
            dokumentasjon: props.endrerRegistrertUtenlandsopphold?.registrertUtenlandsopphold?.dokumentasjon ?? null,
            journalposter: props.endrerRegistrertUtenlandsopphold?.registrertUtenlandsopphold?.journalposter
                ? props.endrerRegistrertUtenlandsopphold?.registrertUtenlandsopphold?.journalposter.map((it) => ({
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

    const onUgyldiggjørClick = () => {
        ugyldiggjørUtenlandsopphold({
            sakId: props.sakId,
            utenlandsoppholdId: props.endrerRegistrertUtenlandsopphold!.registrertUtenlandsopphold.id,
        });
    };

    const onFormSubmit = (values: RegisteringAvUtenlandsoppholdFormData) => {
        if (endrerRegistrertUtenlandsopphold) {
            oppdaterUtenlandsopphold({
                sakId: props.sakId,
                utenlandsoppholdId: props.endrerRegistrertUtenlandsopphold!.registrertUtenlandsopphold.id,
                periode: {
                    fraOgMed: values.periode.fraOgMed!.toISOString(),
                    tilOgMed: values.periode.tilOgMed!.toISOString(),
                },
                dokumentasjon: values.dokumentasjon!,
                journalposter: values.journalposter.map((it) => it.journalpostId!),
            });
        } else {
            registrerUtenlandsOpphold({
                sakId: props.sakId,
                periode: {
                    fraOgMed: values.periode.fraOgMed!.toISOString(),
                    tilOgMed: values.periode.tilOgMed!.toISOString(),
                },
                dokumentasjon: values.dokumentasjon!,
                journalposter: values.journalposter.map((it) => it.journalpostId!),
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <Panel border>
                {endrerRegistrertUtenlandsopphold && (
                    <div className={styles.avsluttEndringAvUtenlandsoppholdButtonContainer}>
                        <Button
                            variant="tertiary"
                            type="button"
                            onClick={props.endrerRegistrertUtenlandsopphold!.avsluttEndringAvUtenlandsopphold}
                        >
                            <Close />
                        </Button>
                    </div>
                )}
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

                    {RemoteData.isFailure(status) && (
                        <ApiErrorAlert className={styles.apiErrorAlert} error={status.error} />
                    )}
                    {endrerRegistrertUtenlandsopphold ? (
                        <EndrerEksisterendeUtenlandsoppholdButtons onUgyldiggjørClick={onUgyldiggjørClick} />
                    ) : (
                        <TilbakeOgRegistrerButtons sakId={props.sakId} />
                    )}
                </div>
            </Panel>
        </form>
    );
};

const TilbakeOgRegistrerButtons = (props: { sakId: string }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.grunnlagFormButtonsContainer}>
            <LinkAsButton variant="secondary" href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}>
                {formatMessage('grunnlagForm.button.tilbake')}
            </LinkAsButton>
            <Button>{formatMessage('grunnlagForm.button.registrer')}</Button>
        </div>
    );
};

const EndrerEksisterendeUtenlandsoppholdButtons = (props: { onUgyldiggjørClick: () => void }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.grunnlagFormButtonsContainer}>
            <Button variant="danger" type="button" onClick={props.onUgyldiggjørClick}>
                {formatMessage('grunnlagForm.button.uggyldiggjør')}
            </Button>
            <Button>{formatMessage('grunnlagForm.button.oppdater')}</Button>
        </div>
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

export default RegistreringAvUtenlandsopphold;
