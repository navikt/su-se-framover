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
import { RevurderingTilAttestering, SimulertRevurdering } from '~types/Revurdering';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';

import styles from './revurderingsOppsummering.module.less';

interface FormData {
    resultatEtterForhåndsvarsel: Nullable<ResultatVerdier>;
    tekstTilVedtaksbrev: string;
    begrunnelse: string;
}

enum ResultatVerdier {
    MED_SAMME_OPPLYSNINGER = 'med_samme_opplysninger',
    ANDRE_OPPLYSNINGER = 'andre_opplysninger',
    AVSLUTTES_UTEN_ENDRING = 'avsluttes_uten_endring',
}

const schema = yup.object<FormData>({
    resultatEtterForhåndsvarsel: yup.mixed().oneOf(Object.values(ResultatVerdier), 'Feltet må fylles ut').required(),
    tekstTilVedtaksbrev: yup.string(),
    begrunnelse: yup.string(),
});

const EtterForhåndsvarsel = (props: { sakId: string; revurdering: SimulertRevurdering; intl: IntlShape }) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [sendtTilAttesteringStatus, setSendtTilAttesteringStatus] = useState<
        RemoteData.RemoteData<ApiError, RevurderingTilAttestering>
    >(RemoteData.initial);

    const form = useForm<FormData>({
        defaultValues: {
            resultatEtterForhåndsvarsel: null,
            tekstTilVedtaksbrev: '',
            begrunnelse: '',
        },
        resolver: yupResolver(schema),
    });

    const forrigeURL = Routes.revurderValgtRevurdering.createURL({
        sakId: props.sakId,
        steg: RevurderingSteg.EndringAvFradrag,
        revurderingId: props.revurdering.id,
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
            history.push({
                pathname: Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }),
                state: { sendtTilAttestering: true },
            });
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
                            onChange={() => field.onChange(ResultatVerdier.MED_SAMME_OPPLYSNINGER)}
                        />
                        <Radio
                            label={props.intl.formatMessage({
                                id: 'etterForhåndsvarsel.resultatEtterForhåndsvarsel.andreOpplysninger',
                            })}
                            name="resultatEtterForhåndsvarsel"
                            onChange={() => field.onChange(ResultatVerdier.ANDRE_OPPLYSNINGER)}
                        />
                        <Radio
                            label={props.intl.formatMessage({
                                id: 'etterForhåndsvarsel.resultatEtterForhåndsvarsel.avsluttesUtenEndring',
                            })}
                            name="resultatEtterForhåndsvarsel"
                            onChange={() => field.onChange(ResultatVerdier.AVSLUTTES_UTEN_ENDRING)}
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

            {(watch.resultatEtterForhåndsvarsel === ResultatVerdier.MED_SAMME_OPPLYSNINGER ||
                watch.resultatEtterForhåndsvarsel === ResultatVerdier.AVSLUTTES_UTEN_ENDRING) && (
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
                    watch.resultatEtterForhåndsvarsel === ResultatVerdier.MED_SAMME_OPPLYSNINGER
                        ? props.intl.formatMessage({ id: 'knapp.sendTilAttestering' })
                        : watch.resultatEtterForhåndsvarsel === ResultatVerdier.AVSLUTTES_UTEN_ENDRING
                        ? props.intl.formatMessage({ id: 'knapp.sendtBrevOgAvslutt' })
                        : undefined
                }
                tilbakeUrl={forrigeURL}
                onNesteClickSpinner={RemoteData.isPending(sendtTilAttesteringStatus)}
            />
        </form>
    );
};

export default EtterForhåndsvarsel;
