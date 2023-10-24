import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Loader, Textarea } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { Controller, UseFormTrigger, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ErrorIcon, SuccessIcon } from '~src/assets/Icons';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import Navigasjonsknapper from '~src/components/navigasjonsknapper/Navigasjonsknapper';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import {
    brevtekstTilbakekrevingsbehandling,
    sendTilbakekrevingTilAttestering,
} from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator, useAutosaveOnChange } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { TilbakekrevingSteg } from '~src/pages/saksbehandling/types';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';

import messages from '../../Tilbakekreving-nb';

import styles from './BrevForTilbakekreving.module.less';
import { BrevForTilbakekrevingFormData, brevForTilbakekrevingSchema } from './BrevForTilbakekrevingUtils';

const BrevForTilbakekreving = (props: {
    sakId: string;
    saksversjon: number;
    tilbakekreving: ManuellTilbakekrevingsbehandling;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const saksversjonRef = React.useRef(props.saksversjon);
    const [autosaveStatus, autosave] = useAsyncActionCreator(brevtekstTilbakekrevingsbehandling);
    const [sendTilAttesteringStatus, sendTilAttestering] = useAsyncActionCreator(sendTilbakekrevingTilAttestering);

    const form = useForm<BrevForTilbakekrevingFormData>({
        resolver: yupResolver(brevForTilbakekrevingSchema),
        defaultValues: {
            brevtekst: props.tilbakekreving.fritekst,
        },
    });

    useEffect(() => {
        saksversjonRef.current = props.saksversjon;
    }, [props.saksversjon]);

    const save = (data: BrevForTilbakekrevingFormData, onSuccess: () => void) => {
        autosave(
            {
                sakId: props.sakId,
                saksversjon: saksversjonRef.current,
                behandlingId: props.tilbakekreving.id,
                brevtekst: data.brevtekst!,
            },
            onSuccess,
        );
    };

    const handleLagreOgFortsettSenereClick = async (
        data: BrevForTilbakekrevingFormData,
        trigger: UseFormTrigger<BrevForTilbakekrevingFormData>,
    ) => {
        await trigger().then((isValid) => {
            if (isValid) {
                save(data, () => navigate(routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })));
            }
        });
    };

    const handleSubmit = (data: BrevForTilbakekrevingFormData) => {
        save(data, () => {
            sendTilAttestering(
                {
                    versjon: saksversjonRef.current,
                    sakId: props.sakId,
                    behandlingId: props.tilbakekreving.id,
                },
                () => {
                    routes.navigateToSakIntroWithMessage(
                        navigate,
                        formatMessage('brevForTilbakekreving.sendtTilAttestering'),
                        props.sakId,
                    );
                },
            );
        });
    };

    const onSeBrevClick = () => {
        console.log('onSeBrevClick');
    };

    const { isSaving } = useAutosaveOnChange(form.watch('brevtekst'), () => {
        save({ brevtekst: form.watch('brevtekst') ?? '' }, () => void 0);
    });

    return (
        <ToKolonner tittel={formatMessage('brevForTilbakekreving.tittel')}>
            {{
                left: (
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <div className={styles.fritesktOgVisBrevContainer}>
                            <Controller
                                control={form.control}
                                name={'brevtekst'}
                                render={({ field, fieldState }) => (
                                    <Textarea
                                        {...field}
                                        minRows={5}
                                        label={
                                            <div className={styles.textareaLabel}>
                                                {formatMessage('brevForTilbakekreving.fritekst.label')}
                                                <div className="lol">
                                                    {isSaving ? <Loader size="small" /> : null}
                                                    {!isSaving && RemoteData.isSuccess(autosaveStatus) ? (
                                                        <SuccessIcon width={20} />
                                                    ) : null}
                                                    {!isSaving && RemoteData.isFailure(autosaveStatus) ? (
                                                        <ErrorIcon width={20} />
                                                    ) : null}
                                                </div>
                                            </div>
                                        }
                                        value={field.value ?? ''}
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />
                            <Button
                                type="button"
                                className={styles.seBrevButton}
                                variant="secondary"
                                //loading={RemoteData.isPending(brevStatus)}
                                onClick={onSeBrevClick}
                            >
                                {formatMessage('knapp.seBrev')}
                            </Button>
                            {/* RemoteData.isFailure(brevStatus) && <ApiErrorAlert error={brevStatus.error} /> */}
                        </div>
                        <div>
                            <Feiloppsummering
                                tittel={formatMessage('vurderTilbakekreving.feiloppsummering')}
                                className={styles.feiloppsummering}
                                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                            />
                            <Navigasjonsknapper
                                neste={{
                                    loading: RemoteData.isPending(sendTilAttesteringStatus),
                                }}
                                fortsettSenere={{
                                    onClick: () => handleLagreOgFortsettSenereClick(form.getValues(), form.trigger),
                                }}
                                tilbake={{
                                    url: routes.tilbakekrevingValgtBehandling.createURL({
                                        sakId: props.sakId,
                                        behandlingId: props.tilbakekreving.id,
                                        steg: TilbakekrevingSteg.Vurdering,
                                    }),
                                }}
                            />

                            {RemoteData.isFailure(sendTilAttesteringStatus) && (
                                <ApiErrorAlert error={sendTilAttesteringStatus.error} />
                            )}
                        </div>
                    </form>
                ),
                right: <></>,
            }}
        </ToKolonner>
    );
};

export default BrevForTilbakekreving;
