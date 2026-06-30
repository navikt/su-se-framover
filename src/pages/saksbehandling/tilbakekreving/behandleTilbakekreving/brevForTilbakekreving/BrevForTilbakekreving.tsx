import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Radio, RadioGroup } from '@navikt/ds-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, UseFormTrigger, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FritekstTyper, hentFritekst } from '~src/api/fritekstApi.ts';
import { hentMottaker, LagreMottakerRequest } from '~src/api/mottakerClient.ts';
import { forhåndsvisVedtaksbrevTilbakekrevingsbehandling } from '~src/api/tilbakekrevingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import TextareaWithAutosave from '~src/components/inputs/textareaWithAutosave/TextareaWithAutosave';
import { MottakerAlert, toMottakerAlert } from '~src/components/mottaker/mottakerUtils.ts';
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
import DødsboPage from '~src/pages/saksbehandling/mottaker/Dødsbo.tsx';
import { Mottaker } from '~src/pages/saksbehandling/mottaker/Mottaker.tsx';
import { ManuellTilbakekrevingsbehandling, TilbakekrevingSteg } from '~src/types/ManuellTilbakekrevingsbehandling';
import { KontaktInfoDødsbo, Kontaktinformasjon } from '~src/types/Person';
import messages from '../../Tilbakekreving-nb';
import styles from './BrevForTilbakekreving.module.less';
import { BrevForTilbakekrevingFormData, brevForTilbakekrevingSchema } from './BrevForTilbakekrevingUtils';

type HandleBrevtekstSave = { skalSendeBrev: boolean; fritekst: Nullable<string> };
type HandleNotatSave = { notat: Nullable<string> };

const mapDødsboKontaktTilMottaker = (
    kontakt: Kontaktinformasjon,
    adresse: KontaktInfoDødsbo,
): Partial<LagreMottakerRequest> => ({
    navn:
        kontakt.organisasjonsnavn ?? [kontakt.fornavn, kontakt.mellomnavn, kontakt.etternavn].filter(Boolean).join(' '),
    foedselsnummer: kontakt.identifikasjonsnummer ?? '',
    orgnummer: kontakt.organisasjonsnummer ?? '',
    adresse: {
        adresselinje1: adresse.adresselinje1 ?? '',
        adresselinje2: adresse.adresselinje2 ?? '',
        adresselinje3: '',
        postnummer: adresse.postnummer ?? '',
        poststed: adresse.poststedsnavn ?? '',
    },
});

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
            fritekst: props.tilbakekreving.fritekst,
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
        if (visDødsbo && !harDødsbo) {
            return;
        }
        return saveBrevtekst(
            {
                sakId: props.sakId,
                saksversjon: saksversjonRef.current,
                behandlingId: props.tilbakekreving.id,
                brevtekst: data.skalSendeBrev ? data.fritekst : null,
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

    const skalSendeBrev = useWatch({
        control: form.control,
        name: 'skalSendeBrev',
    });
    const fritekst =
        useWatch({
            control: form.control,
            name: 'fritekst',
        }) ?? '';

    useEffect(() => {
        if (!skalSendeBrev) return;
        const referanseId = props.tilbakekreving.id;
        if (!referanseId) return;

        hentFritekst({
            referanseId,
            sakId: props.sakId,
            type: FritekstTyper.VEDTAKSBREV_TILBAKEKREVING,
        }).then((res) => {
            if (res.status === 'ok' && res.data) {
                form.resetField('fritekst', { defaultValue: res.data.fritekst ?? '' });
                return;
            }
            form.setError('fritekst', { message: 'Kunne ikke hente fritekst' });
        });
    }, [skalSendeBrev, props.tilbakekreving.id, props.sakId]);

    const [harDødsbo, setHarDødsbo] = useState(false);
    const [mottakerFetchError, setMottakerFetchError] = useState<MottakerAlert | null>(null);
    const [visDødsbo, setVisDødsbo] = useState(false);
    const [prefillMottaker, setPrefillMottaker] = useState<Partial<LagreMottakerRequest> | undefined>(undefined);
    const referanseType = 'DØDSBO_TILBAKEKREVING';
    const brevtype = 'VEDTAK';
    const referanseId = props.tilbakekreving.id;

    useEffect(() => {
        const sjekkMottaker = async () => {
            const res = await hentMottaker(props.sakId, referanseType, referanseId, brevtype);
            if (res.status === 'ok') {
                if (res.data) {
                    setHarDødsbo(true);
                }
                return;
            } else {
                if (res.error.statusCode) {
                    setMottakerFetchError(toMottakerAlert(res.error, 'Kan ikke hente mottaker'));
                }
            }
        };
        sjekkMottaker();
    }, []);

    const handleBrukDødsboKontaktSomMottaker = (kontakt: Kontaktinformasjon, adresse: KontaktInfoDødsbo) => {
        setPrefillMottaker(mapDødsboKontaktTilMottaker(kontakt, adresse));
        setVisDødsbo(true);
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
                            {skalSendeBrev && (
                                <TextareaWithAutosave
                                    textarea={{
                                        name: 'fritekst',
                                        label: formatMessage('brevForTilbakekreving.fritekst.label'),
                                        control: form.control,
                                        value: fritekst,
                                        description: [formatMessage('brevForTilbakekreving.fritekst.description')],
                                    }}
                                    save={{
                                        handleSave: () => {
                                            if (!skalSendeBrev) return;

                                            const { isDirty } = form.getFieldState('fritekst');
                                            if (!isDirty) return;
                                            handleBrevtekstSave(
                                                {
                                                    skalSendeBrev,
                                                    fritekst: form.getValues('fritekst'),
                                                },
                                                () => {
                                                    form.resetField('fritekst', {
                                                        defaultValue: form.getValues('fritekst'),
                                                    });
                                                },
                                            );
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

                            {skalSendeBrev && (
                                <div>
                                    <DødsboPage onVelgKontakt={handleBrukDødsboKontaktSomMottaker} />
                                    {!visDødsbo && (
                                        <Button
                                            variant="secondary"
                                            type="button"
                                            onClick={() => {
                                                setPrefillMottaker(undefined);
                                                setVisDødsbo(true);
                                            }}
                                        >
                                            {harDødsbo ? 'Vis dødsbo' : 'Legg til dødsbo'}
                                        </Button>
                                    )}

                                    {visDødsbo && (
                                        <>
                                            <Mottaker
                                                sakId={props.sakId}
                                                referanseId={referanseId}
                                                referanseType={referanseType}
                                                brevtype={brevtype}
                                                initialValues={prefillMottaker}
                                                onClose={() => {
                                                    setPrefillMottaker(undefined);
                                                    setVisDødsbo(false);
                                                }}
                                                onDelete={() => setHarDødsbo(false)}
                                            />

                                            {mottakerFetchError && (
                                                <Alert variant={mottakerFetchError.variant} size="small">
                                                    {mottakerFetchError.text}
                                                </Alert>
                                            )}
                                        </>
                                    )}
                                </div>
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
