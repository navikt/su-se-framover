import * as RemoteData from '@devexperts/remote-data-ts';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as SøknadActions from '~src/features/søknad/SøknadActions.ts';
import { useAsyncActionCreator } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n.ts';
import * as Routes from '~src/lib/routes.ts';
import AvsluttBehandlingBunnknapper from '~src/pages/saksbehandling/avsluttBehandling/avsluttBehandlingBunnknapper/AvsluttBehandlingBunnknapper.tsx';
import styles from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknad.module.less';
import nb from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknad-nb.ts';
import { LukkSøknadBegrunnelse, Søknad } from '~src/types/Søknad.ts';

export const BortfaltForm = (props: { søknad: Søknad; sakId: string }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: nb });
    const [søknadLukketStatus, lukkSøknad] = useAsyncActionCreator(SøknadActions.lukkSøknad);

    const { søknad, sakId } = props;

    const form = useForm();

    const handleSubmit = async () => {
        lukkSøknad(
            {
                søknadId: søknad.id,
                body: {
                    type: LukkSøknadBegrunnelse.Bortfalt,
                },
            },
            () => {
                const message = formatMessage('avslutt.behandlingHarBlittAvsluttet');
                Routes.navigateToSakIntroWithMessage(navigate, message, sakId);
            },
        );
    };

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.formContainer}>
            <AvsluttBehandlingBunnknapper
                sakId={sakId}
                submitButtonText={formatMessage('knapp.lukkSøknad')}
                isSubmitPending={RemoteData.isPending(søknadLukketStatus)}
            />
        </form>
    );
};
