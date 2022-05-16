import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import * as pdfApi from '~src/api/pdfApi';
import { Forhåndsvarselhandling } from '~src/api/revurderingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { BrevInput } from '~src/components/brevInput/BrevInput';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreatorWithArgsTransformer } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { RevurderingBunnknapper } from '~src/pages/saksbehandling/revurdering/bunnknapper/RevurderingBunnknapper';
import { UNDERSCORE_REGEX } from '~src/pages/saksbehandling/revurdering/OppsummeringPage/revurderingOppsummeringsPageUtils';
import { InformasjonsRevurdering } from '~src/types/Revurdering';
import { erRevurderingOpphørPgaManglendeDokumentasjon } from '~src/utils/revurdering/revurderingUtils';

import oppsummeringPageFormsMessages from '../oppsummeringPageForms/oppsummeringPageForms-nb';

import messages from './forhåndsvarselForm-nb';
import * as styles from './forhåndsvarselForm.module.less';

export type ForhåndsvarselFormData = {
    forhåndsvarselhandling: Nullable<Forhåndsvarselhandling>;
    fritekstTilForhåndsvarsel: Nullable<string>;
    fritekstTilVedtaksbrev: Nullable<string>;
};

export const VelgForhåndsvarselForm = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    tilbake: { url: string; visModal: boolean } | { onTilbakeClick: () => void };
    defaultVedtakstekst?: string;
}) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...oppsummeringPageFormsMessages } });
    const navigate = useNavigate();

    const [sendTilAttesteringState, sendTilAttestering] = useAsyncActionCreatorWithArgsTransformer(
        RevurderingActions.sendRevurderingTilAttestering,
        (args: { vedtaksbrevtekst: string; skalFøreTilBrevutsending: boolean }) => ({
            sakId: props.sakId,
            revurderingId: props.revurdering.id,
            fritekstTilBrev: args.vedtaksbrevtekst,
            skalFøreTilBrevutsending: args.skalFøreTilBrevutsending,
        }),
        () => navigate(Routes.createSakIntroLocation(formatMessage('notification.sendtTilAttestering'), props.sakId))
    );

    const [lagreForhåndsvarselState, lagreForhåndsvarsel] = useAsyncActionCreatorWithArgsTransformer(
        RevurderingActions.lagreForhåndsvarsel,
        (args: {
            forhåndsvarselhandling: Forhåndsvarselhandling;
            fritekstTilForhåndsvarsel: string;
            fritekstTilVedtaksbrev: string;
        }) => ({
            sakId: props.sakId,
            revurderingId: props.revurdering.id,
            forhåndsvarselhandling: args.forhåndsvarselhandling,
            fritekstTilBrev: args.fritekstTilForhåndsvarsel,
        }),
        (args) => {
            switch (args.forhåndsvarselhandling) {
                case Forhåndsvarselhandling.Forhåndsvarsle:
                    navigate(
                        Routes.createSakIntroLocation(formatMessage('notification.sendtForhåndsvarsel'), props.sakId)
                    );
                    return;
                case Forhåndsvarselhandling.IngenForhåndsvarsel:
                    sendTilAttestering({
                        vedtaksbrevtekst: args.fritekstTilVedtaksbrev,
                        skalFøreTilBrevutsending: true,
                    });
                    return;
            }
        }
    );

    const form = useForm<ForhåndsvarselFormData>({
        defaultValues: {
            forhåndsvarselhandling: null,
            fritekstTilForhåndsvarsel: null,
            fritekstTilVedtaksbrev:
                props.defaultVedtakstekst ?? erRevurderingOpphørPgaManglendeDokumentasjon(props.revurdering)
                    ? formatMessage('opplysningsplikt.forhåndstekst')
                    : null,
        },
        resolver: yupResolver(
            yup
                .object<ForhåndsvarselFormData>({
                    forhåndsvarselhandling: yup
                        .mixed()
                        .required()
                        .defined()
                        .oneOf(Object.values(Forhåndsvarselhandling), 'Du må velge om bruker skal forhåndsvarsles'),
                    fritekstTilForhåndsvarsel: yup.string().nullable().defined().when('forhåndsvarselhandling', {
                        is: Forhåndsvarselhandling.Forhåndsvarsle,
                        then: yup.string().nullable().required(),
                    }),
                    fritekstTilVedtaksbrev: yup
                        .string()
                        .defined()
                        .when('forhåndsvarselhandling', {
                            is: Forhåndsvarselhandling.IngenForhåndsvarsel,
                            then: yup
                                .string()
                                .nullable()
                                .matches(
                                    UNDERSCORE_REGEX,
                                    erRevurderingOpphørPgaManglendeDokumentasjon(props.revurdering)
                                        ? 'Du må erstatte _____ med informasjon'
                                        : 'Du må erstatte _____ med tall'
                                )
                                .required(),
                        }),
                })
                .required()
        ),
    });

    const forhåndsvarselhandling = form.watch('forhåndsvarselhandling');
    const submitStatus =
        forhåndsvarselhandling === Forhåndsvarselhandling.Forhåndsvarsle
            ? lagreForhåndsvarselState
            : RemoteData.combine(lagreForhåndsvarselState, sendTilAttesteringState);

    const isLoading = RemoteData.isPending(lagreForhåndsvarselState) || RemoteData.isPending(sendTilAttesteringState);

    return (
        <form
            onSubmit={form.handleSubmit((values) =>
                lagreForhåndsvarsel({
                    fritekstTilForhåndsvarsel: values.fritekstTilForhåndsvarsel ?? '',
                    fritekstTilVedtaksbrev: values.fritekstTilVedtaksbrev ?? '',
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
                        value={field.value ?? ''}
                        onChange={field.onChange}
                    >
                        <Radio id={field.name} ref={field.ref} value={Forhåndsvarselhandling.Forhåndsvarsle}>
                            {formatMessage('ja')}
                        </Radio>
                        <Radio value={Forhåndsvarselhandling.IngenForhåndsvarsel}>{formatMessage('nei')}</Radio>
                    </RadioGroup>
                )}
            />
            {forhåndsvarselhandling === Forhåndsvarselhandling.Forhåndsvarsle && (
                <Controller
                    control={form.control}
                    name="fritekstTilForhåndsvarsel"
                    render={({ field, fieldState }) => (
                        <BrevInput
                            knappLabel={formatMessage('knapp.seBrev')}
                            placeholder={formatMessage('brevInput.innhold.placeholder')}
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
                    )}
                />
            )}
            {forhåndsvarselhandling === Forhåndsvarselhandling.IngenForhåndsvarsel && (
                <Controller
                    control={form.control}
                    name="fritekstTilVedtaksbrev"
                    render={({ field, fieldState }) => (
                        <BrevInput
                            knappLabel={formatMessage('knapp.seBrev')}
                            placeholder={formatMessage('brevInput.innhold.placeholder')}
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
                    )}
                />
            )}
            {RemoteData.isFailure(submitStatus) && <ApiErrorAlert error={submitStatus.error} />}
            <RevurderingBunnknapper
                nesteKnappTekst={
                    forhåndsvarselhandling === Forhåndsvarselhandling.Forhåndsvarsle
                        ? formatMessage('sendForhåndsvarsel.button.label')
                        : formatMessage('sendTilAttestering.button.label')
                }
                tilbake={props.tilbake}
                loading={isLoading}
            />
        </form>
    );
};
