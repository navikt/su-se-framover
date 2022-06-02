import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Loader, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Control, Controller, useForm, UseFormWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import * as pdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { avsluttRevurdering } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { Revurdering } from '~src/types/Revurdering';
import { erForhåndsvarselSendtEllerBesluttet } from '~src/utils/revurdering/revurderingUtils';

import AvsluttBehandlingBunnknapper from '../avsluttBehandlingBunnknapper/AvsluttBehandlingBunnknapper';

import messages from './avsluttRevurdering-nb';
import * as styles from './avsluttRevurdering.module.less';

interface AvsluttRevurderingFormData {
    fritekst: Nullable<string>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<AvsluttRevurderingFormData>({
    fritekst: yup.string().nullable().defined(),
    begrunnelse: yup.string().required(),
});

const AvsluttRevurdering = (props: { sakId: string; revurdering: Revurdering }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const [avsluttRevurderingStatus, avsluttRevurderingAction] = useAsyncActionCreator(avsluttRevurdering);

    const { control, watch, handleSubmit } = useForm<AvsluttRevurderingFormData>({
        defaultValues: { fritekst: null },
        resolver: yupResolver(schema),
    });

    const avsluttRevurderingSubmitHandler = (data: AvsluttRevurderingFormData) => {
        avsluttRevurderingAction(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                begrunnelse: data.begrunnelse!,
                fritekst: data.fritekst,
            },
            () => {
                const message = formatMessage('avslutt.revurderingHarBlittAvsluttet');
                return navigate(Routes.createSakIntroLocation(message, props.sakId));
            }
        );
    };

    return (
        <form onSubmit={handleSubmit(avsluttRevurderingSubmitHandler)}>
            {erForhåndsvarselSendtEllerBesluttet(props.revurdering) && (
                <ForhåndsvarsletRevurderingForm
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    formController={control}
                    watch={watch}
                />
            )}
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

            {RemoteData.isFailure(avsluttRevurderingStatus) && <ApiErrorAlert error={avsluttRevurderingStatus.error} />}

            <AvsluttBehandlingBunnknapper
                sakId={props.sakId}
                submitButtonText={formatMessage('knapp.avsluttRevurdering')}
                isSubmitPending={RemoteData.isPending(avsluttRevurderingStatus)}
            />
        </form>
    );
};

const ForhåndsvarsletRevurderingForm = (props: {
    sakId: string;
    revurderingId: string;
    formController: Control<AvsluttRevurderingFormData>;
    watch: UseFormWatch<AvsluttRevurderingFormData>;
}) => {
    const { formatMessage } = useI18n({ messages });

    const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi.fetchBrevutkastForAvslutningAvRevurdering);

    return (
        <div className={styles.revurderingForhåndsvarsletContainer}>
            <Alert variant="info">{formatMessage('alert.revurderingErForhåndsvarslet')}</Alert>
            <div>
                <Controller
                    control={props.formController}
                    name={'fritekst'}
                    render={({ field, fieldState }) => (
                        <Textarea
                            {...field}
                            label={formatMessage('form.fritekst.label')}
                            value={field.value ?? ''}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </div>
            <Button
                type="button"
                variant="secondary"
                onClick={() =>
                    hentBrev({
                        sakId: props.sakId,
                        revurderingId: props.revurderingId,
                        fritekst: props.watch('fritekst'),
                    })
                }
            >
                {formatMessage('knapp.seBrev')}
                {RemoteData.isPending(brevStatus) && <Loader />}
            </Button>
            {RemoteData.isFailure(brevStatus) && <ApiErrorAlert error={brevStatus.error} />}
        </div>
    );
};

export default AvsluttRevurdering;
