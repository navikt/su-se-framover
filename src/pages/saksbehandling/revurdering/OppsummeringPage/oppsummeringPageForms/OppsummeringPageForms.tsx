import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Checkbox, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import * as pdfApi from '~api/pdfApi';
import { Revurderingshandling } from '~api/revurderingApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { BrevInput, BrevInputProps } from '~components/brevInput/BrevInput';
import { ApiResult } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { BeslutningEtterForhåndsvarsling } from '~types/Revurdering';

import { RevurderingBunnknapper } from '../../bunnknapper/RevurderingBunnknapper';

import messages from './oppsummeringPageForms-nb';
import styles from './oppsummeringPageForms.module.less';

const VedtaksbrevInput = (
    props: { sakId: string; revurderingId: string } & Omit<BrevInputProps, 'tittel' | 'placeholder' | 'onVisBrevClick'>
) => {
    const { intl } = useI18n({ messages });

    return (
        <BrevInput
            tittel={intl.formatMessage({ id: 'brevInput.tekstTilVedtaksbrev.tittel' })}
            placeholder={intl.formatMessage({
                id: 'brevInput.tekstTilVedtaksbrev.placeholder',
            })}
            onVisBrevClick={() =>
                pdfApi.fetchBrevutkastForRevurderingWithFritekst({
                    sakId: props.sakId,
                    revurderingId: props.revurderingId,
                    fritekst: props.tekst,
                })
            }
            {...props}
        />
    );
};

const ForhåndsvarselbrevInput = (
    props: { sakId: string; revurderingId: string } & Omit<BrevInputProps, 'tittel' | 'placeholder' | 'onVisBrevClick'>
) => {
    const { intl } = useI18n({ messages });

    return (
        <BrevInput
            tittel={intl.formatMessage({ id: 'brevInput.tekstTilForhåndsvarsel.tittel' })}
            placeholder={intl.formatMessage({
                id: 'brevInput.tekstTilForhåndsvarsel.placeholder',
            })}
            onVisBrevClick={() =>
                pdfApi.fetchBrevutkastForForhåndsvarsel(props.sakId, props.revurderingId, props.tekst)
            }
            {...props}
        />
    );
};

const BeslutningEtterForhåndsvarselRadios = (props: {
    feil?: string;
    onChange(beslutning: BeslutningEtterForhåndsvarsling): void;
}) => {
    const { intl } = useI18n({ messages });
    const name = 'beslutningEtterForhåndsvarsel';
    return (
        <RadioGruppe
            legend={intl.formatMessage({ id: 'etterForhåndsvarsel.legend.resultatEtterForhåndsvarsel' })}
            feil={props.feil}
            className={styles.resultatEtterForhåndsvarselContainer}
        >
            <Radio
                label={intl.formatMessage({
                    id: 'etterForhåndsvarsel.radio.sammeOpplysninger',
                })}
                name={name}
                onChange={() => props.onChange(BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger)}
            />
            <Radio
                label={intl.formatMessage({
                    id: 'etterForhåndsvarsel.radio.andreOpplysninger',
                })}
                name={name}
                onChange={() => props.onChange(BeslutningEtterForhåndsvarsling.FortsettMedAndreOpplysninger)}
            />
            <Radio
                label={intl.formatMessage({
                    id: 'etterForhåndsvarsel.radio.avsluttesUtenEndring',
                })}
                name={name}
                onChange={() => props.onChange(BeslutningEtterForhåndsvarsling.AvsluttUtenEndringer)}
                disabled={true}
            />
        </RadioGruppe>
    );
};

