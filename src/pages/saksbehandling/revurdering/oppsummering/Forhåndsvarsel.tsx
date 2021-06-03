import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import * as pdfApi from '~api/pdfApi';
import { Revurderingshandling } from '~api/revurderingApi';
import { BrevInput } from '~components/brevInput/BrevInput';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { RevurderingTilAttestering, SimulertRevurdering } from '~types/Revurdering';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';

interface FormData {
    revurderingshandling: Nullable<Revurderingshandling>;
    fritekstTilBrev: Nullable<string>;
}

const schema = yup.object<FormData>({
    revurderingshandling: yup.mixed().required().defined().oneOf(Object.values(Revurderingshandling)),
    fritekstTilBrev: yup.string(),
});

const Forhåndsvarsel = (props: {
    sakId: string;
    revurdering: SimulertRevurdering;
    intl: IntlShape;
    forrigeUrl: string;
}) => {
    const [status, setStatus] = useState<RemoteData.RemoteData<ApiError, null | RevurderingTilAttestering>>(
        RemoteData.initial
    );

    const history = useHistory();
    const dispatch = useAppDispatch();

    const form = useForm<FormData>({
        defaultValues: {
            revurderingshandling: null,
        },
        resolver: yupResolver(schema),
    });

    const handleSubmit = async (data: FormData) => {
        if (data.revurderingshandling === null) {
            return;
        }
        setStatus(RemoteData.pending);

        const forhåndsvarselRes = await dispatch(
            revurderingActions.forhåndsvarsleEllerSendTilAttestering({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                revurderingshandling: data.revurderingshandling,
                fritekstTilBrev: data.fritekstTilBrev ?? '',
            })
        );

        if (revurderingActions.forhåndsvarsleEllerSendTilAttestering.rejected.match(forhåndsvarselRes)) {
            //TODO: fix at res.payload kan være undefined?
            if (!forhåndsvarselRes.payload) return;
            setStatus(RemoteData.failure(forhåndsvarselRes.payload));
        }

        if (revurderingActions.forhåndsvarsleEllerSendTilAttestering.fulfilled.match(forhåndsvarselRes)) {
            setStatus(RemoteData.success(null));

            if (data.revurderingshandling === Revurderingshandling.Forhåndsvarsle) {
                history.push(
                    Routes.createSakIntroLocation(
                        props.intl.formatMessage({ id: 'forhåndsvarsling.sendtForhåndsvarsling' }),
                        props.sakId
                    )
                );
            } else {
                history.push(
                    Routes.createSakIntroLocation(
                        props.intl.formatMessage({ id: 'oppsummering.sendtTilAttestering' }),
                        props.sakId
                    )
                );
            }
        }
    };

    const handleVisForhåndsvarselClick = () =>
        pdfApi.fetchBrevutkastForForhåndsvarsel(
            props.sakId,
            props.revurdering.id,
            form.getValues('fritekstTilBrev') ?? ''
        );

    const handleVisVedtaksbrevClick = () =>
        pdfApi.fetchBrevutkastForRevurderingWithFritekst({
            sakId: props.sakId,
            revurderingId: props.revurdering.id,
            fritekst: form.getValues('fritekstTilBrev') ?? '',
        });

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Controller
                control={form.control}
                name="revurderingshandling"
                render={({ field, fieldState }) => (
                    <RadioGruppe legend="Skal bruker forhåndsvarsles?" feil={fieldState.error?.message}>
                        <Radio
                            label="Ja"
                            name="revurderingshandling"
                            onChange={() => field.onChange(Revurderingshandling.Forhåndsvarsle)}
                        />
                        <Radio
                            label="Nei"
                            name="revurderingshandling"
                            onChange={() => field.onChange(Revurderingshandling.SendTilAttestering)}
                        />
                    </RadioGruppe>
                )}
            />
            {form.watch('revurderingshandling') !== null && (
                <Controller
                    control={form.control}
                    name="fritekstTilBrev"
                    render={({ field, fieldState }) => (
                        <BrevInput
                            tittel={
                                form.getValues('revurderingshandling') == Revurderingshandling.Forhåndsvarsle
                                    ? props.intl.formatMessage({ id: 'oppsummering.tekstTilForhåndsvarsel.tittel' })
                                    : props.intl.formatMessage({ id: 'oppsummering.tekstTilVedtaksbrev.tittel' })
                            }
                            placeholder={props.intl.formatMessage({
                                id: 'oppsummering.tekstTilVedtaksbrev.placeholder',
                            })}
                            tekst={form.getValues('fritekstTilBrev') ?? ''}
                            onChange={field.onChange}
                            onVisBrevClick={
                                form.getValues('revurderingshandling') == Revurderingshandling.Forhåndsvarsle
                                    ? handleVisForhåndsvarselClick
                                    : handleVisVedtaksbrevClick
                            }
                            intl={props.intl}
                            feil={fieldState.error}
                        />
                    )}
                />
            )}

            {RemoteData.isFailure(status) && <RevurderingskallFeilet error={status.error} />}

            <RevurderingBunnknapper
                onNesteClick={'submit'}
                nesteKnappTekst={
                    form.getValues('revurderingshandling') === Revurderingshandling.Forhåndsvarsle
                        ? 'Send forhåndsvarsel'
                        : props.intl.formatMessage({ id: 'knapp.sendTilAttestering' })
                }
                tilbakeUrl={props.forrigeUrl}
                onNesteClickSpinner={RemoteData.isPending(status)}
            />
        </form>
    );
};

export default Forhåndsvarsel;
