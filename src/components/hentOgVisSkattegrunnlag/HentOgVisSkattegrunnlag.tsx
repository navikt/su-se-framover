import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, BodyShort, Button, HelpText, Radio, RadioGroup, Select, TextField, Textarea } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { Controller, UseFormClearErrors, UseFormTrigger, useForm } from 'react-hook-form';

import {
    fetchSkattForForhåndsvisning,
    fetchSkattPdfOgJournalfør,
    fetchSkattPdfOgJournalførUtenVerifisering,
} from '~src/api/skattApi';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Sakstype } from '~src/types/Sak';

import ApiErrorAlert from '../apiErrorAlert/ApiErrorAlert';
import { ApiErrorCode } from '../apiErrorAlert/apiErrorCode';

import messages from './HentOgVisSkattegrunnlag-nb';
import styles from './HentOgVisSkattegrunnlag.module.less';
import { FrioppslagFormData, frioppslagSchema, HentSkatteDataFor } from './HentOgVisSkattegrunnlagUtils';

const HentOfVisSkattegrunnlagForFrioppslag = () => {
    const { formatMessage } = useI18n({ messages });

    const [warning, setWarning] = useState<string>('');
    const [journalførStatus, journalførSkattPdf] = useApiCall(fetchSkattPdfOgJournalfør);
    const [journalførStatusUtenVerifisering, journalførSkattPdfUtenVerifisering] = useApiCall(
        fetchSkattPdfOgJournalførUtenVerifisering,
    );
    const [forhåndsvisStatus, forhåndsvisSkattePdf] = useApiCall(fetchSkattForForhåndsvisning);

    const form = useForm<FrioppslagFormData>({
        defaultValues: { fnr: '', epsFnr: '', år: '', begrunnelse: '', sakstype: null, fagsystemId: '' },
        resolver: yupResolver(frioppslagSchema),
    });

    const handleForhåndsvisClick = async (
        formValues: FrioppslagFormData,
        trigger: UseFormTrigger<FrioppslagFormData>,
        clearErrors: UseFormClearErrors<FrioppslagFormData>,
    ) => {
        if (
            formValues.henterSkatteDataFor === null ||
            isNaN(Number.parseInt(formValues.år)) ||
            Number.parseInt(formValues.år) < 2020 ||
            formValues.sakstype === null
        ) {
            await trigger('henterSkatteDataFor');
            await trigger('år');
            await trigger('sakstype');
            return;
        }

        if (
            formValues.henterSkatteDataFor === HentSkatteDataFor.Søker ||
            formValues.henterSkatteDataFor === HentSkatteDataFor.SøkerOgEPS
        ) {
            if (formValues.fnr.length !== 11) {
                await trigger('fnr');
                return;
            }
        }

        if (
            formValues.henterSkatteDataFor === HentSkatteDataFor.EPS ||
            formValues.henterSkatteDataFor === HentSkatteDataFor.SøkerOgEPS
        ) {
            if (formValues.epsFnr.length !== 11) {
                await trigger('epsFnr');
                return;
            }
        }

        clearErrors();

        forhåndsvisSkattePdf(
            {
                fnr:
                    formValues.henterSkatteDataFor === HentSkatteDataFor.Søker ||
                    formValues.henterSkatteDataFor === HentSkatteDataFor.SøkerOgEPS
                        ? formValues.fnr
                        : null,
                epsFnr:
                    formValues.henterSkatteDataFor === HentSkatteDataFor.EPS ||
                    formValues.henterSkatteDataFor === HentSkatteDataFor.SøkerOgEPS
                        ? formValues.epsFnr
                        : null,
                år: +formValues.år,
                begrunnelse: formValues.begrunnelse,
                sakstype: formValues.sakstype,
                fagsystemId: formValues.fagsystemId,
            },
            (b: Blob) => window.open(URL.createObjectURL(b)),
        );
    };

    const watch = form.watch();

    useEffect(() => {
        if (form.formState.touchedFields.fagsystemId && form.formState.touchedFields.sakstype) {
            if (watch.fagsystemId.length !== 0 && watch.fagsystemId.length === 4 && watch.sakstype === Sakstype.Alder) {
                setWarning('Valgt sakstype alder med fagsystemId som matcher uføre');
            }

            if (watch.fagsystemId.length !== 0 && watch.fagsystemId.length !== 4 && watch.sakstype === Sakstype.Uføre) {
                setWarning('Valgt sakstype uføre med fagsystemId som ikke matcher uføre');
            }

            if (
                watch.fagsystemId.length !== 0 &&
                watch.fagsystemId.length !== 7 &&
                watch.fagsystemId.length !== 4 &&
                watch.sakstype === Sakstype.Alder
            ) {
                setWarning(
                    'Valgt sakstype alder med ukjent format på fagsystemId - vennligst dobbeltsjekk at dette er riktig',
                );
            }

            if (
                watch.fagsystemId.length !== 0 &&
                watch.fagsystemId.length === 7 &&
                watch.sakstype === Sakstype.Alder &&
                watch.fagsystemId.match('[0-9]{7}')
            ) {
                setWarning(
                    'Valgt sakstype alder med gammel fagsystemId som kun inneholder tall. Vennligst dobbeltsjekk at dette er riktig',
                );
            }

            if (
                watch.fagsystemId.length === 0 ||
                (watch.fagsystemId.length === 4 && watch.sakstype === Sakstype.Uføre) ||
                (watch.fagsystemId.length === 7 &&
                    watch.sakstype === Sakstype.Alder &&
                    !watch.fagsystemId.match('[0-9]{7}'))
            ) {
                setWarning('');
            }
        }
    }, [watch.begrunnelse, watch.fagsystemId, watch.sakstype, watch.epsFnr, watch.år, watch.fnr]);

    return (
        <form
            onSubmit={form.handleSubmit((data) =>
                journalførSkattPdf(
                    {
                        fnr:
                            data.henterSkatteDataFor === HentSkatteDataFor.Søker ||
                            data.henterSkatteDataFor === HentSkatteDataFor.SøkerOgEPS
                                ? data.fnr
                                : null,
                        epsFnr:
                            data.henterSkatteDataFor === HentSkatteDataFor.EPS ||
                            data.henterSkatteDataFor === HentSkatteDataFor.SøkerOgEPS
                                ? data.epsFnr
                                : null,
                        år: +data.år,
                        begrunnelse: data.begrunnelse,
                        sakstype: data.sakstype!,
                        fagsystemId: data.fagsystemId,
                    },
                    (b: Blob) => window.open(URL.createObjectURL(b)),
                ),
            )}
        >
            <div className={styles.formContainer}>
                {warning && (
                    <Alert className={styles.alert} variant="warning">
                        {warning}
                    </Alert>
                )}

                <div className={styles.upperFormContainer}>
                    <div className={styles.skatteDataForContainer}>
                        <Controller
                            control={form.control}
                            name={'henterSkatteDataFor'}
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    {...field}
                                    legend={
                                        <div className={styles.fnrLabel}>
                                            Velg hvem du vil hente skatte-data for
                                            <HelpText>
                                                <BodyShort>
                                                    Dersom du henter skattedata for søker og EPS, vil begge sitt
                                                    skattegrunnlaget bli journalført på søker
                                                </BodyShort>
                                                <BodyShort>
                                                    Ellers blir skattegrunnlaget journalført på fødselsnummeret du har
                                                    valgt
                                                </BodyShort>
                                            </HelpText>
                                        </div>
                                    }
                                    error={fieldState.error?.message}
                                    value={field.value ?? ''}
                                >
                                    <Radio id={field.name} value={HentSkatteDataFor.Søker} ref={field.ref}>
                                        Søker
                                    </Radio>
                                    <Radio value={HentSkatteDataFor.EPS}>EPS</Radio>
                                    <Radio value={HentSkatteDataFor.SøkerOgEPS}>Søker & EPS</Radio>
                                </RadioGroup>
                            )}
                        />
                        <div className={styles.formInputContainers}>
                            {(watch.henterSkatteDataFor === HentSkatteDataFor.Søker ||
                                watch.henterSkatteDataFor === HentSkatteDataFor.SøkerOgEPS) && (
                                <Controller
                                    control={form.control}
                                    name={'fnr'}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            label="Fødselsnummer - Søker"
                                            {...field}
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            )}
                            {(watch.henterSkatteDataFor === HentSkatteDataFor.EPS ||
                                watch.henterSkatteDataFor === HentSkatteDataFor.SøkerOgEPS) && (
                                <Controller
                                    control={form.control}
                                    name={'epsFnr'}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            label="Fødselsnummer - EPS"
                                            {...field}
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            )}
                        </div>
                    </div>

                    <div className={styles.formInputContainers}>
                        <Controller
                            control={form.control}
                            name={'fagsystemId'}
                            render={({ field, fieldState }) => (
                                <TextField
                                    label={formatMessage('frioppslag.fagsystemId')}
                                    {...field}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />

                        <Controller
                            control={form.control}
                            name={'sakstype'}
                            render={({ field, fieldState }) => (
                                <Select
                                    id={field.name}
                                    className={styles.select}
                                    label={formatMessage('frioppslag.sakstype')}
                                    error={fieldState.error?.message}
                                    {...field}
                                    value={field.value ?? ''}
                                >
                                    <option value="" disabled />
                                    {Object.entries(Sakstype).map((type) => (
                                        <option value={type[1]} key={type[1]}>
                                            {type[0]}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                    </div>
                    <div className={styles.formInputContainers}>
                        <Controller
                            control={form.control}
                            name={'år'}
                            render={({ field, fieldState }) => (
                                <TextField
                                    label={formatMessage('frioppslag.år')}
                                    {...field}
                                    inputMode="numeric"
                                    error={fieldState.error?.message}
                                />
                            )}
                        />
                    </div>
                </div>
                <Controller
                    control={form.control}
                    name={'begrunnelse'}
                    render={({ field, fieldState }) => (
                        <Textarea
                            label={formatMessage('frioppslag.begrunnelse')}
                            description={formatMessage('frioppslag.begrunnelse.description')}
                            {...field}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </div>

            <div className={styles.buttonContainers}>
                <Button
                    type="button"
                    variant="secondary"
                    loading={RemoteData.isPending(forhåndsvisStatus)}
                    onClick={() => handleForhåndsvisClick(form.getValues(), form.trigger, form.clearErrors)}
                >
                    {formatMessage('frioppslag.knapp.forhåndsvis')}
                </Button>
                <Button loading={RemoteData.isPending(journalførStatus)}>
                    {formatMessage('frioppslag.knapp.søkOgJournalfør')}
                </Button>
            </div>
            {RemoteData.isFailure(forhåndsvisStatus) && <ApiErrorAlert error={forhåndsvisStatus.error} />}
            {RemoteData.isFailure(journalførStatus) && (
                <ApiErrorAlert error={journalførStatus.error}>
                    {journalførStatus.error.body.code === ApiErrorCode.FANT_IKKE_ALDERSSAK && (
                        <div className={styles.apiErrorContentContainer}>
                            <BodyShort>
                                Merk at systemet kan ikke garantere knyttning - vil du journalføre likevel?
                            </BodyShort>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={async () => {
                                    await form.trigger().then((isFormValid) => {
                                        if (isFormValid) {
                                            const values = form.getValues();
                                            journalførSkattPdfUtenVerifisering(
                                                {
                                                    fnr:
                                                        values.henterSkatteDataFor === HentSkatteDataFor.Søker ||
                                                        values.henterSkatteDataFor === HentSkatteDataFor.SøkerOgEPS
                                                            ? values.fnr
                                                            : null,
                                                    epsFnr:
                                                        values.henterSkatteDataFor === HentSkatteDataFor.EPS ||
                                                        values.henterSkatteDataFor === HentSkatteDataFor.SøkerOgEPS
                                                            ? values.epsFnr
                                                            : null,
                                                    år: +values.år,
                                                    begrunnelse: values.begrunnelse,
                                                    sakstype: values.sakstype!,
                                                    fagsystemId: values.fagsystemId,
                                                },
                                                (b: Blob) => window.open(URL.createObjectURL(b)),
                                            );
                                        }
                                    });
                                }}
                            >
                                Journalfør
                            </Button>
                        </div>
                    )}
                </ApiErrorAlert>
            )}
            {RemoteData.isFailure(journalførStatusUtenVerifisering) && (
                <ApiErrorAlert error={journalførStatusUtenVerifisering.error} />
            )}
        </form>
    );
};

export default HentOfVisSkattegrunnlagForFrioppslag;
