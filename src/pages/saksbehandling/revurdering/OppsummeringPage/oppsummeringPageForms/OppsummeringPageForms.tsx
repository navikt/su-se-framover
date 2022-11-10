import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Checkbox } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import * as pdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { BrevInput } from '~src/components/brevInput/BrevInput';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import yup from '~src/lib/validering';
import { UNDERSCORE_REGEX } from '~src/pages/saksbehandling/revurdering/OppsummeringPage/revurderingOppsummeringsPageUtils';
import { InformasjonsRevurdering } from '~src/types/Revurdering';
import {
    erRevurderingOpphørPgaManglendeDokumentasjon,
    erRevurderingTilbakekreving,
} from '~src/utils/revurdering/revurderingUtils';

import { Navigasjonsknapper } from '../../../bunnknapper/Navigasjonsknapper';

import messages from './oppsummeringPageForms-nb';
import * as styles from './oppsummeringPageForms.module.less';

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
            {erRevurderingTilbakekreving(props.revurdering) && (
                <Alert variant={'warning'}>{formatMessage('tilbakereving.alert.brutto.netto')}</Alert>
            )}
            {props.brevsending === 'kanVelge' && (
                <Controller
                    control={form.control}
                    name="skalFøreTilBrevutsending"
                    render={(
                        { field } //TODO tilhører egentlig ikke denne pr, rydd opp når det er mulig å velge brev for alle revurderinger - disabler inntil videre
                    ) => (
                        <Checkbox
                            name="skalFøreTilBrevutsending"
                            checked={field.value}
                            onChange={field.onChange}
                            disabled={true}
                        >
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
