import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router';

import { ApiError } from '~api/apiClient';
import * as pdfApi from '~api/pdfApi';
import { BrevInput } from '~components/brevInput/BrevInput';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppDispatch } from '~redux/Store';
import { BeslutningEtterForhåndsvarsling, RevurderingTilAttestering, SimulertRevurdering } from '~types/Revurdering';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';

import styles from './revurderingsOppsummering.module.less';

interface FormData {
    resultatEtterForhåndsvarsel: Nullable<BeslutningEtterForhåndsvarsling>;
    tekstTilVedtaksbrev: string;
    begrunnelse: string;
}

const schema = yup.object<FormData>({
    resultatEtterForhåndsvarsel: yup
        .mixed()
        .oneOf(Object.values(BeslutningEtterForhåndsvarsling), 'Feltet må fylles ut')
        .required(),
    tekstTilVedtaksbrev: yup.string(),
    begrunnelse: yup.string(),
});

const EtterForhåndsvarsel = (props: { sakId: string; revurdering: SimulertRevurdering; intl: IntlShape }) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [sendtTilAttesteringStatus, setSendtTilAttesteringStatus] = useState<
        RemoteData.RemoteData<ApiError, RevurderingTilAttestering | SimulertRevurdering>
    >(RemoteData.initial);

    const form = useForm<FormData>({
        defaultValues: {
            resultatEtterForhåndsvarsel: null,
            tekstTilVedtaksbrev: '',
            begrunnelse: '',
        },
        resolver: yupResolver(schema),
    });

    const handleSubmit = async (data: FormData) => {
        if (!data.resultatEtterForhåndsvarsel) {
            return;
        }
        setSendtTilAttesteringStatus(RemoteData.pending);

        const res = await dispatch(
            revurderingActions.fortsettEtterForhåndsvarsel({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                begrunnelse: data.begrunnelse,
                valg: data.resultatEtterForhåndsvarsel,
                fritekstTilBrev: data.tekstTilVedtaksbrev,
            })
        );

        if (revurderingActions.fortsettEtterForhåndsvarsel.rejected.match(res)) {
            //TODO: fix at res.payload kan være undefined?
            if (!res.payload) return;
            setSendtTilAttesteringStatus(RemoteData.failure(res.payload));
        }

        if (revurderingActions.fortsettEtterForhåndsvarsel.fulfilled.match(res)) {
            setSendtTilAttesteringStatus(RemoteData.success(res.payload));
            if (data.resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.FortsettMedAndreOpplysninger) {
                history.push(
                    Routes.revurderValgtRevurdering.createURL({
                        sakId: props.sakId,
                        steg: RevurderingSteg.EndringAvFradrag,
                        revurderingId: props.revurdering.id,
                    })
                );
                return;
            }

            history.push(
                Routes.createSakIntroLocation(
                    props.intl.formatMessage({ id: 'oppsummering.sendtTilAttestering' }),
                    props.sakId
                )
            );
        }
    };

    const handleVisBrevClick = async () =>
        await pdfApi.fetchBrevutkastForRevurderingWithFritekst(
            props.sakId,
            props.revurdering.id,
            form.getValues('tekstTilVedtaksbrev')
        );

    const watch = form.watch();

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Controller
                control={form.control}
                name="resultatEtterForhåndsvarsel"
                render={({ field, fieldState }) => (
                    <RadioGruppe
                        legend={props.intl.formatMessage({ id: 'etterForhåndsvarsel.resultatEtterForhåndsvarsel' })}
                        feil={fieldState.error?.message}
                        className={styles.resultatEtterForhåndsvarselContainer}
                    >
                        <Radio
                            label={props.intl.formatMessage({
                                id: 'etterForhåndsvarsel.resultatEtterForhåndsvarsel.sammeOpplysninger',
                            })}
                            name="resultatEtterForhåndsvarsel"
                            onChange={() => field.onChange(BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger)}
                        />
                        <Radio
                            label={props.intl.formatMessage({
                                id: 'etterForhåndsvarsel.resultatEtterForhåndsvarsel.andreOpplysninger',
                            })}
                            name="resultatEtterForhåndsvarsel"
                            onChange={() =>
                                field.onChange(BeslutningEtterForhåndsvarsling.FortsettMedAndreOpplysninger)
                            }
                        />
                        <Radio
                            label={props.intl.formatMessage({
                                id: 'etterForhåndsvarsel.resultatEtterForhåndsvarsel.avsluttesUtenEndring',
                            })}
                            name="resultatEtterForhåndsvarsel"
                            onChange={() => field.onChange(BeslutningEtterForhåndsvarsling.AvsluttUtenEndringer)}
                            disabled={true}
                        />
                    </RadioGruppe>
                )}
            />

            <Controller
                control={form.control}
                name="begrunnelse"
                render={({ field }) => (
                    <div className={styles.etterForhåndsvarselBegrunnelseContainer}>
                        <Textarea
                            {...field}
                            label={props.intl.formatMessage({ id: 'etterForhåndsvarsel.begrunnelse.label' })}
                        />
                    </div>
                )}
            />

            {(watch.resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger ||
                watch.resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.AvsluttUtenEndringer) && (
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
            )}

            {RemoteData.isFailure(sendtTilAttesteringStatus) && (
                <RevurderingskallFeilet error={sendtTilAttesteringStatus.error} />
            )}
            <RevurderingBunnknapper
                onNesteClick={'submit'}
                nesteKnappTekst={
                    watch.resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger
                        ? props.intl.formatMessage({ id: 'knapp.sendTilAttestering' })
                        : watch.resultatEtterForhåndsvarsel === BeslutningEtterForhåndsvarsling.AvsluttUtenEndringer
                        ? props.intl.formatMessage({ id: 'knapp.sendtBrevOgAvslutt' })
                        : undefined
                }
                tilbakeUrl={Routes.saksoversiktValgtSak.createURL({
                    sakId: props.sakId,
                })}
                onNesteClickSpinner={RemoteData.isPending(sendtTilAttesteringStatus)}
            />
        </form>
    );
};

export default EtterForhåndsvarsel;
