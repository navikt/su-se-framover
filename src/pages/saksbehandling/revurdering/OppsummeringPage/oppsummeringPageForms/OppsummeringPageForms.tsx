import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert } from '@navikt/ds-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
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
import { BrevvalgForm } from '../brevvalg/BrevvalgForm';

import messages from './oppsummeringPageForms-nb';
import * as styles from './oppsummeringPageForms.module.less';

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
                : '',
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
            {true && <BrevvalgForm sakId={props.sakid} revurdering={props.revurdering} forrigeUrl={props.forrigeUrl} />}

            {RemoteData.isFailure(props.submitStatus) && <ApiErrorAlert error={props.submitStatus.error} />}
            <Navigasjonsknapper
                nesteKnappTekst={formatMessage('sendTilAttestering.button.label')}
                tilbake={{ url: props.forrigeUrl }}
                loading={RemoteData.isPending(props.submitStatus)}
            />
        </form>
    );
};
