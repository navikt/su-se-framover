import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Select } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { LukkSøknadBodyTypes } from '~api/søknadApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pickRemoteData } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { LukkSøknadBegrunnelse, Søknad, Søknadstype } from '~types/Søknad';

import AvslåttSøknad from '../../avslag/AvslåttSøknad';
import AvsluttBehandlingBunnknapper from '../avsluttBehandlingBunnknapper/AvsluttBehandlingBunnknapper';

import Avvist from './Avvist';
import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';
import {
    lukkSøknadInitialValues,
    LukkSøknadOgAvsluttSøknadsbehandlingFormData,
    AvsluttSøknadsbehandlingBegrunnelse,
    LukkSøknadOgAvsluttSøknadsbehandlingType,
    getLukkSøknadValidationSchema,
} from './lukkSøknadUtils';
import Trukket from './Trukket';

const LukkSøknadOgAvsluttBehandling = (props: { sakId: string; søknad: Søknad }) => {
    const history = useHistory();
    const { formatMessage } = useI18n({ messages: nb });
    const [søknadLukketStatus, lukkSøknad, resetLukkSøknadStatus] = useAsyncActionCreator(sakSlice.lukkSøknad);
    const [avslagManglendeDokStatus, avslåPgaManglendeDok, resetAvslagManglendeDokStatus] = useAsyncActionCreator(
        sakSlice.avslagManglendeDokSøknad
    );

    const submitStatus = pickRemoteData(søknadLukketStatus, avslagManglendeDokStatus);

    const handleSubmit = async (values: LukkSøknadOgAvsluttSøknadsbehandlingFormData) => {
        console.log('handle submit');
        if (!values.begrunnelse) {
            return;
        }

        if (values.begrunnelse === AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok) {
            avslåPgaManglendeDok(
                {
                    søknadId: props.søknad.id,
                    //validering fanger denne
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    body: { fritekst: values.manglendeDok.fritekst! },
                },
                () => {
                    const message = formatMessage('avslutt.behandlingHarBlittAvsluttet');
                    return history.push(Routes.createSakIntroLocation(message, props.sakId));
                }
            );
        } else {
            lukkSøknad(
                {
                    søknadId: props.søknad.id,
                    body: lagBody(values),
                },
                () => {
                    const message = formatMessage('avslutt.behandlingHarBlittAvsluttet');
                    history.push(Routes.createSakIntroLocation(message, props.sakId));
                }
            );
        }
    };

    const form = useForm<LukkSøknadOgAvsluttSøknadsbehandlingFormData>({
        defaultValues: lukkSøknadInitialValues,
        resolver(values, ...args) {
            return yupResolver(getLukkSøknadValidationSchema(values.begrunnelse))(values, ...args);
        },
    });

    const watchBegrunnelse = form.watch('begrunnelse');

    const handleRequestValidate = (onSuccess: () => void): void => {
        form.handleSubmit(onSuccess)();
    };

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.formContainer}>
            <div className={styles.selectContainer}>
                <Controller
                    control={form.control}
                    name="begrunnelse"
                    render={({ field, fieldState }) => (
                        <Select
                            label={formatMessage('lukkSøknadOgAvsluttSøknadsbehandling.begrunnelseForAvsluttelse')}
                            value={field.value ?? ''}
                            onChange={(e) => {
                                // Resetter sånn at feilmeldinger fra andre underskjema ikke henger igjen
                                resetAvslagManglendeDokStatus();
                                resetLukkSøknadStatus();
                                form.reset({
                                    ...lukkSøknadInitialValues,
                                    begrunnelse: e.target.value as LukkSøknadOgAvsluttSøknadsbehandlingType,
                                });
                            }}
                            error={fieldState.error?.message}
                        >
                            <option value="velgBegrunnelse">{formatMessage('selector.velgBegrunnelse')}</option>
                            {Object.values(LukkSøknadBegrunnelse).map((begrunnelse) => (
                                <option value={begrunnelse} key={begrunnelse}>
                                    {formatMessage(lukkSøknadBegrunnelseI18nId[begrunnelse])}
                                </option>
                            ))}
                            {Object.values(AvsluttSøknadsbehandlingBegrunnelse).map((begrunnelse) => (
                                <option value={begrunnelse} key={begrunnelse}>
                                    {formatMessage(lukkSøknadBegrunnelseI18nId[begrunnelse])}
                                </option>
                            ))}
                        </Select>
                    )}
                />
            </div>

            {watchBegrunnelse === LukkSøknadBegrunnelse.Trukket && (
                <Controller
                    control={form.control}
                    name="trukket.datoSøkerTrakkSøknad"
                    render={({ field, fieldState }) => (
                        <Trukket
                            datoSøkerTrakkSøknad={field.value}
                            søknadId={props.søknad.id}
                            søknadOpprettet={hentOpprettetDatoFraSøknad(props.søknad)}
                            feilmelding={fieldState.error?.message}
                            onDatoSøkerTrakkSøknadChange={field.onChange}
                            onRequestValidate={handleRequestValidate}
                        />
                    )}
                />
            )}

            {watchBegrunnelse === LukkSøknadBegrunnelse.Avvist && (
                <Controller
                    control={form.control}
                    name="avvist"
                    render={({ field, formState }) => (
                        <Avvist
                            søknadId={props.søknad.id}
                            avvistFormData={field.value}
                            feilmeldinger={formState.errors.avvist}
                            onValueChange={field.onChange}
                            onRequestValidate={handleRequestValidate}
                        />
                    )}
                />
            )}

            {watchBegrunnelse === AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok && (
                <Controller
                    control={form.control}
                    name="manglendeDok.fritekst"
                    render={({ field, fieldState }) => (
                        <AvslåttSøknad
                            fritekstValue={field.value}
                            fritekstError={fieldState.error?.message}
                            onFritekstChange={field.onChange}
                        />
                    )}
                />
            )}

            <div>{RemoteData.isFailure(submitStatus) && <ApiErrorAlert error={submitStatus.error} />}</div>

            <AvsluttBehandlingBunnknapper
                sakId={props.sakId}
                submitButtonText={
                    watchBegrunnelse === AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok
                        ? formatMessage('knapp.avslåSøknad')
                        : formatMessage('knapp.lukkSøknad')
                }
                submitStatus={submitStatus}
            />
        </form>
    );
};

