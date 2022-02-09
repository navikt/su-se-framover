import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Checkbox, Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import * as pdfApi from '~api/pdfApi';
import { Forhåndsvarselhandling } from '~api/revurderingApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { BrevInput, BrevInputProps } from '~components/brevInput/BrevInput';
import { ApiResult } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { BeslutningEtterForhåndsvarsling, InformasjonsRevurdering } from '~types/Revurdering';

import { RevurderingBunnknapper } from '../../bunnknapper/RevurderingBunnknapper';

import messages from './oppsummeringPageForms-nb';
import styles from './oppsummeringPageForms.module.less';

const OppsummeringsBrevInput = (props: Omit<BrevInputProps, 'placeholder' | 'intl'>) => {
    const { intl } = useI18n({ messages });
    return (
        <BrevInput placeholder={intl.formatMessage({ id: 'brevInput.innhold.placeholder' })} intl={intl} {...props} />
    );
};

export const ResultatEtterForhåndsvarselform = (props: {
    sakId: string;
    revurderingId: string;
    forrigeUrl: string;
    submitStatus: ApiResult<unknown>;
    onSubmit(args: {
        resultatEtterForhåndsvarsel: BeslutningEtterForhåndsvarsling;
        brevTekst: string;
        begrunnelse: string;
    }): void;
}) => {
    const { formatMessage } = useI18n({ messages });

    interface FormData {
        resultatEtterForhåndsvarsel: Nullable<BeslutningEtterForhåndsvarsling>;
        tekstTilVedtaksbrev: string;
        tekstTilAvsluttRevurderingBrev: string;
        begrunnelse: string;
    }

    const form = useForm<FormData>({
        defaultValues: {
            resultatEtterForhåndsvarsel: null,
            tekstTilVedtaksbrev: '',
            tekstTilAvsluttRevurderingBrev: '',
            begrunnelse: '',
        },
        resolver: yupResolver(
            yup
                .object<FormData>({
                    resultatEtterForhåndsvarsel: yup
                        .mixed()
                        .oneOf(Object.values(BeslutningEtterForhåndsvarsling), 'Feltet må fylles ut')
                        .required(),
                    tekstTilVedtaksbrev: yup.string(),
                    tekstTilAvsluttRevurderingBrev: yup.string(),
                    begrunnelse: yup.string().required(),
                })
                .required()
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
                    brevTekst:
                        values.resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger
                            ? values.tekstTilVedtaksbrev
                            : values.tekstTilAvsluttRevurderingBrev,
                })
            )}
            className={styles.form}
        >
            <Controller
                control={form.control}
                name="resultatEtterForhåndsvarsel"
                render={({ field, fieldState }) => (
                    <RadioGroup
                        legend={formatMessage('etterForhåndsvarsel.legend.resultatEtterForhåndsvarsel')}
                        error={fieldState.error?.message}
                        name={field.name}
                        className={styles.resultatEtterForhåndsvarselContainer}
                        value={field.value ?? undefined}
                        onChange={(val) => field.onChange(val as BeslutningEtterForhåndsvarsling)}
                    >
                        <Radio
                            id={field.name}
                            ref={field.ref}
                            value={BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger}
                        >
                            {formatMessage('etterForhåndsvarsel.radio.sammeOpplysninger')}
                        </Radio>
                        <Radio value={BeslutningEtterForhåndsvarsling.FortsettMedAndreOpplysninger}>
                            {formatMessage('etterForhåndsvarsel.radio.andreOpplysninger')}
                        </Radio>
                        <Radio value={BeslutningEtterForhåndsvarsling.AvsluttUtenEndringer}>
                            {formatMessage('etterForhåndsvarsel.radio.avsluttesUtenEndring')}
                        </Radio>
                    </RadioGroup>
                )}
            />
            <Controller
                control={form.control}
                name="begrunnelse"
                render={({ field, fieldState }) => (
                    <div className={styles.etterForhåndsvarselBegrunnelseContainer}>
                        <Textarea
                            label={formatMessage('etterForhåndsvarsel.begrunnelse.label')}
                            {...field}
                            error={fieldState.error?.message}
                        />
                    </div>
                )}
            />
            {resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger && (
                <Controller
                    control={form.control}
                    name="tekstTilVedtaksbrev"
                    render={({ field, fieldState }) => (
                        <OppsummeringsBrevInput
                            tittel={formatMessage('brevInput.tekstTilVedtaksbrev.tittel')}
                            onVisBrevClick={() =>
                                pdfApi.fetchBrevutkastForRevurderingMedPotensieltFritekst({
                                    sakId: props.sakId,
                                    revurderingId: props.revurderingId,
                                    fritekst: field.value,
                                })
                            }
                            tekst={field.value}
                            onChange={field.onChange}
                            feil={fieldState.error}
                        />
                    )}
                />
            )}
            {resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.AvsluttUtenEndringer && (
                <Controller
                    control={form.control}
                    name="tekstTilAvsluttRevurderingBrev"
                    render={({ field, fieldState }) => (
                        <OppsummeringsBrevInput
                            tittel={formatMessage('brevInput.tekstTilAvsluttRevurdering.tittel')}
                            onVisBrevClick={() =>
                                pdfApi.fetchBrevutkastForAvslutningAvRevurdering({
                                    sakId: props.sakId,
                                    revurderingId: props.revurderingId,
                                    fritekst: field.value,
                                })
                            }
                            tekst={field.value}
                            onChange={field.onChange}
                            feil={fieldState.error}
                        />
                    )}
                />
            )}
            {RemoteData.isFailure(props.submitStatus) && <ApiErrorAlert error={props.submitStatus.error} />}
            <RevurderingBunnknapper
                nesteKnappTekst={
                    resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.FortsettMedAndreOpplysninger
                        ? formatMessage('fortsett.button.label')
                        : resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.AvsluttUtenEndringer
                        ? formatMessage('avslutt.button.label')
                        : formatMessage('sendTilAttestering.button.label')
                }
                loading={RemoteData.isPending(props.submitStatus)}
            />
        </form>
    );
};

