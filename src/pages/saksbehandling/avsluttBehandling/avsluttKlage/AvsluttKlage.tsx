import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Textarea } from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { avsluttKlage } from '~src/features/klage/klageActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import yup from '~src/lib/validering';
import { Klage } from '~src/types/Klage';

import AvsluttBehandlingBunnknapper from '../avsluttBehandlingBunnknapper/AvsluttBehandlingBunnknapper';
import styles from './avsluttKlage.module.less';
import messages from './avsluttKlage-nb';

interface AvsluttKlageFormData {
    begrunnelse: string;
}

const schema = yup.object<AvsluttKlageFormData>({
    begrunnelse: yup.string().required(),
});

const AvsluttKlage = (props: { sakId: string; klage: Klage }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const [avsluttStatus, avsluttAction] = useAsyncActionCreator(avsluttKlage);

    const { control, handleSubmit } = useForm<AvsluttKlageFormData>({
        defaultValues: {},
        resolver: yupResolver(schema),
    });

    const submitHandler = (data: AvsluttKlageFormData) => {
        avsluttAction(
            {
                sakId: props.sakId,
                klageId: props.klage.id,
                begrunnelse: data.begrunnelse,
            },
            () => {
                const message = formatMessage('avslutt.klageHarBlittAvsluttet');
                return Routes.navigateToSakIntroWithMessage(navigate, message, props.sakId);
            },
        );
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)}>
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

            {RemoteData.isFailure(avsluttStatus) && <ApiErrorAlert error={avsluttStatus.error} />}

            <AvsluttBehandlingBunnknapper
                sakId={props.sakId}
                submitButtonText={formatMessage('knapp.avsluttKlage')}
                isSubmitPending={RemoteData.isPending(avsluttStatus)}
            />
        </form>
    );
};

export default AvsluttKlage;
