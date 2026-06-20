import * as RemoteData from '@devexperts/remote-data-ts';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { FritekstTyper, hentFritekst, redigerFritekst } from '~src/api/fritekstApi.ts';
import { LagreMottakerRequest } from '~src/api/mottakerClient.ts';
import { forhåndsvisForhåndsvarsel, visUtsendtForhåndsvarsel } from '~src/api/tilbakekrevingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import TextareaWithAutosave from '~src/components/inputs/textareaWithAutosave/TextareaWithAutosave.tsx';
import Navigasjonsknapper from '~src/components/navigasjonsknapper/Navigasjonsknapper';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import OppsummeringAvKravgrunnlag from '~src/components/oppsummering/kravgrunnlag/OppsummeringAvKravgrunnlag';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as TilbakekrevingActions from '~src/features/TilbakekrevingActions';
import { useApiCall, useAsyncActionCreator, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types.ts';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { MottakerForm } from '~src/pages/saksbehandling/mottaker/Mottaker.tsx';
import {
    ForhåndsvarselsInfo,
    ManuellTilbakekrevingsbehandling,
    TilbakekrevingSteg,
} from '~src/types/ManuellTilbakekrevingsbehandling';
import { formatDateTime } from '~src/utils/date/dateUtils';
import messages from '../../Tilbakekreving-nb';
import styles from './ForhåndsvarsleTilbakekreving.module.less';
import {
    ForhåndsvarsleTilbakekrevingFormData,
    forhåndsvarsleTilbakekrevingFormSchema,
} from './ForhåndsvarsleTilbakekrevingUtils';

type HandleRedigertForhåndsvarsel = { fritekst: Nullable<string> };

const ForhåndsvarsleTilbakekreving = (props: {
    sakId: string;
    saksversjon: number;
    tilbakekreving: ManuellTilbakekrevingsbehandling;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [lagreForhåndsvarselStatus, lagreForhåndsvarsel] = useAsyncActionCreator(
        TilbakekrevingActions.sendForhåndsvarsel,
    );

    const form = useForm<ForhåndsvarsleTilbakekrevingFormData>({
        defaultValues: {
            skalForhåndsvarsle: false,
            fritekst: '',
        },
        resolver: yupResolver(forhåndsvarsleTilbakekrevingFormSchema),
    });

    useEffect(() => {
        hentFritekst({
            referanseId: props.tilbakekreving.id,
            sakId: props.sakId,
            type: FritekstTyper.FORHÅNDSVARSEL_TILBAKEKREVING,
        }).then((res) => {
            if (res.status === 'ok') {
                form.reset({
                    skalForhåndsvarsle: true,
                    fritekst: res.data.fritekst,
                });
            }
        });
    }, []);

    const handleSubmit = (data: ForhåndsvarsleTilbakekrevingFormData) => {
        if (!data.skalForhåndsvarsle) {
            navigate(
                Routes.tilbakekrevingValgtBehandling.createURL({
                    sakId: props.sakId,
                    behandlingId: props.tilbakekreving.id,
                    steg: TilbakekrevingSteg.Vurdering,
                }),
            );
            return;
        }
        const dødsbo = visDødsbo ? dødsboForm.getValues() : null;
        if (dødsbo && !validateDødsbo(dødsbo)) return;

        lagreForhåndsvarsel(
            {
                sakId: props.sakId,
                saksversjon: props.saksversjon,
                behandlingId: props.tilbakekreving.id,
                fritekst: data.fritekst,
                dødsbo: dødsbo,
            },
            () => {
                navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            },
        );
    };

    const [forhåndsvisStatus, forhåndsvis] = useBrevForhåndsvisning(forhåndsvisForhåndsvarsel);
    const [redigertForhåndsvarselStatus, saveRedigerForhåndsvarsel] = useApiCall(redigerFritekst);

    const handleRedigertForhåndsvarsel = (data: HandleRedigertForhåndsvarsel, onSuccess: () => void) => {
        return saveRedigerForhåndsvarsel(
            {
                referanseId: props.tilbakekreving.id,
                sakId: props.sakId,
                type: FritekstTyper.FORHÅNDSVARSEL_TILBAKEKREVING,
                fritekst: data.fritekst ?? '',
            },
            onSuccess,
        );
    };

    const [visDødsbo, setVisDødsbo] = useState(false);
    const referanseType = 'DØDSBO_TILBAKEKREVING';
    const brevtype = 'FORHANDSVARSEL';

    // referanseId skal bli hendelseId, men den blir til først i backend
    const emptyFormValues: LagreMottakerRequest = {
        navn: '',
        foedselsnummer: '',
        orgnummer: '',
        adresse: {
            adresselinje1: '',
            adresselinje2: '',
            adresselinje3: '',
            postnummer: '',
            poststed: '',
        },
        referanseType: 'DØDSBO_TILBAKEKREVING',
        brevtype: 'FORHANDSVARSEL',
        referanseId: '',
    };

    const dødsboForm = useForm<LagreMottakerRequest>({
        defaultValues: emptyFormValues,
    });

    const validateDødsbo = (dødsbo: LagreMottakerRequest): boolean => {
        dødsboForm.clearErrors();
        let isValid = true;

        const harFnr = Boolean(dødsbo.foedselsnummer?.trim());
        const harOrgnr = Boolean(dødsbo.orgnummer?.trim());

        if (harFnr && harOrgnr) {
            dødsboForm.setError('foedselsnummer', {
                message: 'Kan ikke ha både fødselsnummer og organisasjonsnummer.',
            });
            dødsboForm.setError('orgnummer', {
                message: 'Kan ikke ha både fødselsnummer og organisasjonsnummer.',
            });
            isValid = false;
        } else if (!harFnr && !harOrgnr) {
            dødsboForm.setError('foedselsnummer', {
                message: 'Du må fylle ut enten fødselsnummer eller organisasjonsnummer.',
            });
            dødsboForm.setError('orgnummer', {
                message: 'Du må fylle ut enten fødselsnummer eller organisasjonsnummer.',
            });
            isValid = false;
        }

        if (!dødsbo.navn.trim()) {
            dødsboForm.setError('navn', { message: 'Navn er påkrevd.' });
            isValid = false;
        }
        if (!dødsbo.adresse.adresselinje1.trim()) {
            dødsboForm.setError('adresse.adresselinje1', { message: 'Adresselinje 1 er påkrevd.' });
            isValid = false;
        }
        if (!dødsbo.adresse.postnummer.trim()) {
            dødsboForm.setError('adresse.postnummer', { message: 'Postnummer er påkrevd.' });
            isValid = false;
        }
        if (!dødsbo.adresse.poststed.trim()) {
            dødsboForm.setError('adresse.poststed', { message: 'Poststed er påkrevd.' });
            isValid = false;
        }

        return isValid;
    };

    return (
        <ToKolonner tittel={formatMessage('forhåndsvarsleTilbakekreving.tittel')}>
            {{
                left: (
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <Controller
                            name={'skalForhåndsvarsle'}
                            control={form.control}
                            render={({ field }) => (
                                <RadioGroup
                                    legend={formatMessage('forhåndsvarsleTilbakekreving.skalForhåndsvarsle')}
                                    {...field}
                                >
                                    <Radio value={true}>
                                        {formatMessage('forhåndsvarsleTilbakekreving.skalForhåndsvarsle.ja')}
                                    </Radio>
                                    <Radio value={false}>
                                        {formatMessage('forhåndsvarsleTilbakekreving.skalForhåndsvarsle.nei')}
                                    </Radio>
                                </RadioGroup>
                            )}
                        />

                        {form.watch('skalForhåndsvarsle') && (
                            <TextareaWithAutosave
                                textarea={{
                                    name: 'fritekst',
                                    label: formatMessage('forhåndsvarsleTilbakekreving.fritekst.label'),
                                    control: form.control,
                                    value: form.watch('fritekst') ?? '',
                                    description: [formatMessage('brevForTilbakekreving.fritekst.description')],
                                }}
                                save={{
                                    handleSave: () => {
                                        if (form.getValues('skalForhåndsvarsle')) {
                                            handleRedigertForhåndsvarsel(
                                                {
                                                    fritekst: form.getValues('fritekst')!,
                                                },
                                                () => void 0,
                                            );
                                        }
                                    },
                                    status: redigertForhåndsvarselStatus,
                                }}
                                brev={{
                                    handleSeBrev: () =>
                                        forhåndsvis({
                                            sakId: props.sakId,
                                            behandlingId: props.tilbakekreving.id,
                                            saksversjon: props.saksversjon,
                                            brevtekst: form.getValues('fritekst'),
                                        }),
                                    status: forhåndsvisStatus,
                                }}
                            />
                        )}

                        {form.watch('skalForhåndsvarsle') && (
                            <div>
                                {!visDødsbo ? (
                                    <Button variant="secondary" type="button" onClick={() => setVisDødsbo(true)}>
                                        legg til dødsbo
                                    </Button>
                                ) : (
                                    <MottakerForm
                                        sakId={props.sakId}
                                        referanseId={''}
                                        referanseType={referanseType}
                                        brevtype={brevtype}
                                        onClose={() => setVisDødsbo(false)}
                                        form={dødsboForm}
                                        kunForm={true}
                                    />
                                )}
                            </div>
                        )}

                        <div>
                            <Feiloppsummering
                                tittel={formatMessage('vurderTilbakekreving.feiloppsummering')}
                                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                            />
                            <Navigasjonsknapper
                                neste={{
                                    tekst: form.watch('skalForhåndsvarsle')
                                        ? formatMessage('forhåndsvarsleTilbakekreving.navigering.sendOgFortsett')
                                        : undefined,
                                    disabled:
                                        props.tilbakekreving.kravgrunnlag == null && !form.watch('skalForhåndsvarsle'),
                                }}
                                fortsettSenere={{
                                    tekst: formatMessage('forhåndsvarsleTilbakekreving.navigering.fortsettSenere'),
                                    onClick: () =>
                                        navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                                }}
                                tilbake={{
                                    url: Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }),
                                }}
                            />

                            {RemoteData.isFailure(lagreForhåndsvarselStatus) && (
                                <ApiErrorAlert error={lagreForhåndsvarselStatus.error} />
                            )}
                        </div>
                    </form>
                ),
                right: (
                    <div className={styles.right}>
                        <OppsummeringAvKravgrunnlag
                            kravgrunnlag={props.tilbakekreving.kravgrunnlag}
                            basicHeleKravgrunnlag={{
                                medTittel: true,
                            }}
                        />
                        <hr />
                        {props.tilbakekreving.forhåndsvarselsInfo.length > 0 && (
                            <div>
                                <Heading size="medium">
                                    {formatMessage('forhåndsvarsleTilbakekreving.tidligereSendtForhåndsvarsel.tittel')}
                                </Heading>
                                {props.tilbakekreving.forhåndsvarselsInfo.map((forhåndsvarselInfo) => (
                                    <TidligereSendtForhåndsvarsler
                                        key={forhåndsvarselInfo.id}
                                        sakId={props.sakId}
                                        behandlingId={props.tilbakekreving.id}
                                        forhåndsvarselInfo={forhåndsvarselInfo}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export const TidligereSendtForhåndsvarsler = (props: {
    sakId: string;
    behandlingId: string;
    forhåndsvarselInfo: ForhåndsvarselsInfo;
}) => {
    const { formatMessage } = useI18n({ messages });
    const [visForhåndsvarselStatus, visForhåndsvarsel] = useApiCall(visUtsendtForhåndsvarsel);
    return (
        <div>
            <Button
                variant="tertiary"
                size="small"
                type="button"
                loading={RemoteData.isPending(visForhåndsvarselStatus)}
                onClick={() =>
                    visForhåndsvarsel(
                        {
                            sakId: props.sakId,
                            behandlingId: props.behandlingId,
                            dokumentId: props.forhåndsvarselInfo.id,
                        },
                        (res) => {
                            window.open(URL.createObjectURL(res));
                        },
                    )
                }
            >
                {formatMessage('forhåndsvarsleTilbakekreving.tidligereSendtForhåndsvarsel.knapp.seForhåndsvarsel')}{' '}
                {formatDateTime(props.forhåndsvarselInfo.hendelsestidspunkt)}
            </Button>
            {RemoteData.isFailure(visForhåndsvarselStatus) && <ApiErrorAlert error={visForhåndsvarselStatus.error} />}
        </div>
    );
};

export default ForhåndsvarsleTilbakekreving;
