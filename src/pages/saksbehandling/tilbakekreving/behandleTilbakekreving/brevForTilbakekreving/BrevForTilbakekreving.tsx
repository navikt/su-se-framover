import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Controller, UseFormTrigger, useForm } from 'react-hook-form';

import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import Navigasjonsknapper from '~src/components/navigasjonsknapper/Navigasjonsknapper';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
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
    const { formatMessage } = useI18n({ messages });

    const form = useForm<BrevForTilbakekrevingFormData>({
        resolver: yupResolver(brevForTilbakekrevingSchema),
        defaultValues: {
            fritekstTilBrev: props.tilbakekreving.fritekst,
        },
    });

    const handleLagreOgFortsettSenereClick = async (
        data: BrevForTilbakekrevingFormData,
        trigger: UseFormTrigger<BrevForTilbakekrevingFormData>,
    ) => {
        await trigger().then((isValid) => {
            if (isValid) {
                console.log('form is valid', data);
            } else {
                console.log('form not valid');
            }
        });
    };

    const handleSubmit = (data: BrevForTilbakekrevingFormData) => {
        console.log(data);
    };

    const onSeBrevClick = () => {
        console.log('onSeBrevClick');
    };

    /*
    const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi.hentBrevutkastForKlage);

    const onSeBrevClick = (data: VurderingAvKlageFormData) => {
        lagreVurderingAvKlage(lagOpprettholdApiBody(data), () => {
            hentBrev({ sakId: props.sakId, klageId: props.klage.id });
        });
    };
    */

    return (
        <ToKolonner tittel={formatMessage('brevForTilbakekreving.tittel')}>
            {{
                left: (
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <div className={styles.fritesktOgVisBrevContainer}>
                            <Controller
                                control={form.control}
                                name={'fritekstTilBrev'}
                                render={({ field, fieldState }) => (
                                    <Textarea
                                        {...field}
                                        minRows={5}
                                        label={formatMessage('brevForTilbakekreving.fritekst.label')}
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
                                neste={
                                    {
                                        //loading: RemoteData.isPending(status),
                                    }
                                }
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

                            {/* RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} /> */}
                        </div>
                    </form>
                ),
                right: <></>,
            }}
        </ToKolonner>
    );
};

export default BrevForTilbakekreving;
