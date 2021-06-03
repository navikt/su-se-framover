import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Checkbox } from 'nav-frontend-skjema';
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
import { useAppDispatch } from '~redux/Store';
import { BeregnetIngenEndring, RevurderingTilAttestering } from '~types/Revurdering';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';

import styles from './revurderingsOppsummering.module.less';

interface IngenEndringFormData {
    skalFøreTilBrevutsending: boolean;
    tekstTilVedtaksbrev: Nullable<string>;
}

const schema = yup.object<IngenEndringFormData>({
    skalFøreTilBrevutsending: yup.boolean(),
    tekstTilVedtaksbrev: yup.string().defined().when('skalFøreTilBrevutsending', {
        is: true,
        then: yup.string().required().defined(),
        otherwise: yup.string().nullable().defined(),
    }),
});

const IngenEndring = (props: {
    sakId: string;
    revurdering: BeregnetIngenEndring;
    intl: IntlShape;
    forrigeUrl: string;
}) => {
    const dispatch = useAppDispatch();
    const history = useHistory();

    const [sendtTilAttesteringStatus, setSendtTilAttesteringStatus] = useState<
        RemoteData.RemoteData<ApiError, RevurderingTilAttestering>
    >(RemoteData.initial);

    const form = useForm<IngenEndringFormData>({
        defaultValues: {
            skalFøreTilBrevutsending: false,
            tekstTilVedtaksbrev: null,
        },
        resolver: yupResolver(schema),
    });

    const handleSubmitTilAttestering = async (data: IngenEndringFormData) => {
        setSendtTilAttesteringStatus(RemoteData.pending);

        const res = await dispatch(
            revurderingActions.sendRevurderingTilAttestering({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                fritekstTilBrev: data.tekstTilVedtaksbrev ?? '',
                skalFøreTilBrevutsending: undefined,
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
        pdfApi.fetchBrevutkastForRevurderingWithFritekst({
            sakId: props.sakId,
            revurderingId: props.revurdering.id,
            fritekst: form.getValues('tekstTilVedtaksbrev') ?? '',
        });

    return (
        <form onSubmit={form.handleSubmit(handleSubmitTilAttestering)} className={styles.ingenEndringContainer}>
            <Controller
                control={form.control}
                name="skalFøreTilBrevutsending"
                render={({ field }) => (
                    <Checkbox
                        label={props.intl.formatMessage({ id: 'oppsummering.skalFøreTilBrevutsending' })}
                        name="skalFøreTilBrevutsending"
                        className={styles.skalFøreTilBrevutsendingCheckbox}
                        checked={field.value}
                        onChange={field.onChange}
                    />
                )}
            />

            {form.watch('skalFøreTilBrevutsending') && (
                <Controller
                    control={form.control}
                    name="tekstTilVedtaksbrev"
                    render={({ field, fieldState }) => (
                        <BrevInput
                            tittel={props.intl.formatMessage({ id: 'oppsummering.tekstTilVedtaksbrev.tittel' })}
                            placeholder={props.intl.formatMessage({
                                id: 'oppsummering.tekstTilVedtaksbrev.placeholder',
                            })}
                            tekst={field.value ?? ''}
                            onChange={field.onChange}
                            onVisBrevClick={handleVisBrevClick}
                            intl={props.intl}
                            feil={fieldState.error}
                        />
                    )}
                />
            )}

            {RemoteData.isFailure(sendtTilAttesteringStatus) && (
                <RevurderingskallFeilet error={sendtTilAttesteringStatus.error} />
            )}

            <RevurderingBunnknapper
                onNesteClick={'submit'}
                nesteKnappTekst={props.intl.formatMessage({ id: 'knapp.sendTilAttestering' })}
                tilbakeUrl={props.forrigeUrl}
                onNesteClickSpinner={RemoteData.isPending(sendtTilAttesteringStatus)}
            />
        </form>
    );
};

export default IngenEndring;
