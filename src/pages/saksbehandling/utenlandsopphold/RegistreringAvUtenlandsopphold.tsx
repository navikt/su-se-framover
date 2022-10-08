import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete, Close } from '@navikt/ds-icons';
import { Button, Heading, Panel, Select, TextField } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ArrayPath, Controller, useFieldArray, useForm, UseFormReturn } from 'react-hook-form';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { PeriodeForm } from '~src/components/formElements/FormElements';
import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding';
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
    journalposter: Array<string | null>;
}

const registeringAvUtenlandsoppholdFormSchema = yup.object<RegisteringAvUtenlandsoppholdFormData>({
    periode: validerPeriodeTomEtterFomUtenSisteDagBegrensning,
    dokumentasjon: yup
        .string()
        .oneOf([...Object.values(UtenlandsoppholdDokumentasjon)])
        .nullable()
        .required(),
    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - yup er på bærtur igjen
    journalposter: yup.array(yup.string().required().typeError('Feltet må fylles ut')),
});

const RegistreringAvUtenlandsopphold = (props: { sakId: string }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.grunnlagFormContainer}>
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
            journalposter: props.endrerRegistrertUtenlandsopphold?.registrertUtenlandsopphold?.journalposter ?? [],
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
        if (endrerRegistrertUtenlandsopphold) {
            console.log('submit endring av registrert utenlandsopphold');
        } else {
            registrerUtenlandsOpphold({
                sakId: props.sakId,
                periode: {
                    fraOgMed: values.periode.fraOgMed!.toISOString(),
                    tilOgMed: values.periode.tilOgMed!.toISOString(),
                },
                dokumentasjon: values.dokumentasjon!,
                journalposter: values.journalposter.map((it) => it!),
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
                    <div className={styles.selectOgTextFieldContainer}>
                        <Controller
                            control={form.control}
                            name={'dokumentasjon'}
                            render={({ field }) => (
                                <Select
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
                    </div>
                </div>
                {RemoteData.isFailure(status) && (
                    <ApiErrorAlert className={styles.apiErrorAlert} error={status.error} />
                )}
                {endrerRegistrertUtenlandsopphold ? (
                    <EndrerEksisterendeUtenlandsoppholdButtons />
                ) : (
                    <TilbakeOgRegistrerButtons sakId={props.sakId} />
                )}
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

const EndrerEksisterendeUtenlandsoppholdButtons = () => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.grunnlagFormButtonsContainer}>
            <Button variant="danger" type="button" onClick={() => console.log('ugyldiggjør utenlandsopphold')}>
                {formatMessage('grunnlagForm.button.uggyldiggjør')}
            </Button>
            <Button>{formatMessage('grunnlagForm.button.oppdater')}</Button>
        </div>
    );
};

const JournalpostIderInputs = (props: { form: UseFormReturn<RegisteringAvUtenlandsoppholdFormData> }) => {
    const { formatMessage } = useI18n({ messages });

    const journalpostFieldArray = useFieldArray({
        control: props.form.control,
        name: 'journalposter' as ArrayPath<RegisteringAvUtenlandsoppholdFormData>,
    });

    return (
        <div className={styles.journalpostIderInputsContainer}>
            {journalpostFieldArray.fields.map((el, idx) => (
                <div key={el.id}>
                    <div className={styles.journalpostIdInputMedDelete}>
                        <Controller
                            control={props.form.control}
                            name={`journalposter.${idx}`}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    autoComplete="off"
                                    onChange={(e) => {
                                        props.form.setValue(`journalposter.${idx}`, e.target.value);
                                    }}
                                    value={field.value ?? ''}
                                    label={formatMessage('grunnlagForm.journalpostId')}
                                />
                            )}
                        />

                        <Button
                            variant="secondary"
                            type="button"
                            onClick={() => journalpostFieldArray.remove(idx)}
                            size="small"
                            aria-label={formatMessage('knapp.fjernJournalpostId')}
                        >
                            <Delete />
                        </Button>
                    </div>
                    {props.form.formState.errors?.journalposter?.[idx]?.message && (
                        <SkjemaelementFeilmelding>
                            {props.form.formState.errors?.journalposter?.[idx]?.message}
                        </SkjemaelementFeilmelding>
                    )}
                </div>
            ))}
            <Button variant="secondary" type="button" size="small" onClick={() => journalpostFieldArray.append(null)}>
                {formatMessage(
                    journalpostFieldArray.fields.length === 0 ? 'knapp.leggtilJournalpostId' : 'knapp.nyJournalpostId'
                )}
            </Button>
        </div>
    );
};

export default RegistreringAvUtenlandsopphold;
