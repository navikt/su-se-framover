import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Checkbox, Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import * as pdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { BrevInput } from '~src/components/brevInput/BrevInput';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { UNDERSCORE_REGEX } from '~src/pages/saksbehandling/revurdering/OppsummeringPage/revurderingOppsummeringsPageUtils';
import { BeslutningEtterForhåndsvarsling, InformasjonsRevurdering } from '~src/types/Revurdering';
import {
    erRevurderingOpphørPgaManglendeDokumentasjon,
    erRevurderingTilbakekreving,
} from '~src/utils/revurdering/revurderingUtils';

import { Navigasjonsknapper } from '../../../bunnknapper/Navigasjonsknapper';

import messages from './oppsummeringPageForms-nb';
import * as styles from './oppsummeringPageForms.module.less';

export const ResultatEtterForhåndsvarselform = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    forrigeUrl: string;
    submitStatus: ApiResult<unknown>;
    onSubmit(args: {
        beslutningEtterForhåndsvarsel: BeslutningEtterForhåndsvarsling;
        brevtekst: string;
        begrunnelse: string;
    }): void;
}) => {
    const { formatMessage } = useI18n({ messages });

    interface FormData {
        beslutningEtterForhåndsvarsel: Nullable<BeslutningEtterForhåndsvarsling>;
        tekstTilVedtaksbrev: string;
        tekstTilAvsluttRevurderingBrev: string;
        begrunnelse: string;
    }

    const form = useForm<FormData>({
        defaultValues: {
            beslutningEtterForhåndsvarsel: null,
            tekstTilVedtaksbrev: erRevurderingTilbakekreving(props.revurdering)
                ? formatMessage('tilbakekreving.forhåndstekst')
                : erRevurderingOpphørPgaManglendeDokumentasjon(props.revurdering)
                ? formatMessage('opplysningsplikt.forhåndstekst')
                : '',
            tekstTilAvsluttRevurderingBrev: '',
            begrunnelse: '',
        },
        resolver: yupResolver(
            yup
                .object<FormData>({
                    beslutningEtterForhåndsvarsel: yup
                        .mixed()
                        .oneOf(Object.values(BeslutningEtterForhåndsvarsling), 'Feltet må fylles ut')
                        .required(),
                    tekstTilVedtaksbrev: yup
                        .string()
                        .defined()
                        .when('beslutningEtterForhåndsvarsel', {
                            is: BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger,
                            then: yup
                                .string()
                                .matches(
                                    UNDERSCORE_REGEX,
                                    erRevurderingOpphørPgaManglendeDokumentasjon(props.revurdering)
                                        ? 'Du må erstatte _____ med informasjon'
                                        : 'Du må erstatte _____ med tall'
                                ),
                        }),
                    tekstTilAvsluttRevurderingBrev: yup.string(),
                    begrunnelse: yup.string().required(),
                })
                .required()
        ),
    });

    const resultatEtterForhåndsvarsel = form.watch('beslutningEtterForhåndsvarsel');
    return (
        <form
            onSubmit={form.handleSubmit((values) =>
                props.onSubmit({
                    begrunnelse: values.begrunnelse,
                    beslutningEtterForhåndsvarsel: values.beslutningEtterForhåndsvarsel!,
                    brevtekst:
                        values.beslutningEtterForhåndsvarsel ===
                        BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger
                            ? values.tekstTilVedtaksbrev
                            : values.tekstTilAvsluttRevurderingBrev,
                })
            )}
            className={styles.form}
        >
            <Controller
                control={form.control}
                name="beslutningEtterForhåndsvarsel"
                render={({ field, fieldState }) => (
                    <RadioGroup
                        legend={formatMessage('etterForhåndsvarsel.legend.resultatEtterForhåndsvarsel')}
                        error={fieldState.error?.message}
                        name={field.name}
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
                    <div>
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
                        <BrevInput
                            placeholder={formatMessage('brevInput.innhold.placeholder')}
                            knappLabel={formatMessage('knapp.seBrev')}
                            tittel={formatMessage('brevInput.tekstTilVedtaksbrev.tittel')}
                            onVisBrevClick={() =>
                                pdfApi.fetchBrevutkastForRevurderingMedPotensieltFritekst({
                                    sakId: props.sakId,
                                    revurderingId: props.revurdering.id,
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
                        <BrevInput
                            placeholder={formatMessage('brevInput.innhold.placeholder')}
                            knappLabel={formatMessage('knapp.seBrev')}
                            tittel={formatMessage('brevInput.tekstTilAvsluttRevurdering.tittel')}
                            onVisBrevClick={() =>
                                pdfApi.fetchBrevutkastForAvslutningAvRevurdering({
                                    sakId: props.sakId,
                                    revurderingId: props.revurdering.id,
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
            <Navigasjonsknapper
                tilbake={{ url: props.forrigeUrl }}
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

type brevutsendingstype = 'aldriSende' | 'alltidSende' | 'kanVelge';

const getBrevutsending = (brevutsending: brevutsendingstype, value: boolean) => {
    switch (brevutsending) {
        case 'aldriSende':
            return false;
        case 'alltidSende':
            return true;
        case 'kanVelge':
            return value;
    }
};

export const SendTilAttesteringForm = (props: {
    sakid: string;
    revurdering: InformasjonsRevurdering;
    forrigeUrl: string;
    submitStatus: ApiResult<unknown>;
    brevsending: brevutsendingstype;
    onSubmit(args: { vedtaksbrevtekst: string; skalFøreTilBrevutsending: boolean }): void;
}) => {
    const { formatMessage } = useI18n({ messages });
    interface FormData {
        vedtaksbrevtekst: string;
        skalFøreTilBrevutsending: boolean;
    }
    const harFritekst = props.revurdering.fritekstTilBrev.length > 0;
    const tilbakekreving = erRevurderingTilbakekreving(props.revurdering);

    const form = useForm<FormData>({
        defaultValues: {
            vedtaksbrevtekst: harFritekst
                ? props.revurdering.fritekstTilBrev
                : tilbakekreving
                ? formatMessage('tilbakekreving.forhåndstekst')
                : erRevurderingOpphørPgaManglendeDokumentasjon(props.revurdering)
                ? formatMessage('opplysningsplikt.forhåndstekst')
                : '',
            skalFøreTilBrevutsending: props.brevsending === 'alltidSende' || harFritekst,
        },
        resolver: yupResolver(
            yup.object<FormData>({
                skalFøreTilBrevutsending: yup.boolean(),
                vedtaksbrevtekst: yup
                    .string()
                    .defined()
                    .matches(
                        UNDERSCORE_REGEX,
                        erRevurderingOpphørPgaManglendeDokumentasjon(props.revurdering)
                            ? 'Du må erstatte _____ med informasjon'
                            : 'Du må erstatte _____ med tall'
                    ),
            })
        ),
    });

    const skalFøreTilBrevutsending = form.watch('skalFøreTilBrevutsending');

    return (
        <form
            onSubmit={form.handleSubmit(({ vedtaksbrevtekst, skalFøreTilBrevutsending }) =>
                props.onSubmit({
                    vedtaksbrevtekst: vedtaksbrevtekst,
                    skalFøreTilBrevutsending: getBrevutsending(props.brevsending, skalFøreTilBrevutsending),
                })
            )}
            className={styles.form}
        >
            {props.brevsending === 'kanVelge' && (
                <Controller
                    control={form.control}
                    name="skalFøreTilBrevutsending"
                    render={({ field }) => (
                        <Checkbox name="skalFøreTilBrevutsending" checked={field.value} onChange={field.onChange}>
                            {formatMessage('sendTilAttestering.skalFøreTilBrev')}
                        </Checkbox>
                    )}
                />
            )}

            {skalFøreTilBrevutsending && (
                <Controller
                    control={form.control}
                    name="vedtaksbrevtekst"
                    render={({ field, fieldState }) => (
                        <BrevInput
                            placeholder={formatMessage('brevInput.innhold.placeholder')}
                            knappLabel={formatMessage('knapp.seBrev')}
                            tittel={formatMessage('brevInput.tekstTilVedtaksbrev.tittel')}
                            onVisBrevClick={() =>
                                pdfApi.fetchBrevutkastForRevurderingMedPotensieltFritekst({
                                    sakId: props.sakid,
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

            <Navigasjonsknapper
                nesteKnappTekst={formatMessage('sendTilAttestering.button.label')}
                tilbake={{ url: props.forrigeUrl }}
                loading={RemoteData.isPending(props.submitStatus)}
            />
        </form>
    );
};
