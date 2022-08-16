import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import * as pdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { BrevInput } from '~src/components/brevInput/BrevInput';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Tilbakekrevingsavgjørelse } from '~src/pages/saksbehandling/revurdering/OppsummeringPage/tilbakekreving/TilbakekrevingForm';
import { BeslutningEtterForhåndsvarsling, InformasjonsRevurdering } from '~src/types/Revurdering';
import { erRevurderingOpphørPgaManglendeDokumentasjon } from '~src/utils/revurdering/revurderingUtils';

import { Navigasjonsknapper } from '../../../bunnknapper/Navigasjonsknapper';
import messages from '../oppsummeringPageForms/oppsummeringPageForms-nb';
import * as styles from '../oppsummeringPageForms/oppsummeringPageForms.module.less';

import {
    BeslutningEtterForhåndsvarslingFormData,
    resultatEtterForhpndsvarselSchema,
    ResultatEtterForhåndsvarselFormData,
    resultatEtterForhåndsvarselFormDataTilRequest,
} from './ResultatEtterForhåndsvarselUtils';

const ResultatEtterForhåndsvarselform = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    forrigeUrl: string;
    førsteRevurderingstegUrl: string;
}) => {
    const { formatMessage } = useI18n({ messages: { ...messages } });
    const navigate = useNavigate();

    const [forhåndsvarselResultatStatus, sendForhåndsvarselAction] = useAsyncActionCreator(
        RevurderingActions.fortsettEtterForhåndsvarsel
    );

    const onFormSubmit = (values: ResultatEtterForhåndsvarselFormData) => {
        const sendForhåndsvarsel = (onSuccess: () => void) =>
            sendForhåndsvarselAction(
                resultatEtterForhåndsvarselFormDataTilRequest(props.sakId, props.revurdering.id, values),
                onSuccess
            );

        switch (values.beslutningEtterForhåndsvarsel) {
            case BeslutningEtterForhåndsvarslingFormData.AvsluttUtenEndringer:
                navigate(Routes.avsluttBehandling.createURL({ sakId: props.sakId, id: props.revurdering.id }));
                break;
            case BeslutningEtterForhåndsvarslingFormData.FortsettMedAndreOpplysninger:
                sendForhåndsvarsel(() => {
                    navigate(props.førsteRevurderingstegUrl);
                });
                break;
            case BeslutningEtterForhåndsvarslingFormData.FortsettSammeOpplysninger:
                sendForhåndsvarsel(() => {
                    Routes.navigateToSakIntroWithMessage(
                        navigate,
                        formatMessage('notification.sendtTilAttestering'),
                        props.sakId
                    );
                });
        }
    };

    const form = useForm<ResultatEtterForhåndsvarselFormData>({
        defaultValues: {
            beslutningEtterForhåndsvarsel: null,
            tekstTilVedtaksbrev:
                props.revurdering.tilbakekrevingsbehandling?.avgjørelse === Tilbakekrevingsavgjørelse.TILBAKEKREV
                    ? formatMessage('tilbakekreving.forhåndstekst')
                    : erRevurderingOpphørPgaManglendeDokumentasjon(props.revurdering)
                    ? formatMessage('opplysningsplikt.forhåndstekst')
                    : null,
            begrunnelse: null,
        },
        resolver: yupResolver(resultatEtterForhpndsvarselSchema(props.revurdering)),
    });

    const resultatEtterForhåndsvarsel = form.watch('beslutningEtterForhåndsvarsel');
    return (
        <form className={styles.form} onSubmit={form.handleSubmit(onFormSubmit)}>
            <Controller
                control={form.control}
                name="beslutningEtterForhåndsvarsel"
                render={({ field, fieldState }) => (
                    <RadioGroup
                        legend={formatMessage('etterForhåndsvarsel.legend.resultatEtterForhåndsvarsel')}
                        error={fieldState.error?.message}
                        name={field.name}
                        value={field.value}
                        onChange={(val) => field.onChange(val as BeslutningEtterForhåndsvarsling)}
                    >
                        {Object.values(BeslutningEtterForhåndsvarslingFormData).map((alternativ) => (
                            <Radio key={alternativ} value={alternativ}>
                                {formatMessage(alternativ)}
                            </Radio>
                        ))}
                    </RadioGroup>
                )}
            />
            {resultatEtterForhåndsvarsel !== BeslutningEtterForhåndsvarslingFormData.AvsluttUtenEndringer &&
                resultatEtterForhåndsvarsel !== null && (
                    <Controller
                        control={form.control}
                        name="begrunnelse"
                        render={({ field, fieldState }) => (
                            <div>
                                <Textarea
                                    label={formatMessage('etterForhåndsvarsel.begrunnelse.label')}
                                    {...field}
                                    value={field.value ?? undefined}
                                    error={fieldState.error?.message}
                                />
                            </div>
                        )}
                    />
                )}
            {resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarslingFormData.FortsettSammeOpplysninger && (
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
            {RemoteData.isFailure(forhåndsvarselResultatStatus) && (
                <ApiErrorAlert error={forhåndsvarselResultatStatus.error} />
            )}
            <Navigasjonsknapper
                tilbake={{ url: props.forrigeUrl }}
                nesteKnappTekst={
                    resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarslingFormData.FortsettMedAndreOpplysninger
                        ? formatMessage('fortsett.button.label')
                        : resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarslingFormData.AvsluttUtenEndringer
                        ? formatMessage('button.label.neste')
                        : formatMessage('sendTilAttestering.button.label')
                }
                loading={RemoteData.isPending(forhåndsvarselResultatStatus)}
            />
        </form>
    );
};

export default ResultatEtterForhåndsvarselform;