function lagBody(values: LukkSøknadOgAvsluttSøknadsbehandlingFormData): LukkSøknadBodyTypes {
    switch (values.begrunnelse) {
        case LukkSøknadBegrunnelse.Trukket:
            return {
                type: values.begrunnelse,
                // Denne har validering i trukket komponenten
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                datoSøkerTrakkSøknad: values.trukket.datoSøkerTrakkSøknad!,
            };

        case LukkSøknadBegrunnelse.Bortfalt:
            return {
                type: values.begrunnelse,
            };
        case LukkSøknadBegrunnelse.Avvist:
            return {
                type: values.begrunnelse,
                brevConfig: values.avvist.typeBrev
                    ? {
                          brevtype: values.avvist.typeBrev,
                          fritekst: values.avvist.fritekst,
                      }
                    : null,
            };
        default:
            throw new Error('LukkSøknadBegrunnelse har ugyldig verdi');
    }
}

function hentOpprettetDatoFraSøknad(søknad: Søknad) {
    if (søknad.søknadInnhold.forNav.type === Søknadstype.Papirsøknad) {
        return søknad.søknadInnhold.forNav.mottaksdatoForSøknad;
    }
    return søknad.opprettet;
}

const lukkSøknadBegrunnelseI18nId: { [key in LukkSøknadOgAvsluttSøknadsbehandlingType]: keyof typeof nb } = {
    TRUKKET: 'lukking.begrunnelse.trukket',
    BORTFALT: 'lukking.begrunnelse.bortfalt',
    AVVIST: 'lukking.begrunnelse.avvist',
    MANGLENDE_DOK: 'avslutt.manglendeDokumentasjon',
};

export default LukkSøknadOgAvsluttBehandling;