export const ResultatEtterForhåndsvarselform = (props: {
    sakId: string;
    revurderingId: string;
    forrigeUrl: string;
    submitStatus: ApiResult<unknown>;
    onSubmit(args: {
        resultatEtterForhåndsvarsel: BeslutningEtterForhåndsvarsling;
        tekstTilVedtaksbrev: string;
        begrunnelse: string;
    }): void;
}) => {
    const { intl } = useI18n({ messages });

    interface FormData {
        resultatEtterForhåndsvarsel: Nullable<BeslutningEtterForhåndsvarsling>;
        tekstTilVedtaksbrev: string;
        begrunnelse: string;
    }

    const form = useForm<FormData>({
        defaultValues: {
            resultatEtterForhåndsvarsel: null,
            tekstTilVedtaksbrev: '',
            begrunnelse: '',
        },
        resolver: yupResolver(
            yup.object<FormData>({
                resultatEtterForhåndsvarsel: yup
                    .mixed()
                    .oneOf(Object.values(BeslutningEtterForhåndsvarsling), 'Feltet må fylles ut')
                    .required(),
                tekstTilVedtaksbrev: yup.string(),
                begrunnelse: yup.string(),
            })
        ),
    });
    const resultatEtterForhåndsvarsel = form.watch('resultatEtterForhåndsvarsel');
    return (
        <form
            onSubmit={form.handleSubmit((values) =>
                props.onSubmit({
                    begrunnelse: values.begrunnelse,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    resultatEtterForhåndsvarsel: values.resultatEtterForhåndsvarsel!,
                    tekstTilVedtaksbrev: values.tekstTilVedtaksbrev,
                })
            )}
            className={styles.form}
        >
            <Controller
                control={form.control}
                name="resultatEtterForhåndsvarsel"
                render={({ field, fieldState }) => (
                    <BeslutningEtterForhåndsvarselRadios feil={fieldState.error?.message} onChange={field.onChange} />
                )}
            />
            <Controller
                control={form.control}
                name="begrunnelse"
                render={({ field }) => (
                    <div className={styles.etterForhåndsvarselBegrunnelseContainer}>
                        <Textarea
                            label={intl.formatMessage({ id: 'etterForhåndsvarsel.begrunnelse.label' })}
                            {...field}
                        />
                    </div>
                )}
            />
            {(resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger ||
                resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.AvsluttUtenEndringer) && (
                <Controller
                    control={form.control}
                    name="tekstTilVedtaksbrev"
                    render={({ field, fieldState }) => (
                        <VedtaksbrevInput
                            sakId={props.sakId}
                            revurderingId={props.revurderingId}
                            tekst={field.value}
                            feil={fieldState.error}
                            onChange={field.onChange}
                            intl={intl}
                        />
                    )}
                />
            )}
            {RemoteData.isFailure(props.submitStatus) && <ApiErrorAlert error={props.submitStatus.error} />}
            <RevurderingBunnknapper
                onNesteClick="submit"
                nesteKnappTekst={
                    resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.FortsettMedAndreOpplysninger
                        ? intl.formatMessage({ id: 'fortsett.button.label' })
                        : intl.formatMessage({ id: 'sendTilAttestering.button.label' })
                }
                onNesteClickSpinner={RemoteData.isPending(props.submitStatus)}
            />
        </form>
    );
};

