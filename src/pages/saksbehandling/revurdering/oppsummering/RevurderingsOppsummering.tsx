import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik, FormikErrors } from 'formik';
import { AlertStripeFeil, AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import { Textarea, Checkbox } from 'nav-frontend-skjema';
import { Innholdstittel } from 'nav-frontend-typografi';
import React, { useCallback, useState } from 'react';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import RevurderingIngenEndringAlert from '~components/revurdering/RevurderingIngenEndringAlert';
import RevurderingÅrsakOgBegrunnelse from '~components/revurdering/RevurderingÅrsakOgBegrunnelse';
import * as revurderingSlice from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import VisBeregning from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/VisBeregning';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppDispatch } from '~redux/Store';
import {
    SimulertRevurdering,
    RevurderingTilAttestering,
    BeregnetIngenEndring,
    RevurderingsStatus,
    UnderkjentRevurdering,
    harSimulering,
} from '~types/Revurdering';

import { Utbetalingssimulering } from '../../steg/beregningOgSimulering/simulering/simulering';
import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';
import { erGregulering, erRevurderingIngenEndring } from '../revurderingUtils';

import messages from './revurderingOppsummering-nb';
import styles from './revurderingsOppsummering.module.less';

interface OppsummeringFormData {
    skalFøreTilBrevutsending: boolean;
    tekstTilVedtaksbrev?: Nullable<string>;
}

const schema = yup.object<OppsummeringFormData>({
    tekstTilVedtaksbrev: yup.string().nullable(),
    skalFøreTilBrevutsending: yup.boolean(),
});

const BrevInput = (props: {
    values: OppsummeringFormData;
    hentBrevStatus: RemoteData.RemoteData<ApiError | undefined, null>;
    errors: FormikErrors<OppsummeringFormData>;
    hentBrev: (fritekst?: Nullable<string>) => void;
    handleChange: (e: React.ChangeEvent<unknown>) => void;
    intl: IntlShape;
}) => (
    <div className={styles.brevContainer}>
        <div className={styles.textAreaContainer}>
            <Textarea
                label={props.intl.formatMessage({ id: 'oppsummering.tekstTilVedtaksbrev.tittel' })}
                name="tekstTilVedtaksbrev"
                placeholder={props.intl.formatMessage({
                    id: 'oppsummering.tekstTilVedtaksbrev.placeholder',
                })}
                value={props.values.tekstTilVedtaksbrev ?? ''}
                feil={props.errors.tekstTilVedtaksbrev}
                onChange={props.handleChange}
            />
        </div>
        <div className={styles.seBrevContainer}>
            <Knapp
                onClick={() => props.hentBrev(props.values.tekstTilVedtaksbrev)}
                htmlType="button"
                spinner={RemoteData.isPending(props.hentBrevStatus)}
                mini
            >
                {props.intl.formatMessage({ id: 'knapp.seVedtaksbrev' })}
            </Knapp>
            {RemoteData.isFailure(props.hentBrevStatus) && (
                <AlertStripeFeil>
                    {props.hentBrevStatus?.error?.body?.message || props.intl.formatMessage({ id: 'feil.ukjentFeil' })}
                </AlertStripeFeil>
            )}
        </div>
    </div>
);

const RevurderingsOppsummering = (props: {
    sakId: string;
    revurdering: SimulertRevurdering | BeregnetIngenEndring | UnderkjentRevurdering;
}) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [sendtTilAttesteringStatus, setSendtTilAttesteringStatus] = useState<
        RemoteData.RemoteData<ApiError, RevurderingTilAttestering>
    >(RemoteData.initial);
    const [hentBrevStatus, setHentBrevStatus] = useState<RemoteData.RemoteData<ApiError | undefined, null>>(
        RemoteData.initial
    );
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

    const hentBrev = useCallback(
        (fritekst?: Nullable<string>) => {
            if (RemoteData.isPending(hentBrevStatus)) {
                return;
            }
            setHentBrevStatus(RemoteData.pending);

            dispatch(
                revurderingSlice.fetchBrevutkastWithFritekst({
                    sakId: props.sakId,
                    revurderingId: props.revurdering?.id ?? '',
                    fritekst: fritekst ?? '',
                })
            ).then((action) => {
                if (revurderingSlice.fetchBrevutkastWithFritekst.fulfilled.match(action)) {
                    setHentBrevStatus(RemoteData.success(null));
                    window.open(action.payload.objectUrl);
                } else {
                    setHentBrevStatus(RemoteData.failure(action.payload));
                }
            });
        },
        [props.sakId, hentBrevStatus]
    );

    const skalFøreTilBrevutsendingInitialValue = () => {
        const skalFøreTilBrevutsending = (props.revurdering as UnderkjentRevurdering).skalFøreTilBrevutsending;
        if (skalFøreTilBrevutsending) {
            return skalFøreTilBrevutsending;
        }
        return erRevurderingIngenEndring(props.revurdering) ? false : true;
    };

    const formik = useFormik<OppsummeringFormData>({
        initialValues: {
            tekstTilVedtaksbrev: props.revurdering.fritekstTilBrev,
            skalFøreTilBrevutsending: skalFøreTilBrevutsendingInitialValue(),
        },
        async onSubmit(values) {
            setSendtTilAttesteringStatus(RemoteData.pending);

            const res = await dispatch(
                revurderingSlice.sendRevurderingTilAttestering({
                    sakId: props.sakId,
                    revurderingId: props.revurdering.id,
                    fritekstTilBrev: values.tekstTilVedtaksbrev ?? '',
                    skalFøreTilBrevutsending: erRevurderingIngenEndring(props.revurdering)
                        ? values.skalFøreTilBrevutsending
                        : undefined,
                })
            );

            if (revurderingSlice.sendRevurderingTilAttestering.rejected.match(res)) {
                //TODO: fix at res.payload kan være undefined?
                if (!res.payload) return;
                setSendtTilAttesteringStatus(RemoteData.failure(res.payload));
            }

            if (revurderingSlice.sendRevurderingTilAttestering.fulfilled.match(res)) {
                const message = intl.formatMessage({ id: 'oppsummering.sendtTilAttestering' });
                history.push(Routes.createSakIntroLocation(message, props.sakId));
            }
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const forrigeURL = Routes.revurderValgtRevurdering.createURL({
        sakId: props.sakId,
        steg: RevurderingSteg.EndringAvFradrag,
        revurderingId: props.revurdering.id,
    });

    const feilkodeTilFeilmelding = (feilkode: string | undefined) => {
        switch (feilkode) {
            case 'fant_ikke_revurdering':
                return intl.formatMessage({ id: 'feil.fant.ikke.revurdering' });
            case 'ugyldig_tilstand':
                return intl.formatMessage({ id: 'feil.ugyldig.tilstand' });
            case 'fant_ikke_aktør_id':
                return intl.formatMessage({ id: 'feil.fant.ikke.aktør.id' });
            case 'kunne_ikke_opprette_oppgave':
                return intl.formatMessage({ id: 'feil.kunne.ikke.opprette.oppgave' });
            default:
                return intl.formatMessage({ id: 'feil.ukjentFeil' });
        }
    };

    return (
        <form
            className={sharedStyles.revurderingContainer}
            onSubmit={(e) => {
                setHasSubmitted(true);
                formik.handleSubmit(e);
            }}
        >
            <Innholdstittel className={sharedStyles.tittel}>
                {intl.formatMessage({ id: 'oppsummering.tittel' })}
            </Innholdstittel>
            <div className={sharedStyles.mainContentContainer}>
                {erRevurderingIngenEndring(props.revurdering) && (
                    <RevurderingIngenEndringAlert className={styles.ingenEndringInfoboks} />
                )}
                <RevurderingÅrsakOgBegrunnelse
                    className={styles.årsakBegrunnelseContainer}
                    revurdering={props.revurdering}
                />
                <div className={styles.beregningContainer}>
                    <VisBeregning
                        beregningsTittel={intl.formatMessage({ id: 'oppsummering.gammelBeregning.tittel' })}
                        beregning={props.revurdering.beregninger.beregning}
                    />

                    <VisBeregning
                        beregningsTittel={intl.formatMessage({ id: 'oppsummering.nyBeregning.tittel' })}
                        beregning={props.revurdering.beregninger.revurdert}
                    />

                    {harSimulering(props.revurdering) && (
                        <Utbetalingssimulering simulering={props.revurdering.simulering} />
                    )}
                </div>
                {props.revurdering.status === RevurderingsStatus.SIMULERT_OPPHØRT && (
                    <div className={styles.opphørsadvarsel}>
                        <AlertStripeAdvarsel>
                            {intl.formatMessage({ id: 'revurdering.opphør.advarsel' })}
                        </AlertStripeAdvarsel>
                    </div>
                )}
                {!erGregulering(props.revurdering.årsak) &&
                    (erRevurderingIngenEndring(props.revurdering) ? (
                        <div className={styles.ingenEndringContainer}>
                            <Checkbox
                                label={intl.formatMessage({ id: 'oppsummering.skalFøreTilBrevutsending' })}
                                name="skalFøreTilBrevutsending"
                                className={styles.skalFøreTilBrevutsendingCheckbox}
                                checked={formik.values.skalFøreTilBrevutsending ?? false}
                                onChange={formik.handleChange}
                            />
                            {formik.values.skalFøreTilBrevutsending && (
                                <BrevInput
                                    values={formik.values}
                                    hentBrevStatus={hentBrevStatus}
                                    errors={formik.errors}
                                    hentBrev={hentBrev}
                                    handleChange={formik.handleChange}
                                    intl={intl}
                                />
                            )}
                        </div>
                    ) : (
                        <BrevInput
                            values={formik.values}
                            hentBrevStatus={hentBrevStatus}
                            errors={formik.errors}
                            hentBrev={hentBrev}
                            handleChange={formik.handleChange}
                            intl={intl}
                        />
                    ))}

                {RemoteData.isFailure(sendtTilAttesteringStatus) && (
                    <AlertStripeFeil className={sharedStyles.alertstripe}>
                        {feilkodeTilFeilmelding(sendtTilAttesteringStatus.error.body?.code)}
                    </AlertStripeFeil>
                )}
                <RevurderingBunnknapper
                    onNesteClick={'submit'}
                    nesteKnappTekst={intl.formatMessage({ id: 'knapp.sendTilAttestering' })}
                    tilbakeUrl={forrigeURL}
                    onNesteClickSpinner={RemoteData.isPending(sendtTilAttesteringStatus)}
                />
            </div>
        </form>
    );
};

export default RevurderingsOppsummering;
