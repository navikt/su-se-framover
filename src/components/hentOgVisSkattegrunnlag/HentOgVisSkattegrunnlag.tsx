import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, HelpText, Select, TextField, Textarea } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { Controller, UseFormClearErrors, UseFormTrigger, useForm } from 'react-hook-form';

import { fetchSkattForForhåndsvisning, fetchSkattPdfOgJournalfør } from '~src/api/skattApi';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Sakstype } from '~src/types/Sak';

import ApiErrorAlert from '../apiErrorAlert/ApiErrorAlert';

import messages from './HentOgVisSkattegrunnlag-nb';
import styles from './HentOgVisSkattegrunnlag.module.less';
import { FrioppslagFormData, frioppslagSchema } from './HentOgVisSkattegrunnlagUtils';

export const HentOfVisSkattegrunnlagForFrioppslag = () => {
    const { formatMessage } = useI18n({ messages });

    const [warnings, setWarnings] = useState<Array<{ id: number; text: string }>>([]);
    const [journalførStatus, journalførSkattPdf] = useApiCall(fetchSkattPdfOgJournalfør);
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
            formValues.fnr.length !== 11 ||
            isNaN(Number.parseInt(formValues.år)) ||
            Number.parseInt(formValues.år) < 2020 ||
            formValues.sakstype === null
        ) {
            await trigger('fnr');
            await trigger('år');
            await trigger('sakstype');
            return;
        }

        if (formValues.epsFnr && formValues.epsFnr.length !== 11) {
            await trigger('epsFnr');
            return;
        }

        clearErrors(['fnr', 'år', 'epsFnr', 'sakstype']);

        forhåndsvisSkattePdf(
            {
                fnr: formValues.fnr,
                epsFnr: formValues.epsFnr ? formValues.epsFnr : null,
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
            if (watch.fagsystemId.length === 4 && watch.sakstype === Sakstype.Alder) {
                setWarnings([
                    ...warnings.filter((warning) => warning.id !== 1),
                    { id: 1, text: 'Valgt sakstype alder med fagsystemId som matcher uføre' },
                ]);
            }

            if (watch.fagsystemId.length !== 4 && watch.sakstype === Sakstype.Uføre) {
                setWarnings([
                    ...warnings.filter((warning) => warning.id !== 2),
                    { id: 2, text: 'Valgt sakstype uføre med fagsystemId som ikke matcher uføre' },
                ]);
            }

            if (watch.fagsystemId.length !== 7 && watch.sakstype === Sakstype.Alder) {
                setWarnings([
                    ...warnings.filter((warning) => warning.id !== 3),
                    {
                        id: 3,
                        text: 'Valgt sakstype alder med ukjent format på fagsystemId - vennligst dobbeltsjekk at dette er riktig',
                    },
                ]);
            }

            if (watch.fagsystemId.length === 4 && watch.sakstype === Sakstype.Uføre) {
                setWarnings(warnings.filter((warning) => warning.id !== 2));
            }
            if (watch.fagsystemId.length === 7 && watch.sakstype === Sakstype.Alder) {
                setWarnings(warnings.filter((warning) => warning.id !== 1 && warning.id !== 3));
            }
        }
    }, [watch.begrunnelse, watch.fagsystemId, watch.sakstype, watch.epsFnr, watch.år, watch.fnr]);

    return (
        <form
            onSubmit={form.handleSubmit((data) =>
                journalførSkattPdf(
                    {
                        fnr: data.fnr,
                        epsFnr: data.epsFnr ? data.epsFnr : null,
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
                {warnings.length > 0 && (
                    <Alert className={styles.alert} variant="warning">
                        <ul>
                            {warnings.map((warning) => (
                                <li key={warning.id}>{warning.text}</li>
                            ))}
                        </ul>
                    </Alert>
                )}
                <div className={styles.upperFormContainer}>
                    <div className={styles.formInputContainers}>
                        <Controller
                            control={form.control}
                            name={'fnr'}
                            render={({ field, fieldState }) => (
                                <TextField
                                    label={
                                        <div className={styles.fnrLabel}>
                                            {formatMessage('frioppslag.fødselsnummer')}
                                            <HelpText>
                                                {formatMessage('frioppslag.fødselsnummer.søkers.helpText')}
                                            </HelpText>
                                        </div>
                                    }
                                    {...field}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />
                        <Controller
                            control={form.control}
                            name={'epsFnr'}
                            render={({ field, fieldState }) => (
                                <TextField
                                    label={formatMessage('frioppslag.fødselsnummer.eps')}
                                    {...field}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />

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
            {RemoteData.isFailure(journalførStatus) && <ApiErrorAlert error={journalførStatus.error} />}
        </form>
    );
};

export default HentOfVisSkattegrunnlagForFrioppslag;