export const VelgForhåndsvarselForm = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    forrigeUrl: string;
    submitStatus: ApiResult<unknown>;
    onSubmit(args: { forhåndsvarselhandling: Forhåndsvarselhandling; fritekstTilBrev: string }): void;
}) => {
    interface FormData {
        forhåndsvarselhandling: Nullable<Forhåndsvarselhandling>;
        fritekstTilBrev: Nullable<string>;
    }

    const { formatMessage } = useI18n({ messages });

    const form = useForm<FormData>({
        defaultValues: {
            forhåndsvarselhandling: null,
            fritekstTilBrev: null,
        },
        resolver: yupResolver(
            yup
                .object<FormData>({
                    forhåndsvarselhandling: yup
                        .mixed()
                        .required()
                        .defined()
                        .oneOf(Object.values(Forhåndsvarselhandling), 'Du må velge om bruker skal forhåndsvarsles'),
                    fritekstTilBrev: yup.string().nullable().required(),
                })
                .required()
        ),
    });

    const forhåndsvarselhandling = form.watch('forhåndsvarselhandling');

    return (
        <form
            onSubmit={form.handleSubmit((values) =>
                props.onSubmit({
                    fritekstTilBrev: values.fritekstTilBrev ?? '',
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    forhåndsvarselhandling: values.forhåndsvarselhandling!,
                })
            )}
            className={styles.form}
        >
            <Controller
                control={form.control}
                name="forhåndsvarselhandling"
                render={({ field, fieldState }) => (
                    <RadioGroup
                        legend={formatMessage('velgForhåndsvarsel.handling.legend')}
                        error={fieldState.error?.message}
                        name={field.name}
                        onChange={(val) => field.onChange(val)}
                        value={field.value ?? ''}
                    >
                        <Radio id={field.name} ref={field.ref} value={Forhåndsvarselhandling.Forhåndsvarsle}>
                            {formatMessage('ja')}
                        </Radio>
                        <Radio value={Forhåndsvarselhandling.IngenForhåndsvarsel}>{formatMessage('nei')}</Radio>
                    </RadioGroup>
                )}
            />
            {forhåndsvarselhandling !== null && (
                <Controller
                    control={form.control}
                    name="fritekstTilBrev"
                    render={({ field, fieldState }) =>
                        forhåndsvarselhandling === Forhåndsvarselhandling.Forhåndsvarsle ? (
                            <OppsummeringsBrevInput
                                tittel={formatMessage('brevInput.tekstTilForhåndsvarsel.tittel')}
                                onVisBrevClick={() =>
                                    pdfApi.fetchBrevutkastForForhåndsvarsel(
                                        props.sakId,
                                        props.revurdering.id,
                                        field.value ?? ''
                                    )
                                }
                                tekst={field.value ?? ''}
                                onChange={field.onChange}
                                feil={fieldState.error}
                            />
                        ) : (
                            <OppsummeringsBrevInput
                                tittel={formatMessage('brevInput.tekstTilVedtaksbrev.tittel')}
                                onVisBrevClick={() =>
                                    pdfApi.fetchBrevutkastForRevurderingMedPotensieltFritekst({
                                        sakId: props.sakId,
                                        revurderingId: props.revurdering.id,
                                        fritekst: field.value,
                                    })
                                }
                                tekst={field.value ?? ''}
                                onChange={field.onChange}
                                feil={fieldState.error}
                            />
                        )
                    }
                />
            )}
            {RemoteData.isFailure(props.submitStatus) && <ApiErrorAlert error={props.submitStatus.error} />}
            <RevurderingBunnknapper
                nesteKnappTekst={
                    forhåndsvarselhandling === Forhåndsvarselhandling.Forhåndsvarsle
                        ? formatMessage('sendForhåndsvarsel.button.label')
                        : formatMessage('sendTilAttestering.button.label')
                }
                tilbakeUrl={props.forrigeUrl}
                loading={RemoteData.isPending(props.submitStatus)}
            />
        </form>
    );
};

