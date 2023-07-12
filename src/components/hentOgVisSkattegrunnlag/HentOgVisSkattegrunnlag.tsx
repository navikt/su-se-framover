import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowsCirclepathIcon } from '@navikt/aksel-icons';
import { Button, Heading, TextField } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { fetchSkattFor } from '~src/api/skattApi';
import { hentNySkattegrunnlag } from '~src/features/SøknadsbehandlingActions';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import yup, { validateStringAsPositiveNumber } from '~src/lib/validering';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

import ApiErrorAlert from '../apiErrorAlert/ApiErrorAlert';
import SpinnerMedTekst from '../henterInnhold/SpinnerMedTekst';
import OppsummeringAvEksternGrunnlagSkatt from '../oppsummering/oppsummeringAvEksternGrunnlag/OppsummeringAvEksternGrunnlagSkatt';
import OppsummeringAvSkattegrunnlag from '../oppsummering/oppsummeringAvSkattegrunnlag/OppsummeringAvSkattegrunnlag';

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
}

const frioppslagSchema = yup.object<FrioppslagFormData>({
    fnr: yup.string().required().length(11),
    år: validateStringAsPositiveNumber().length(4),
});

export const HentOfVisSkattegrunnlagForFrioppslag = () => {
    const { formatMessage } = useI18n({ messages });

    const [skattStatus, hentSkattFor] = useApiCall(fetchSkattFor);

    const form = useForm<FrioppslagFormData>({
        defaultValues: { fnr: '', år: '' },
        resolver: yupResolver(frioppslagSchema),
    });

    return (
        <div className={styles.frioppslagContainer}>
            <form
                className={styles.frioppslagForm}
                onSubmit={form.handleSubmit((data) => hentSkattFor({ fnr: data.fnr, år: +data.år }))}
            >
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

                <Button loading={RemoteData.isPending(skattStatus)}>Søk</Button>
            </form>
            {RemoteData.isSuccess(skattStatus) && <OppsummeringAvSkattegrunnlag skattegrunnlag={skattStatus.value} />}
        </div>
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
