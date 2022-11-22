import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Checkbox, Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '~src/api/apiClient';
import * as pdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { BrevInput } from '~src/components/brevInput/BrevInput';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import Navigasjonsknapper from '~src/pages/saksbehandling/bunnknapper/Navigasjonsknapper';
import { useAppDispatch } from '~src/redux/Store';
import { Revurdering, InformasjonsRevurdering, Valg } from '~src/types/Revurdering';
import {
    erRevurderingOpphørPgaManglendeDokumentasjon,
    erRevurderingTilbakekreving,
} from '~src/utils/revurdering/revurderingUtils';

import { UNDERSCORE_REGEX } from '../revurderingOppsummeringsPageUtils';

import messages from './brevvalgForm-nb';
import * as styles from './brevvalgForm.module.less';

export type BrevvalgFormData = {
    valg: Valg;
    fritekst: Nullable<string>;
    begrunnValg: boolean;
    begrunnelse: Nullable<string>;
};

const brevvalgSchema = (revurdering: InformasjonsRevurdering) =>
    yup.object<BrevvalgFormData>({
        valg: yup.string().oneOf(Object.values(Valg)).required(),
        fritekst: yup
            .string()
            .defined()
            .nullable()
            .matches(
                UNDERSCORE_REGEX,
                erRevurderingOpphørPgaManglendeDokumentasjon(revurdering)
                    ? 'Du må erstatte _____ med informasjon'
                    : 'Du må erstatte _____ med tall'
            ),
        begrunnValg: yup.boolean(),
        begrunnelse: yup.string().nullable().defined(),
    });

export const BrevvalgForm = (props: { sakId: string; revurdering: InformasjonsRevurdering; forrigeUrl: string }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { formatMessage } = useI18n({ messages });

    const [lagreStatus, setLagreStatus] = React.useState<RemoteData.RemoteData<ApiError, Revurdering>>(
        RemoteData.initial
    );
    const [sendTilAttesteringStatus, sendtilAttestering] = useAsyncActionCreator(
        RevurderingActions.sendRevurderingTilAttestering
    );

    //Vi gjør dispatching litt på gamle måten fordi vi må chaine se-brev kallet bare hvis det dispatchen er OK
    const dispatchLagBrev = async (values: BrevvalgFormData) => {
        const res = await dispatch(
            RevurderingActions.lagreBrevvalg({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                valg: values.valg,
                fritekst: values.fritekst,
                begrunnelse: values.begrunnelse,
            })
        );

        if (RevurderingActions.lagreBrevvalg.fulfilled.match(res)) {
            setLagreStatus(RemoteData.success(res.payload));
            return 'ok';
        }
        if (RevurderingActions.lagreBrevvalg.rejected.match(res)) {
            setLagreStatus(RemoteData.failure(res.payload!));
            return 'error';
        }
        throw new Error('uhåndtert case av api kall utfall ved brevvalgForm');
    };

    const handleSubmit = (values: BrevvalgFormData) => {
        dispatchLagBrev(values).then((res) => {
            if (res === 'ok') {
                sendtilAttestering(
                    {
                        sakId: props.sakId,
                        revurderingId: props.revurdering.id,
                    },
                    () => {
                        Routes.navigateToSakIntroWithMessage(
                            navigate,
                            formatMessage('notification.sendtTilAttestering'),
                            props.sakId
                        );
                    }
                );
            }
        });
    };

    const form = useForm<BrevvalgFormData>({
        defaultValues: {
            valg: props.revurdering.brevvalg.valg,
            fritekst: props.revurdering.brevvalg.fritekst
                ? props.revurdering.brevvalg.fritekst
                : erRevurderingTilbakekreving(props.revurdering)
                ? formatMessage('tilbakekreving.forhåndstekst')
                : erRevurderingOpphørPgaManglendeDokumentasjon(props.revurdering)
                ? formatMessage('opplysningsplikt.forhåndstekst')
                : null,
            begrunnValg:
                props.revurdering.brevvalg.begrunnelse && props.revurdering.brevvalg.begrunnelse.length > 0
                    ? true
                    : false,
            begrunnelse: props.revurdering.brevvalg.begrunnelse,
        },
        resolver: yupResolver(brevvalgSchema(props.revurdering)),
    });

    const valg = form.watch('valg');
    const begrunnValg = form.watch('begrunnValg');

    const isLoading = RemoteData.isPending(lagreStatus);

    return (
        <form className={styles.form} onSubmit={form.handleSubmit(handleSubmit)}>
            {erRevurderingTilbakekreving(props.revurdering) && (
                <Alert variant={'warning'}>{formatMessage('tilbakereving.alert.brutto.netto')}</Alert>
            )}
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
            {valg === Valg.IKKE_SEND && form.setValue('fritekst', null)}
            {valg === Valg.SEND && (
                <Controller
                    control={form.control}
                    name="fritekst"
                    render={({ field, fieldState }) => (
                        <BrevInput
                            knappLabel={formatMessage('knapp.seBrev')}
                            placeholder={formatMessage('brevInput.innhold.placeholder')}
                            tittel={formatMessage('brevtekst')}
                            onVisBrevClick={async () => {
                                return await dispatchLagBrev(form.getValues()).then((res) => {
                                    return res === 'ok'
                                        ? pdfApi.fetchBrevutkastForRevurderingMedPotensieltFritekst({
                                              sakId: props.sakId,
                                              revurderingId: props.revurdering.id,
                                              fritekst: field.value,
                                          })
                                        : undefined;
                                });
                            }}
                            tekst={field.value}
                            onChange={field.onChange}
                            feil={fieldState.error}
                        />
                    )}
                />
            )}
            <Controller
                control={form.control}
                name={'begrunnValg'}
                render={({ field }) => (
                    <Checkbox
                        className={styles.checkbox}
                        name={field.name}
                        checked={field.value}
                        onChange={() => {
                            form.setValue('begrunnValg', !field.value);
                            form.setValue('begrunnelse', null);
                        }}
                    >
                        {formatMessage('begrunnelse.vil.begrunne')}
                    </Checkbox>
                )}
            />
            {begrunnValg && (
                <Controller
                    control={form.control}
                    name={'begrunnelse'}
                    render={({ field, fieldState }) => (
                        <Textarea
                            {...field}
                            label={formatMessage('begrunnelse')}
                            value={field.value ?? ''}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            )}
            {RemoteData.isFailure(lagreStatus) && <ApiErrorAlert error={lagreStatus.error} />}
            {RemoteData.isFailure(sendTilAttesteringStatus) && <ApiErrorAlert error={sendTilAttesteringStatus.error} />}

            <Navigasjonsknapper
                neste={{
                    tekst: formatMessage('navigasjonsknapp.nesteTekst.sendTilAttestering'),
                    loading: isLoading,
                }}
                tilbake={{ url: props.forrigeUrl }}
            />
        </form>
    );
};
