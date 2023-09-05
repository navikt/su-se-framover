import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowsCirclepathIcon } from '@navikt/aksel-icons';
import { Button, Heading, Select, TextField, Textarea } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { fetchSkattFor as fetchSkattPdfFor } from '~src/api/skattApi';
import { hentNySkattegrunnlag } from '~src/features/SøknadsbehandlingActions';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import yup from '~src/lib/validering';
import { Sakstype } from '~src/types/Sak';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

import ApiErrorAlert from '../apiErrorAlert/ApiErrorAlert';
import SpinnerMedTekst from '../henterInnhold/SpinnerMedTekst';
import OppsummeringAvEksternGrunnlagSkatt from '../oppsummering/oppsummeringAvEksternGrunnlag/OppsummeringAvEksternGrunnlagSkatt';

import messages from './HentOgVisSkattegrunnlag-nb';
import styles from './HentOgVisSkattegrunnlag.module.less';

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

interface FrioppslagFormData {
    fnr: string;
    år: string;
    begrunnelse: string;
    sakstype: Sakstype;
    fagsystemId: string;
}

const frioppslagSchema = yup.object<FrioppslagFormData>({
    fnr: yup.string().required().length(11),
    år: yup
        .string()
        .test('Tallet må være lik eller høyere enn 2006', `År må være et tall større eller lik 2006`, function (value) {
            return value ? Number.parseInt(value, 10) > 2005 : false;
        })
        .required(),
    begrunnelse: yup.string().required(),
    sakstype: yup.string().oneOf(Object.values(Sakstype)).required(),
    fagsystemId: yup.string().required(),
});

export const HentOfVisSkattegrunnlagForFrioppslag = () => {
    const { formatMessage } = useI18n({ messages });

    const [skattPdfStatus, hentSkattPdfFor] = useApiCall(fetchSkattPdfFor);

    const form = useForm<FrioppslagFormData>({
        defaultValues: { fnr: '', år: '', begrunnelse: '', sakstype: Sakstype.Alder, fagsystemId: '' },
        resolver: yupResolver(frioppslagSchema),
    });

    return (
        <form
            onSubmit={form.handleSubmit((data) =>
                hentSkattPdfFor(
                    {
                        fnr: data.fnr,
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
                                    label={formatMessage('frioppslag.fødselsnummer')}
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

            <Button className={styles.søkButton} loading={RemoteData.isPending(skattPdfStatus)}>
                {formatMessage('frioppslag.knapp.søkOgJournalfør')}
            </Button>
            {RemoteData.isFailure(skattPdfStatus) && <ApiErrorAlert error={skattPdfStatus.error} />}
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
