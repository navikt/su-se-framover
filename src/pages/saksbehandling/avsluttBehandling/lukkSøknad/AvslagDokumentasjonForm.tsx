import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as SøknadActions from '~src/features/søknad/SøknadActions.ts';
import { useAsyncActionCreator } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n.ts';
import * as Routes from '~src/lib/routes.ts';
import AvsluttBehandlingBunnknapper from '~src/pages/saksbehandling/avsluttBehandling/avsluttBehandlingBunnknapper/AvsluttBehandlingBunnknapper.tsx';
import AvslagDokumentasjon from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/avslag/AvslagDokumentasjon.tsx';
import styles from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknad.module.less';
import nb from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknad-nb.ts';
import { fritekstSchema } from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknadUtils.ts';
import { Søknad } from '~src/types/Søknad.ts';

export const AvslagDokumentasjonForm = (props: { søknad: Søknad; sakId: string }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: nb });
    const [avslagManglendeDokStatus, avslåPgaManglendeDok] = useAsyncActionCreator(SøknadActions.avslåSøknad);

    const { søknad, sakId } = props;

    type AvslagDokumentasjonFormData = {
        fritekst: string;
    };
    const form = useForm<AvslagDokumentasjonFormData>({
        defaultValues: {
            fritekst: '',
        },
        resolver: yupResolver(fritekstSchema),
    });

    const handleSubmit = async (values: AvslagDokumentasjonFormData) => {
        avslåPgaManglendeDok(
            {
                søknadId: søknad.id,
                body: { fritekst: values.fritekst! },
            },
            () => {
                const message = formatMessage('avslutt.behandlingHarBlittAvsluttet');
                return Routes.navigateToSakIntroWithMessage(navigate, message, sakId);
            },
        );
    };

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.formContainer}>
            <Controller
                control={form.control}
                name="fritekst"
                render={({ field, fieldState }) => (
                    <AvslagDokumentasjon
                        søknadId={søknad.id}
                        fritekstValue={field.value}
                        fritekstError={fieldState.error}
                        onFritekstChange={field.onChange}
                    />
                )}
            />
            <AvsluttBehandlingBunnknapper
                sakId={sakId}
                submitButtonText={formatMessage('knapp.lukkSøknad')}
                isSubmitPending={RemoteData.isPending(avslagManglendeDokStatus)}
            />
        </form>
    );
};
