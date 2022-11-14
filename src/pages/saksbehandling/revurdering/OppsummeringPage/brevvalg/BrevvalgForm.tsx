import { Button, Checkbox, Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { BrevInput } from '~src/components/brevInput/BrevInput';
import { ApiResult, useAsyncActionCreatorWithArgsTransformer } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';

import { Nullable } from '~src/lib/types';
import { InformasjonsRevurdering, SimulertRevurdering, Valg } from '~src/types/Revurdering';
import oppsummeringPageFormsMessages from '../oppsummeringPageForms/oppsummeringPageForms-nb';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import * as pdfApi from '~src/api/pdfApi';
import * as RemoteData from '@devexperts/remote-data-ts';

import messages from './brevvalgForm-nb';
import * as styles from './brevvalgForm.module.less';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { erRevurderingOpphørPgaManglendeDokumentasjon, erRevurderingTilbakekreving } from '~src/utils/revurdering/revurderingUtils';
import { Navigasjonsknapper } from '~src/pages/saksbehandling/bunnknapper/Navigasjonsknapper';

export type BrevvalgFormData = {
    valg: Valg;
    fritekst: Nullable<string>;
    begrunnValg: boolean;
    begrunnelse: Nullable<string>;
};

export const BrevvalgForm = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    forrigeUrl: string;
}) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...oppsummeringPageFormsMessages } });

    const [lagreBrevvalgState, lagreBrevvalg] = useAsyncActionCreatorWithArgsTransformer(
        RevurderingActions.lagreBrevvalg,
        (args: {
            valg: Valg;
            fritekst: Nullable<string>;
            begrunnelse: Nullable<string>;
        }) => ({
            sakId: props.sakId,
            revurderingId: props.revurdering.id,
            valg: args.valg,
            fritekst: args.fritekst,
            begrunnelse: args.begrunnelse,
        }),
    );

    const handleSubmit = () => {
        lagreBrevvalg(
            {
                valg: form.getValues('valg'),
                fritekst: form.getValues('fritekst'),
                begrunnelse: form.getValues('begrunnelse'),
            },
        );
    };

    const form = useForm<BrevvalgFormData>({
        defaultValues: {
            valg: props.revurdering.brevvalg.valg,
            fritekst: props.revurdering.brevvalg.fritekst ? props.revurdering.brevvalg.fritekst : erRevurderingTilbakekreving(props.revurdering) ? formatMessage('tilbakekreving.forhåndstekst') : erRevurderingOpphørPgaManglendeDokumentasjon(props.revurdering) ? formatMessage('opplysningsplikt.forhåndstekst') : null,
            begrunnValg: props.revurdering.brevvalg.begrunnelse && props.revurdering.brevvalg.begrunnelse.length > 0 ? true : false,
            begrunnelse: props.revurdering.brevvalg.begrunnelse,
        },
    });

    const valg = form.watch('valg')
    const begrunnValg = form.watch('begrunnValg')

    const isLoading = RemoteData.isPending(lagreBrevvalgState)

    return (
        <div
            className={styles.form}
        >
            <Controller
                control={form.control}
                name="valg"
                render={({ field, fieldState }) => (
                    <RadioGroup
                        legend={formatMessage('brevvalg.skal.det.sendes.brev')}
                        error={fieldState.error?.message}
                        value={field.value ?? Valg.SEND}
                        onChange={field.onChange}
                    >
                        <Radio id={field.name} ref={field.ref} value={Valg.SEND} checked={valg === Valg.SEND}>
                            {formatMessage('ja')}
                        </Radio>
                        <Radio value={Valg.IKKE_SEND} checked={valg === Valg.IKKE_SEND}>
                            {formatMessage('nei')}
                        </Radio>
                    </RadioGroup>
                )}
            />
            {valg === Valg.IKKE_SEND && (
                form.setValue('fritekst', null)
            )}
            {valg === Valg.SEND && (
                <Controller
                    control={form.control}
                    name="fritekst"
                    render={({ field, fieldState }) => (
                        <BrevInput
                            knappLabel={formatMessage('knapp.seBrev')}
                            placeholder={formatMessage('brevInput.innhold.placeholder')}
                            tittel={formatMessage('brevtekst')}
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
                            forhåndsvisningEnabled={forhåndsvisningTillatt(valg, lagreBrevvalgState)}
                        />
                    )}
                />
            )
            }
            <Controller
                control={form.control}
                name={'begrunnValg'}
                render={({ field }) => (
                    <Checkbox
                        className={styles.checkbox}
                        name={field.name}
                        checked={field.value}
                        onChange={() => {
                            form.setValue('begrunnValg', !field.value)
                            form.setValue('begrunnelse', null)
                        }}
                    >
                        {formatMessage('begrunnelse.vil.begrunne')}
                    </Checkbox>
                )}
            />
            {begrunnValg && <Controller
                control={form.control}
                name={"begrunnelse"}
                render={({ field, fieldState }) => (
                    <Textarea
                        {...field}
                        label={formatMessage('begrunnelse')}
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    />
                )}
            />}
            {RemoteData.isFailure(lagreBrevvalgState) && <ApiErrorAlert error={lagreBrevvalgState.error} />}

            <Navigasjonsknapper
                nesteKnappTekst={'Lagre brevvalg'}
                onNesteClick={() => handleSubmit()}
                tilbake={{ url: props.forrigeUrl }}
                loading={isLoading}
            />
        </div>
    );
};

function forhåndsvisningTillatt(
    defaultValg: Valg,
    lagreState: ApiResult<SimulertRevurdering>
): boolean {
    return defaultValg === Valg.SEND || RemoteData.isSuccess(lagreState) && lagreState.value.brevvalg.valg === Valg.SEND
}