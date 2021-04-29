import * as RemoteData from '@devexperts/remote-data-ts';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import * as pdfApi from '~api/pdfApi';
import { BrevInput } from '~components/brevInput/BrevInput';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import * as Routes from '~lib/routes';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppDispatch } from '~redux/Store';
import { RevurderingTilAttestering, SimulertRevurdering } from '~types/Revurdering';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';

interface FormData {
    tekstTilVedtaksbrev: string;
}

const ForhåndsvarslingBesluttet = (props: { sakId: string; revurdering: SimulertRevurdering; intl: IntlShape }) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [sendtTilAttesteringStatus, setSendtTilAttesteringStatus] = useState<
        RemoteData.RemoteData<ApiError, RevurderingTilAttestering>
    >(RemoteData.initial);

    const form = useForm<FormData>({
        defaultValues: {
            tekstTilVedtaksbrev: '',
        },
    });

    const handleSubmit = async (data: FormData) => {
        setSendtTilAttesteringStatus(RemoteData.pending);

        const res = await dispatch(
            revurderingActions.sendRevurderingTilAttestering({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                fritekstTilBrev: data.tekstTilVedtaksbrev,
            })
        );

        if (revurderingActions.sendRevurderingTilAttestering.rejected.match(res)) {
            //TODO: fix at res.payload kan være undefined?
            if (!res.payload) return;
            setSendtTilAttesteringStatus(RemoteData.failure(res.payload));
        }

        if (revurderingActions.sendRevurderingTilAttestering.fulfilled.match(res)) {
            setSendtTilAttesteringStatus(RemoteData.success(res.payload));

            history.push(
                Routes.createSakIntroLocation(
                    props.intl.formatMessage({ id: 'oppsummering.sendtTilAttestering' }),
                    props.sakId
                )
            );
        }
    };

    const handleVisBrevClick = () =>
        pdfApi.fetchBrevutkastForRevurderingWithFritekst(
            props.sakId,
            props.revurdering.id,
            form.getValues('tekstTilVedtaksbrev')
        );

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Controller
                control={form.control}
                name="tekstTilVedtaksbrev"
                render={({ field, fieldState }) => (
                    <BrevInput
                        tittel={props.intl.formatMessage({ id: 'oppsummering.tekstTilVedtaksbrev.tittel' })}
                        placeholder={props.intl.formatMessage({
                            id: 'oppsummering.tekstTilVedtaksbrev.placeholder',
                        })}
                        tekst={form.getValues('tekstTilVedtaksbrev')}
                        onChange={field.onChange}
                        onVisBrevClick={handleVisBrevClick}
                        intl={props.intl}
                        feil={fieldState.error}
                    />
                )}
            />

            <RevurderingBunnknapper
                onNesteClick={'submit'}
                nesteKnappTekst={props.intl.formatMessage({ id: 'knapp.sendTilAttestering' })}
                tilbakeUrl={Routes.revurderValgtRevurdering.createURL({
                    sakId: props.sakId,
                    steg: RevurderingSteg.EndringAvFradrag,
                    revurderingId: props.revurdering.id,
                })}
                onNesteClickSpinner={RemoteData.isPending(sendtTilAttesteringStatus)}
            />
        </form>
    );
};

export default ForhåndsvarslingBesluttet;
