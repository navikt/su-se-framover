import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowsCirclepathIcon } from '@navikt/aksel-icons';
import { Button, Heading, HelpText, Select, TextField, Textarea } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React, { useMemo } from 'react';
import { Controller, UseFormTrigger, useForm } from 'react-hook-form';

import { fetchSkattForForhåndsvisning, fetchSkattPdfOgJournalfør } from '~src/api/skattApi';
import { hentNySkattegrunnlag } from '~src/features/SøknadsbehandlingActions';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Sakstype } from '~src/types/Sak';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

import ApiErrorAlert from '../apiErrorAlert/ApiErrorAlert';
import SpinnerMedTekst from '../henterInnhold/SpinnerMedTekst';
import OppsummeringAvEksternGrunnlagSkatt from '../oppsummering/oppsummeringAvEksternGrunnlag/OppsummeringAvEksternGrunnlagSkatt';

import messages from './HentOgVisSkattegrunnlag-nb';
import styles from './HentOgVisSkattegrunnlag.module.less';
import { FrioppslagFormData, frioppslagSchema } from './HentOgVisSkattegrunnlagUtils';

/**
 * Henting og visning av skatt gjøres på 2 forskjellige måter:
 * Den ene måten er i konteksten av en søknadsbehandling
 * Den andre måten er i konteksten av frioppslag
 *
 * Props bestemmer hvilken som blir valgt
 */
export const HentOgVisSkattegrunnlag = (props: { søknadsbehandling?: Søknadsbehandling }) => {
    if (props.søknadsbehandling) {
        return <HentOgVisSkattegrunnlagForSøknadsbehandling søknadsbehandling={props.søknadsbehandling} />;
    } else {
        return <HentOfVisSkattegrunnlagForFrioppslag />;
    }
};

export const HentOfVisSkattegrunnlagForFrioppslag = () => {
    const { formatMessage } = useI18n({ messages });

    const [journalførStatus, journalførSkattPdf] = useApiCall(fetchSkattPdfOgJournalfør);
    const [forhåndsvisStatus, forhåndsvisSkattePdf] = useApiCall(fetchSkattForForhåndsvisning);

    const form = useForm<FrioppslagFormData>({
        defaultValues: { fnr: '', epsFnr: '', år: '', begrunnelse: '', sakstype: Sakstype.Alder, fagsystemId: '' },
        resolver: yupResolver(frioppslagSchema),
    });

    const handleForhåndsvisClick = async (
        formValues: FrioppslagFormData,
        trigger: UseFormTrigger<FrioppslagFormData>,
    ) => {
        if (formValues.fnr.length !== 11 || isNaN(Number.parseInt(formValues.år))) {
            await trigger('fnr');
            await trigger('år');
            return;
        }

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

    return (
        <form
            onSubmit={form.handleSubmit((data) =>
                journalførSkattPdf(
                    {
                        fnr: data.fnr,
                        epsFnr: data.epsFnr ? data.epsFnr : null,
                        år: +data.år,
                        begrunnelse: data.begrunnelse,
                        sakstype: data.sakstype,
                        fagsystemId: data.fagsystemId,
                    },
                    (b: Blob) => window.open(URL.createObjectURL(b)),
                ),
            )}
        >
            <div className={styles.formContainer}>
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
                                >
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
                    onClick={() => handleForhåndsvisClick(form.getValues(), form.trigger)}
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

const HentOgVisSkattegrunnlagForSøknadsbehandling = (props: { søknadsbehandling: Søknadsbehandling }) => {
    const { formatMessage } = useI18n({ messages });

    const [nyStatus, ny] = useAsyncActionCreator(hentNySkattegrunnlag);

    //defaulter til det som er på behandlingen, hvis ikke, søker vi opp automatisk ny ved sidelast
    const status = useMemo(() => {
        if (RemoteData.isInitial(nyStatus) && props.søknadsbehandling.eksterneGrunnlag.skatt !== null) {
            return RemoteData.success(props.søknadsbehandling);
        } else if (RemoteData.isInitial(nyStatus) && props.søknadsbehandling.eksterneGrunnlag.skatt === null) {
            ny({ sakId: props.søknadsbehandling.sakId, behandlingId: props.søknadsbehandling.id });
        }
        return nyStatus;
    }, [nyStatus]);

    return (
        <div>
            <div className={styles.tittelOgRefreshContainer}>
                <Heading level="2" size="medium">
                    {formatMessage('skattegrunnlag.tittel')}
                </Heading>
                <Button
                    variant="tertiary"
                    className={styles.refreshButton}
                    onClick={() =>
                        ny({ sakId: props.søknadsbehandling.sakId, behandlingId: props.søknadsbehandling.id })
                    }
                >
                    <ArrowsCirclepathIcon title="Last inn skattegrunnlag på nytt" fontSize="2rem" />
                </Button>
            </div>

            {pipe(
                status,
                RemoteData.fold(
                    () => null,
                    () => <SpinnerMedTekst text={formatMessage('skattegrunnlag.laster')} />,
                    (err) => <ApiErrorAlert error={err} />,
                    (søknadsbehandling) => {
                        return (
                            <>
                                <OppsummeringAvEksternGrunnlagSkatt
                                    eksternGrunnlagSkatt={søknadsbehandling.eksterneGrunnlag.skatt}
                                />
                            </>
                        );
                    },
                ),
            )}
        </div>
    );
};

export default HentOgVisSkattegrunnlagForSøknadsbehandling;
