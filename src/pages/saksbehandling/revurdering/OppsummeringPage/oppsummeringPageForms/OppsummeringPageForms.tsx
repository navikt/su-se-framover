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
import { InformasjonsRevurdering, Valg } from '~src/types/Revurdering';
import {
    erRevurderingOpphørPgaManglendeDokumentasjon,
    erRevurderingTilbakekreving,
} from '~src/utils/revurdering/revurderingUtils';

import { Navigasjonsknapper } from '../../../bunnknapper/Navigasjonsknapper';
import { BrevvalgForm } from '../brevvalg/BrevvalgForm';

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
    onSubmit(args: { vedtaksbrevtekst: string; skalFøreTilBrevutsending: boolean }): void;
}) => {
    const { formatMessage } = useI18n({ messages });
    interface FormData {
        vedtaksbrevtekst: string;
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
                        : ''
        },
        resolver: yupResolver(
            yup.object<FormData>({
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

    return (
        <form
            onSubmit={form.handleSubmit(({ vedtaksbrevtekst }) =>
                props.onSubmit({
                    vedtaksbrevtekst: vedtaksbrevtekst,
                    skalFøreTilBrevutsending: true, //TODO fjern rester
                })
            )}
            className={styles.form}
        >
            {erRevurderingTilbakekreving(props.revurdering) && (
                <Alert variant={'warning'}>{formatMessage('tilbakereving.alert.brutto.netto')}</Alert>
            )}
            {true && (
                <BrevvalgForm
                    sakId={props.sakid}
                    revurdering={props.revurdering}
                    forrigeUrl={props.forrigeUrl}
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
