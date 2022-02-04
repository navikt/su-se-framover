import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Textarea } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { avsluttKlage } from '~features/klage/klageActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { Klage } from '~types/Klage';

import AvsluttBehandlingBunnknapper from '../avsluttBehandlingBunnknapper/AvsluttBehandlingBunnknapper';

import messages from './avsluttKlage-nb';
import styles from './avsluttKlage.module.less';

interface AvsluttKlageFormData {
    begrunnelse: string;
}

const schema = yup.object<AvsluttKlageFormData>({
    begrunnelse: yup.string().required(),
});

const AvsluttKlage = (props: { sakId: string; klage: Klage }) => {
    const history = useHistory();
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
                return history.push(Routes.createSakIntroLocation(message, props.sakId));
            }
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
