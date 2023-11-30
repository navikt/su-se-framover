import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';
import { Controller, UseFormTrigger, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '~src/api/apiClient';
import { forhåndsvisVedtaksbrevTilbakekrevingsbehandling } from '~src/api/tilbakekrevingApi';
import TextareaWithAutosave from '~src/components/inputs/textareaWithAutosave/TextareaWithAutosave';
import Navigasjonsknapper from '~src/components/navigasjonsknapper/Navigasjonsknapper';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import OppsummeringAvKravgrunnlag from '~src/components/oppsummering/kravgrunnlag/OppsummeringAvKravgrunnlag';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { brevtekstTilbakekrevingsbehandling } from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { ManuellTilbakekrevingsbehandling, TilbakekrevingSteg } from '~src/types/ManuellTilbakekrevingsbehandling';

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
    const [saveStatus, save] = useAsyncActionCreator(brevtekstTilbakekrevingsbehandling);
    const [hentBrevStatus, setHentBrevStatus] = useState<RemoteData.RemoteData<ApiError, null>>(RemoteData.initial);

    const form = useForm<BrevForTilbakekrevingFormData>({
        resolver: yupResolver(brevForTilbakekrevingSchema),
        defaultValues: {
            skalSendeBrev: props.tilbakekreving.fritekst !== null,
            brevtekst: props.tilbakekreving.fritekst,
        },
    });

    useEffect(() => {
        saksversjonRef.current = props.saksversjon;
    }, [props.saksversjon]);

    const handleSave = (data: BrevForTilbakekrevingFormData, onSuccess: () => void) => {
        save(
            {
                sakId: props.sakId,
                saksversjon: saksversjonRef.current,
                behandlingId: props.tilbakekreving.id,
                brevtekst: data.skalSendeBrev ? data.brevtekst : null,
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
                handleSave(data, () => navigate(routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })));
            }
        });
    };

    const handleSubmit = (data: BrevForTilbakekrevingFormData) => {
        handleSave(data, () => {
            navigate(
                routes.tilbakekrevingValgtBehandling.createURL({
                    sakId: props.sakId,
                    behandlingId: props.tilbakekreving.id,
                    steg: TilbakekrevingSteg.Oppsummering,
                }),
            );
        });
    };

    const onSeBrevClick = async (data: BrevForTilbakekrevingFormData) => {
        handleSave(data, async () => {
            if (RemoteData.isPending(hentBrevStatus)) return;

            setHentBrevStatus(RemoteData.pending);

            const res = await forhåndsvisVedtaksbrevTilbakekrevingsbehandling({
                sakId: props.sakId,
                behandlingId: props.tilbakekreving.id,
            });

            if (res.status === 'ok') {
                setHentBrevStatus(RemoteData.success(null));
                window.open(URL.createObjectURL(res.data));
            } else {
                setHentBrevStatus(RemoteData.failure(res.error));
            }
        });
    };

    return (
        <ToKolonner tittel={formatMessage('brevForTilbakekreving.tittel')}>
            {{
                left: (
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <Controller
                            name={'skalSendeBrev'}
                            control={form.control}
                            render={({ field }) => (
                                <RadioGroup
                                    className={styles.radiougroup}
                                    legend={formatMessage('brevForTilbakekreving.skalSendeBrev')}
                                    {...field}
                                >
                                    <Radio value={true}>
                                        {formatMessage('brevForTilbakekreving.skalSendeBrev.ja')}
                                    </Radio>
                                    <Radio value={false}>
                                        {formatMessage('brevForTilbakekreving.skalSendeBrev.nei')}
                                    </Radio>
                                </RadioGroup>
                            )}
                        />
                        {form.watch('skalSendeBrev') && (
                            <TextareaWithAutosave
                                textarea={{
                                    name: 'brevtekst',
                                    label: formatMessage('brevForTilbakekreving.fritekst.label'),
                                    control: form.control,
                                    value: form.watch('brevtekst') ?? '',
                                }}
                                save={{
                                    handleSave: () =>
                                        handleSave(
                                            {
                                                skalSendeBrev: form.watch('skalSendeBrev'),
                                                brevtekst: form.watch('brevtekst') ?? '',
                                            },
                                            () => void 0,
                                        ),
                                    status: saveStatus,
                                }}
                                brev={{
                                    handleSeBrev: () => onSeBrevClick(form.getValues()),
                                    status: hentBrevStatus,
                                }}
                            />
                        )}

                        <div>
                            <Feiloppsummering
                                tittel={formatMessage('vurderTilbakekreving.feiloppsummering')}
                                className={styles.feiloppsummering}
                                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                            />
                            <Navigasjonsknapper
                                neste={{
                                    loading: RemoteData.isPending(saveStatus),
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
                        </div>
                    </form>
                ),
                right: (
                    <OppsummeringAvKravgrunnlag
                        kravgrunnlag={props.tilbakekreving.kravgrunnlag}
                        basicHeleKravgrunnlag={{
                            medTittel: true,
                        }}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default BrevForTilbakekreving;
