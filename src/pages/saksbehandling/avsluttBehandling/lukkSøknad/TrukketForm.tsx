import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as SøknadActions from '~src/features/søknad/SøknadActions.ts';
import { useAsyncActionCreator } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n.ts';
import * as Routes from '~src/lib/routes.ts';
import { Nullable } from '~src/lib/types.ts';
import AvsluttBehandlingBunnknapper from '~src/pages/saksbehandling/avsluttBehandling/avsluttBehandlingBunnknapper/AvsluttBehandlingBunnknapper.tsx';
import styles from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknad.module.less';
import nb from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknad-nb.ts';
import { trukketSøknadSchema } from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknadUtils.ts';
import Trukket from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/Trukket.tsx';
import { LukkSøknadBegrunnelse, Søknad } from '~src/types/Søknad.ts';
import { Søknadstype } from '~src/types/Søknadinnhold.ts';

export const TrukketForm = (props: { søknad: Søknad; sakId: string }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: nb });
    const [søknadLukketStatus, lukkSøknad] = useAsyncActionCreator(SøknadActions.lukkSøknad);

    const { søknad, sakId } = props;

    type TrukketFormData = {
        datoSøkerTrakkSøknad: Nullable<string>;
    };
    const form = useForm<TrukketFormData>({
        defaultValues: {
            datoSøkerTrakkSøknad: null,
        },
        resolver: yupResolver(trukketSøknadSchema),
    });

    const handleSubmit = async (values: TrukketFormData) => {
        lukkSøknad(
            {
                søknadId: søknad.id,
                body: {
                    type: LukkSøknadBegrunnelse.Trukket,
                    datoSøkerTrakkSøknad: values.datoSøkerTrakkSøknad!,
                },
            },
            () => {
                const message = formatMessage('avslutt.behandlingHarBlittAvsluttet');
                Routes.navigateToSakIntroWithMessage(navigate, message, sakId);
            },
        );
    };

    const handleRequestValidate = (onSuccess: () => void): void => {
        form.handleSubmit(onSuccess)();
    };

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.formContainer}>
            <Controller
                control={form.control}
                name="datoSøkerTrakkSøknad"
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
            <AvsluttBehandlingBunnknapper
                sakId={sakId}
                submitButtonText={formatMessage('knapp.lukkSøknad')}
                isSubmitPending={RemoteData.isPending(søknadLukketStatus)}
            />
        </form>
    );
};

function hentOpprettetDatoFraSøknad(søknad: Søknad) {
    if (søknad.søknadInnhold.forNav.type === Søknadstype.Papirsøknad) {
        return søknad.søknadInnhold.forNav.mottaksdatoForSøknad;
    }
    return søknad.opprettet;
}
