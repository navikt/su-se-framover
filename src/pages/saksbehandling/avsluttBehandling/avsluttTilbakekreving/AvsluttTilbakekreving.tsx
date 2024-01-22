import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading, Textarea } from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { avsluttTilbakekreving } from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';

import messages from '../avsluttBehandling-nb';
import AvsluttBehandlingBunnknapper from '../avsluttBehandlingBunnknapper/AvsluttBehandlingBunnknapper';

import styles from './AvsluttTilbakekreving.module.less';
import { AvsluttTilbakekrevingFormData, avsluttTilbakekrevingSchema } from './AvsluttTilbakekrevingUtils';

const AvsluttTilbakekreving = (props: { saksversjon: number; behandling: ManuellTilbakekrevingsbehandling }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const [avsluttTilbakekrevingStatus, avslutt] = useAsyncActionCreator(avsluttTilbakekreving);
    const form = useForm<AvsluttTilbakekrevingFormData>({
        defaultValues: {
            begrunnelse: '',
        },
        resolver: yupResolver(avsluttTilbakekrevingSchema()),
    });

    const avsluttTilbakekrevingSubmitHandler = (data: AvsluttTilbakekrevingFormData) => {
        avslutt(
            {
                versjon: props.saksversjon,
                sakId: props.behandling.sakId,
                behandlingId: props.behandling.id,
                begrunnelse: data.begrunnelse!,
            },
            () => {
                const message = formatMessage('avsluttTilbakekreving.behandlingHarBlittAvsluttet');
                return Routes.navigateToSakIntroWithMessage(navigate, message, props.behandling.sakId);
            },
        );
    };

    return (
        <form onSubmit={form.handleSubmit(avsluttTilbakekrevingSubmitHandler)}>
            <Heading className={styles.formHeading} size="small">
                {formatMessage('avsluttTilbakekreving.form.heading')}
            </Heading>

            <div className={styles.begrunnelseContainer}>
                <Controller
                    control={form.control}
                    name={'begrunnelse'}
                    render={({ field, fieldState }) => (
                        <Textarea
                            label={formatMessage('avsluttTilbakekreving.form.begrunnelse')}
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </div>
            {RemoteData.isFailure(avsluttTilbakekrevingStatus) && (
                <ApiErrorAlert className={styles.apiErrorAlert} error={avsluttTilbakekrevingStatus.error} />
            )}
            <AvsluttBehandlingBunnknapper
                sakId={props.behandling.sakId}
                submitButtonText={formatMessage('avsluttTilbakekreving.knapp.avsluttTilbakekreving')}
                isSubmitPending={RemoteData.isPending(avsluttTilbakekrevingStatus)}
            />
        </form>
    );
};

export default AvsluttTilbakekreving;