export const SendTilAttesteringForm = (props: {
    revurdering: InformasjonsRevurdering;
    forrigeUrl: string;
    submitStatus: ApiResult<unknown>;
    brevsending: 'aldriSende' | 'alltidSende' | 'kanVelge';
    onSubmit(args: { fritekstTilBrev: string; skalFøreTilBrevutsending: boolean }): void;
}) => {
    const { formatMessage } = useI18n({ messages });
    interface FormData {
        tekstTilVedtaksbrev: string;
        skalFøreTilBrevutsending: boolean;
    }
    const form = useForm<FormData>({
        defaultValues: {
            tekstTilVedtaksbrev: props.revurdering.fritekstTilBrev,
            skalFøreTilBrevutsending:
                props.brevsending === 'alltidSende' || props.revurdering.fritekstTilBrev.length > 0,
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
                            name="skalFøreTilBrevutsending"
                            className={styles.skalFøreTilBrevutsendingCheckbox}
                            checked={field.value}
                            onChange={field.onChange}
                        >
                            {formatMessage('sendTilAttestering.skalFøreTilBrev')}
                        </Checkbox>
                    )}
                />
            )}

            {skalFøreTilBrevutsending && (
                <Controller
                    control={form.control}
                    name="tekstTilVedtaksbrev"
                    render={({ field, fieldState }) => (
                        <OppsummeringsBrevInput
                            tittel={formatMessage('brevInput.tekstTilVedtaksbrev.tittel')}
                            onVisBrevClick={() =>
                                pdfApi.fetchBrevutkastForRevurderingMedPotensieltFritekst({
                                    sakId: props.revurdering.tilRevurdering.sakId,
                                    revurderingId: props.revurdering.id,
                                    fritekst: field.value,
                                })
                            }
                            tekst={field.value ?? ''}
                            onChange={field.onChange}
                            feil={fieldState.error}
                        />
                    )}
                />
            )}

            {RemoteData.isFailure(props.submitStatus) && <ApiErrorAlert error={props.submitStatus.error} />}

            <RevurderingBunnknapper
                nesteKnappTekst={formatMessage('sendTilAttestering.button.label')}
                tilbakeUrl={props.forrigeUrl}
                loading={RemoteData.isPending(props.submitStatus)}
            />
        </form>
    );
};
