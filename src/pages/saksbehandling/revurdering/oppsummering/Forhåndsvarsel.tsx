import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import * as pdfApi from '~api/pdfApi';
import { BrevInput } from '~components/brevInput/BrevInput';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppDispatch } from '~redux/Store';
import { RevurderingTilAttestering, SimulertRevurdering } from '~types/Revurdering';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';

interface FormData {
    skalForhåndsvarsle: Nullable<boolean>;
    fritekstTilBrev: Nullable<string>;
}

const schema = yup.object<FormData>({
    skalForhåndsvarsle: yup.boolean().required().defined(),
    fritekstTilBrev: yup.string(),
});

const Forhåndsvarsel = (props: { sakId: string; revurdering: SimulertRevurdering; intl: IntlShape }) => {
    const [status, setStatus] = useState<RemoteData.RemoteData<ApiError, null | RevurderingTilAttestering>>(
        RemoteData.initial
    );

    const history = useHistory();
    const dispatch = useAppDispatch();

    const form = useForm<FormData>({
        defaultValues: {
            skalForhåndsvarsle: null,
        },
        resolver: yupResolver(schema),
    });

    const handleSubmit = (data: FormData) => {
        if (data.skalForhåndsvarsle) {
            submitForhåndsvarsel(data);
        } else {
            submitTilAttestering(data);
        }
    };

    const submitForhåndsvarsel = async (data: FormData) => {
        setStatus(RemoteData.pending);

        const res = await dispatch(
            revurderingActions.forhåndsvarsleRevurdering({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                fritekstTilBrev: data.fritekstTilBrev ?? '',
            })
        );

        if (revurderingActions.forhåndsvarsleRevurdering.rejected.match(res)) {
            //TODO: fix at res.payload kan være undefined?
            if (!res.payload) return;
            setStatus(RemoteData.failure(res.payload));
        }

        if (revurderingActions.forhåndsvarsleRevurdering.fulfilled.match(res)) {
            setStatus(RemoteData.success(null));
            history.push({
                pathname: Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }),
                state: { harForhåndsvarslet: true },
            });
        }
    };

    const submitTilAttestering = async (data: FormData) => {
        setStatus(RemoteData.pending);

        const res = await dispatch(
            revurderingActions.sendRevurderingTilAttestering({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                fritekstTilBrev: data.fritekstTilBrev ?? '',
                skalFøreTilBrevutsending: undefined,
            })
        );

        if (revurderingActions.sendRevurderingTilAttestering.rejected.match(res)) {
            //TODO: fix at res.payload kan være undefined?
            if (!res.payload) return;
            setStatus(RemoteData.failure(res.payload));
        }

        if (revurderingActions.sendRevurderingTilAttestering.fulfilled.match(res)) {
            setStatus(RemoteData.success(res.payload));
            history.push({
                pathname: Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }),
                state: { sendtTilAttestering: true },
            });
        }
    };

    const forrigeURL = Routes.revurderValgtRevurdering.createURL({
        sakId: props.sakId,
        steg: RevurderingSteg.EndringAvFradrag,
        revurderingId: props.revurdering.id,
    });

    const handleVisBrevClick = async () =>
        await pdfApi.fetchBrevutkastForRevurderingWithFritekst(
            props.sakId,
            props.revurdering.id,
            form.getValues('fritekstTilBrev') ?? ''
        );

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Controller
                control={form.control}
                name="skalForhåndsvarsle"
                render={({ field, fieldState }) => (
                    <RadioGruppe legend="Skal bruker forhåndsvarsles?" feil={fieldState.error?.message}>
                        <Radio label="Ja" name="skalForhåndsvarsle" onChange={() => field.onChange(true)} />
                        <Radio label="Nei" name="skalForhåndsvarsle" onChange={() => field.onChange(false)} />
                    </RadioGruppe>
                )}
            />
            {form.watch('skalForhåndsvarsle') !== null && (
                <Controller
                    control={form.control}
                    name="fritekstTilBrev"
                    render={({ field, fieldState }) => (
                        <BrevInput
                            tittel={
                                form.getValues('skalForhåndsvarsle')
                                    ? 'Tekst til forhåndsvarsel'
                                    : props.intl.formatMessage({ id: 'oppsummering.tekstTilVedtaksbrev.tittel' })
                            }
                            placeholder={props.intl.formatMessage({
                                id: 'oppsummering.tekstTilVedtaksbrev.placeholder',
                            })}
                            tekst={form.getValues('fritekstTilBrev') ?? ''}
                            onChange={field.onChange}
                            onVisBrevClick={handleVisBrevClick}
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
                    form.getValues('skalForhåndsvarsle')
                        ? 'Send forhåndsvarsel'
                        : props.intl.formatMessage({ id: 'knapp.sendTilAttestering' })
                }
                tilbakeUrl={forrigeURL}
                onNesteClickSpinner={RemoteData.isPending(status)}
            />
        </form>
    );
};

export default Forhåndsvarsel;