export const VelgForhåndsvarselForm = (props: {
    sakId: string;
    revurderingId: string;
    forrigeUrl: string;
    submitStatus: ApiResult<unknown>;
    onSubmit(args: { revurderingshandling: Revurderingshandling; fritekstTilBrev: string }): void;
}) => {
    interface FormData {
        revurderingshandling: Nullable<Revurderingshandling>;
        fritekstTilBrev: Nullable<string>;
    }

    const { intl } = useI18n({ messages });

    const form = useForm<FormData>({
        defaultValues: {
            revurderingshandling: null,
            fritekstTilBrev: null,
        },
        resolver: yupResolver(
            yup.object<FormData>({
                revurderingshandling: yup.mixed().required().defined().oneOf(Object.values(Revurderingshandling)),
                fritekstTilBrev: yup.string().nullable().required(),
            })
        ),
    });

    const revurderingshandling = form.watch('revurderingshandling');

    return (
        <form
            onSubmit={form.handleSubmit((values) =>
                props.onSubmit({
                    fritekstTilBrev: values.fritekstTilBrev ?? '',
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    revurderingshandling: values.revurderingshandling!,
                })
            )}
            className={styles.form}
        >
            <Controller
                control={form.control}
                name="revurderingshandling"
                render={({ field, fieldState }) => (
                    <RadioGruppe
                        legend={intl.formatMessage({ id: 'velgForhåndsvarsel.handling.legend' })}
                        feil={fieldState.error?.message}
                    >
                        <Radio
                            label={intl.formatMessage({ id: 'ja' })}
                            name="revurderingshandling"
                            onChange={() => field.onChange(Revurderingshandling.Forhåndsvarsle)}
                        />
                        <Radio
                            label={intl.formatMessage({ id: 'nei' })}
                            name="revurderingshandling"
                            onChange={() => field.onChange(Revurderingshandling.SendTilAttestering)}
                        />
                    </RadioGruppe>
                )}
            />
            {revurderingshandling !== null && (
                <Controller
                    control={form.control}
                    name="fritekstTilBrev"
                    render={({ field, fieldState }) =>
                        revurderingshandling === Revurderingshandling.Forhåndsvarsle ? (
                            <ForhåndsvarselbrevInput
                                sakId={props.sakId}
                                revurderingId={props.revurderingId}
                                tekst={field.value ?? ''}
                                onChange={field.onChange}
                                feil={fieldState.error}
                                intl={intl}
                            />
                        ) : (
                            <VedtaksbrevInput
                                sakId={props.sakId}
                                revurderingId={props.revurderingId}
                                tekst={field.value ?? ''}
                                onChange={field.onChange}
                                feil={fieldState.error}
                                intl={intl}
                            />
                        )
                    }
                />
            )}

            {RemoteData.isFailure(props.submitStatus) && <ApiErrorAlert error={props.submitStatus.error} />}

            <RevurderingBunnknapper
                onNesteClick="submit"
                nesteKnappTekst={
                    revurderingshandling === Revurderingshandling.Forhåndsvarsle
                        ? intl.formatMessage({ id: 'sendForhåndsvarsel.button.label' })
                        : intl.formatMessage({ id: 'sendTilAttestering.button.label' })
                }
                tilbakeUrl={props.forrigeUrl}
                onNesteClickSpinner={RemoteData.isPending(props.submitStatus)}
            />
        </form>
    );
};

export const SendTilAttesteringForm = (props: {
    sakId: string;
    revurderingId: string;
    forrigeUrl: string;
    submitStatus: ApiResult<unknown>;
    brevsending: 'aldriSende' | 'alltidSende' | 'kanVelge';
    onSubmit(args: { fritekstTilBrev: string; skalFøreTilBrevutsending: boolean }): void;
}) => {
    const { intl } = useI18n({ messages });
    interface FormData {
        tekstTilVedtaksbrev: string;
        skalFøreTilBrevutsending: boolean;
    }
    const form = useForm<FormData>({
        defaultValues: {
            tekstTilVedtaksbrev: '',
            skalFøreTilBrevutsending: props.brevsending === 'alltidSende',
        },
    });

    const skalFøreTilBrevutsending = form.watch('skalFøreTilBrevutsending');

    return (
        <form
            onSubmit={form.handleSubmit((values) =>
                props.onSubmit({
                    fritekstTilBrev: values.tekstTilVedtaksbrev,
                    skalFøreTilBrevutsending: values.skalFøreTilBrevutsending,
                })
            )}
            className={styles.form}
        >
            {props.brevsending === 'kanVelge' && (
                <Controller
                    control={form.control}
                    name="skalFøreTilBrevutsending"
                    render={({ field }) => (
                        <Checkbox
                            label={intl.formatMessage({ id: 'sendTilAttestering.skalFøreTilBrev' })}
                            name="skalFøreTilBrevutsending"
                            className={styles.skalFøreTilBrevutsendingCheckbox}
                            checked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
            )}

            {skalFøreTilBrevutsending && (
                <Controller
                    control={form.control}
                    name="tekstTilVedtaksbrev"
                    render={({ field, fieldState }) => (
                        <VedtaksbrevInput
                            sakId={props.sakId}
                            revurderingId={props.revurderingId}
                            tekst={field.value}
                            feil={fieldState.error}
                            onChange={field.onChange}
                            intl={intl}
                        />
                    )}
                />
            )}

            {RemoteData.isFailure(props.submitStatus) && <ApiErrorAlert error={props.submitStatus.error} />}

            <RevurderingBunnknapper
                onNesteClick="submit"
                nesteKnappTekst={intl.formatMessage({ id: 'sendTilAttestering.button.label' })}
                tilbakeUrl={props.forrigeUrl}
                onNesteClickSpinner={RemoteData.isPending(props.submitStatus)}
            />
        </form>
    );
};
