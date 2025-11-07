import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup } from '@navikt/ds-react';
import { useEffect, useRef } from 'react';
import { Controller, UseFormTrigger, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { forhåndsvisVedtaksbrevTilbakekrevingsbehandling } from '~src/api/tilbakekrevingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import TextareaWithAutosave from '~src/components/inputs/textareaWithAutosave/TextareaWithAutosave';
import Navigasjonsknapper from '~src/components/navigasjonsknapper/Navigasjonsknapper';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import OppsummeringAvVurdering from '~src/components/oppsummering/oppsummeringAvTilbakekrevingsbehandling/vurdering/OppsummeringAvVurdering';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import {
    behandlingsnotatTilbakekreving,
    brevtekstTilbakekrevingsbehandling,
} from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { ManuellTilbakekrevingsbehandling, TilbakekrevingSteg } from '~src/types/ManuellTilbakekrevingsbehandling';

import messages from '../../Tilbakekreving-nb';

import styles from './BrevForTilbakekreving.module.less';
import { BrevForTilbakekrevingFormData, brevForTilbakekrevingSchema } from './BrevForTilbakekrevingUtils';

type HandleBrevtekstSave = { skalSendeBrev: boolean; brevtekst: Nullable<string> };
type HandleNotatSave = { notat: Nullable<string> };

const BrevForTilbakekreving = (props: {
    sakId: string;
    saksversjon: number;
    tilbakekreving: ManuellTilbakekrevingsbehandling;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const saksversjonRef = useRef(props.saksversjon);
    const [saveBrevtekstStatus, saveBrevtekst] = useAsyncActionCreator(brevtekstTilbakekrevingsbehandling);
    const [saveNotatStatus, saveNotat] = useAsyncActionCreator(behandlingsnotatTilbakekreving);
    const [forhåndsvisStatus, forhåndsvis] = useBrevForhåndsvisning(forhåndsvisVedtaksbrevTilbakekrevingsbehandling);

    const form = useForm<BrevForTilbakekrevingFormData>({
        resolver: yupResolver(brevForTilbakekrevingSchema),
        defaultValues: {
            skalSendeBrev: props.tilbakekreving.fritekst !== null,
            brevtekst: props.tilbakekreving.fritekst,
            notat: props.tilbakekreving.notat ?? '',
        },
    });

    useEffect(() => {
        saksversjonRef.current = props.saksversjon;
    }, [props.saksversjon]);

    const handleNotatSave = (data: HandleNotatSave, onSuccess: () => void) => {
        saveNotat(
            {
                sakId: props.sakId,
                versjon: saksversjonRef.current,
                behandlingId: props.tilbakekreving.id,
                notat: data.notat || null,
            },
            onSuccess,
        );
    };

    const handleBrevtekstSave = (data: HandleBrevtekstSave, onSuccess: () => void) => {
        return saveBrevtekst(
            {
                sakId: props.sakId,
                saksversjon: saksversjonRef.current,
                behandlingId: props.tilbakekreving.id,
                brevtekst: data.skalSendeBrev ? data.brevtekst : null,
            },
            onSuccess,
        );
    };

    const handleSave = (data: BrevForTilbakekrevingFormData, onSuccess: () => void) => {
        handleBrevtekstSave(data, () => handleNotatSave(data, () => onSuccess()));
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

    const handleNesteClick = (data: BrevForTilbakekrevingFormData) => {
        handleSave(data, () =>
            navigate(
                routes.tilbakekrevingValgtBehandling.createURL({
                    sakId: props.sakId,
                    behandlingId: props.tilbakekreving.id,
                    steg: TilbakekrevingSteg.Oppsummering,
                }),
            ),
        );
    };

    return (
        <ToKolonner tittel={formatMessage('brevForTilbakekreving.tittel')}>
            {{
                left: (
                    <form onSubmit={form.handleSubmit(handleNesteClick)}>
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
                        <div className={styles.textareaContainer}>
                            {form.watch('skalSendeBrev') && (
                                <TextareaWithAutosave
                                    textarea={{
                                        name: 'brevtekst',
                                        label: formatMessage('brevForTilbakekreving.fritekst.label'),
                                        control: form.control,
                                        value: form.watch('brevtekst') ?? '',
                                        description: [formatMessage('brevForTilbakekreving.fritekst.description')],
                                    }}
                                    save={{
                                        handleSave: () => {
                                            if (form.getValues('skalSendeBrev')) {
                                                handleBrevtekstSave(
                                                    {
                                                        skalSendeBrev: form.getValues('skalSendeBrev'),
                                                        brevtekst: form.getValues('brevtekst')!,
                                                    },
                                                    () => void 0,
                                                );
                                            }
                                        },
                                        status: saveBrevtekstStatus,
                                    }}
                                    brev={{
                                        handleSeBrev: () =>
                                            forhåndsvis({
                                                sakId: props.sakId,
                                                behandlingId: props.tilbakekreving.id,
                                            }),
                                        status: forhåndsvisStatus,
                                    }}
                                />
                            )}

                            <TextareaWithAutosave
                                textarea={{
                                    name: 'notat',
                                    label: formatMessage('brevForTilbakekreving.behandlingsnotat.label'),
                                    control: form.control,
                                    value: form.watch('notat') ?? '',
                                    description: [
                                        formatMessage('brevForTilbakekreving.behandlingsnotat.description.p1'),
                                        formatMessage('brevForTilbakekreving.behandlingsnotat.description.p2'),
                                    ],
                                }}
                                save={{
                                    handleSave: () =>
                                        handleNotatSave({ notat: form.getValues('notat') || null }, () => void 0),
                                    status: saveNotatStatus,
                                }}
                            />
                        </div>

                        <div>
                            <Feiloppsummering
                                tittel={formatMessage('vurderTilbakekreving.feiloppsummering')}
                                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                            />
                            {form.formState.isSubmitted &&
                                (() => {
                                    if (RemoteData.isFailure(saveBrevtekstStatus)) {
                                        return <ApiErrorAlert error={saveBrevtekstStatus.error} />;
                                    }
                                    if (RemoteData.isFailure(saveNotatStatus)) {
                                        return <ApiErrorAlert error={saveNotatStatus.error} />;
                                    }
                                    return null;
                                })()}
                            <Navigasjonsknapper
                                neste={{
                                    loading: form.formState.isSubmitting
                                        ? RemoteData.isPending(saveBrevtekstStatus) ||
                                          RemoteData.isPending(saveNotatStatus)
                                        : RemoteData.isPending(saveBrevtekstStatus),
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
                    <OppsummeringAvVurdering
                        vurderinger={props.tilbakekreving.vurderinger}
                        basic={{ medTittel: true }}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default BrevForTilbakekreving;
