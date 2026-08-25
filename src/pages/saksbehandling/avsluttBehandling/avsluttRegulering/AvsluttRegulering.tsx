import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Textarea } from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert.tsx';
import { avsluttRegulering } from '~src/features/ReguleringAction.ts';
import { useAsyncActionCreator } from '~src/lib/hooks.ts';
import { useI18n } from '~src/lib/i18n.ts';
import * as Routes from '~src/lib/routes';
import AvsluttBehandlingBunnknapper from '~src/pages/saksbehandling/avsluttBehandling/avsluttBehandlingBunnknapper/AvsluttBehandlingBunnknapper.tsx';
import {
    AvsluttReguleringFormData,
    avsluttReguleringSchema,
} from '~src/pages/saksbehandling/avsluttBehandling/avsluttRegulering/avsluttReguleringUtils.ts';
import { Regulering } from '~src/types/Regulering.ts';
import styles from './avsluttRegulering.module.less';
import messages from './avsluttRegulering-nb.ts';

const AvsluttRegulering = (props: { sakId: string; regulering: Regulering }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const [avsluttReguleringStatus, avsluttReguleringAction] = useAsyncActionCreator(avsluttRegulering);

    const { control, handleSubmit } = useForm<AvsluttReguleringFormData>({
        defaultValues: { begrunnelse: null },
        resolver: yupResolver(avsluttReguleringSchema()),
    });

    const avsluttReguleringSubmitHandler = (data: AvsluttReguleringFormData) => {
        avsluttReguleringAction(
            {
                reguleringId: props.regulering.id,
                begrunnelse: data.begrunnelse!,
            },
            () => {
                const message = formatMessage('avslutt.reguleringHarBlittAvsluttet');
                return Routes.navigateToSakIntroWithMessage(navigate, message, props.sakId);
            },
        );
    };

    return (
        <form onSubmit={handleSubmit(avsluttReguleringSubmitHandler)}>
            <div className={styles.begrunnelseContainer}>
                <Controller
                    control={control}
                    name={'begrunnelse'}
                    render={({ field, fieldState }) => (
                        <Textarea
                            label={formatMessage('form.begrunnelse.label')}
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </div>
            {RemoteData.isFailure(avsluttReguleringStatus) && <ApiErrorAlert error={avsluttReguleringStatus.error} />}

            <AvsluttBehandlingBunnknapper
                sakId={props.sakId}
                submitButtonText={formatMessage('knapp.avsluttRegulering')}
                isSubmitPending={RemoteData.isPending(avsluttReguleringStatus)}
            />
        </form>
    );
};

export default AvsluttRegulering;
