import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import * as pdfApi from '~api/pdfApi';
import { Forhåndsvarselhandling } from '~api/revurderingApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { BrevInput } from '~components/brevInput/BrevInput';
import * as RevurderingActions from '~features/revurdering/revurderingActions';
import { useAsyncActionCreatorWithArgsTransformer } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { RevurderingBunnknapper } from '~pages/saksbehandling/revurdering/bunnknapper/RevurderingBunnknapper';
import { InformasjonsRevurdering } from '~types/Revurdering';

import messages from './forhåndsvarselForm-nb';
import styles from './forhåndsvarselForm.module.less';

export type ForhåndsvarselFormData = {
    forhåndsvarselhandling: Nullable<Forhåndsvarselhandling>;
    fritekstTilForhåndsvarsel: Nullable<string>;
    fritekstTilVedtaksbrev: Nullable<string>;
};

export const VelgForhåndsvarselForm = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    forrigeUrl?: string;
    onTilbakeClick?: () => void;
    tvingForhåndsvarsling: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });
    const history = useHistory();

    const [sendTilAttesteringState, sendTilAttestering] = useAsyncActionCreatorWithArgsTransformer(
        RevurderingActions.sendRevurderingTilAttestering,
        (args: { vedtaksbrevtekst: string; skalFøreTilBrevutsending: boolean }) => ({
            sakId: props.sakId,
            revurderingId: props.revurdering.id,
            fritekstTilBrev: args.vedtaksbrevtekst,
            skalFøreTilBrevutsending: args.skalFøreTilBrevutsending,
        }),
        () =>
            history.push(Routes.createSakIntroLocation(formatMessage('notification.sendtTilAttestering'), props.sakId))
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
                    history.push(
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
            forhåndsvarselhandling: props.tvingForhåndsvarsling ? Forhåndsvarselhandling.Forhåndsvarsle : null,
            fritekstTilForhåndsvarsel: null,
            fritekstTilVedtaksbrev: null,
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
                    fritekstTilVedtaksbrev: yup.string().nullable().defined().when('forhåndsvarselhandling', {
                        is: Forhåndsvarselhandling.IngenForhåndsvarsel,
                        then: yup.string().nullable().required(),
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
            {!props.tvingForhåndsvarsling && (
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
            )}
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
                onTilbakeClick={props.onTilbakeClick}
                tilbakeUrl={props.forrigeUrl}
                loading={isLoading}
            />
        </form>
    );
};
