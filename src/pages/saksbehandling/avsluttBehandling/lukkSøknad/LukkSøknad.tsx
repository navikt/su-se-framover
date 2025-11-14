import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Select } from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { LukkSøknadBodyTypes } from '~src/api/søknadApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import * as SøknadActions from '~src/features/søknad/SøknadActions';
import { pickRemoteData } from '~src/lib/fp';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import Avvist from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/Avvist.tsx';
import { LukkSøknadBegrunnelse, Søknad } from '~src/types/Søknad';
import { Søknadstype } from '~src/types/Søknadinnhold';

import AvsluttBehandlingBunnknapper from '../avsluttBehandlingBunnknapper/AvsluttBehandlingBunnknapper';

import AvslåttSøknad from './avslag/AvslåttSøknad';
import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';
import {
    AvsluttSøknadsbehandlingBegrunnelse,
    AvvistBrevtyper,
    getLukkSøknadValidationSchema,
    lukkSøknadInitialValues,
    LukkSøknadOgAvsluttSøknadsbehandlingFormData,
    LukkSøknadOgAvsluttSøknadsbehandlingType,
} from './lukkSøknadUtils';
import Trukket from './Trukket';

const LukkSøknadOgAvsluttBehandling = (props: { sakId: string; søknad: Søknad }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: nb });
    const [søknadLukketStatus, lukkSøknad, resetLukkSøknadStatus] = useAsyncActionCreator(SøknadActions.lukkSøknad);
    const [avslagManglendeDokStatus, avslåPgaManglendeDok, resetAvslagManglendeDokStatus] = useAsyncActionCreator(
        SøknadActions.avslåSøknad,
    );

    const submitStatus = pickRemoteData(søknadLukketStatus, avslagManglendeDokStatus);

    const handleSubmit = async (values: LukkSøknadOgAvsluttSøknadsbehandlingFormData) => {
        if (!values.begrunnelse) {
            return;
        }

        if (values.begrunnelse === AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok) {
            avslåPgaManglendeDok(
                {
                    søknadId: props.søknad.id,
                    body: { fritekst: values.manglendeDok.fritekst! },
                },
                () => {
                    const message = formatMessage('avslutt.behandlingHarBlittAvsluttet');
                    return Routes.navigateToSakIntroWithMessage(navigate, message, props.sakId);
                },
            );
        } else {
            lukkSøknad(
                {
                    søknadId: props.søknad.id,
                    body: lagBody(values),
                },
                () => {
                    const message = formatMessage('avslutt.behandlingHarBlittAvsluttet');
                    Routes.navigateToSakIntroWithMessage(navigate, message, props.sakId);
                },
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
                    name="avvist.fritekst"
                    render={({ field, fieldState }) => (
                        <Avvist
                            søknadId={props.søknad.id}
                            fritekstValue={field.value}
                            fritekstError={fieldState.error}
                            onFritekstChange={field.onChange}
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
                            søknadId={props.søknad.id}
                            fritekstValue={field.value}
                            fritekstError={fieldState.error}
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
                isSubmitPending={RemoteData.isPending(submitStatus)}
            />
        </form>
    );
};

function lagBody(values: LukkSøknadOgAvsluttSøknadsbehandlingFormData): LukkSøknadBodyTypes {
    switch (values.begrunnelse) {
        case LukkSøknadBegrunnelse.Trukket:
            return {
                type: values.begrunnelse,
                datoSøkerTrakkSøknad: values.trukket.datoSøkerTrakkSøknad!,
            };

        case LukkSøknadBegrunnelse.Bortfalt:
            return {
                type: values.begrunnelse,
            };
        case LukkSøknadBegrunnelse.Avvist:
            return {
                type: values.begrunnelse,
                brevConfig: {
                    brevtype: AvvistBrevtyper.Vedtaksbrev,
                    fritekst: values.avvist.fritekst,
                },
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
    AVVIST: 'lukking.begrunnelse.avslag',
    MANGLENDE_DOK: 'avslutt.manglendeDokumentasjon',
};

export default LukkSøknadOgAvsluttBehandling;
