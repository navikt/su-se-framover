import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeFeil, AlertStripeSuksess, AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { Textarea } from 'nav-frontend-skjema';
import { Innholdstittel } from 'nav-frontend-typografi';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import * as revurderingSlice from '~features/revurdering/revurderingActions';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import VisBeregning from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/VisBeregning';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppDispatch } from '~redux/Store';
import { SimulertRevurdering, RevurderingTilAttestering, BeregnetAvslag } from '~types/Revurdering';

import messages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';
import { erRevurderingBeregnetAvslag } from '../revurderingUtils';

import styles from './revurderingsOppsummering.module.less';

interface OppsummeringFormData {
    tekstTilVedtaksbrev?: Nullable<string>;
}

const schema = yup.object<OppsummeringFormData>({
    tekstTilVedtaksbrev: yup.string().nullable(),
});

const RevurderingsOppsummering = (props: { sakId: string; revurdering: SimulertRevurdering | BeregnetAvslag }) => {
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const intl = useI18n({ messages });
    const dispatch = useAppDispatch();
    const [sendtTilAttesteringStatus, setSendtTilAttesteringStatus] = useState<
        RemoteData.RemoteData<ApiError, RevurderingTilAttestering>
    >(RemoteData.initial);
    const [hentBrevStatus, setHentBrevStatus] = useState<RemoteData.RemoteData<ApiError | undefined, null>>(
        RemoteData.initial
    );

    const hentBrev = useCallback(
        (fritekst: Nullable<string>) => {
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

    const formik = useFormik({
        initialValues: {
            tekstTilVedtaksbrev: null,
        },
        async onSubmit(values) {
            setSendtTilAttesteringStatus(RemoteData.pending);

            const res = await dispatch(
                revurderingSlice.sendRevurderingTilAttestering({
                    sakId: props.sakId,
                    revurderingId: props.revurdering.id,
                    fritekstTilBrev: values.tekstTilVedtaksbrev ?? '',
                })
            );

            if (revurderingSlice.sendRevurderingTilAttestering.rejected.match(res)) {
                //TODO: fix at res.payload kan være undefined?
                if (!res.payload) return;
                setSendtTilAttesteringStatus(RemoteData.failure(res.payload));
            }

            if (revurderingSlice.sendRevurderingTilAttestering.fulfilled.match(res)) {
                setSendtTilAttesteringStatus(RemoteData.success(res.payload));
            }
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    if (RemoteData.isSuccess(sendtTilAttesteringStatus)) {
        return (
            <div className={styles.sendtTilAttesteringContainer}>
                <AlertStripeSuksess>
                    <p>{intl.formatMessage({ id: 'oppsummering.sendtTilAttestering' })}</p>
                    <Link to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}>
                        {intl.formatMessage({ id: 'oppsummering.tilSaksoversikt' })}
                    </Link>
                </AlertStripeSuksess>
            </div>
        );
    }
    const forrigeURL = Routes.revurderValgtRevurdering.createURL({
        sakId: props.sakId,
        steg: RevurderingSteg.EndringAvFradrag,
        revurderingId: props.revurdering.id,
    });

    if (erRevurderingBeregnetAvslag(props.revurdering)) {
        return (
            <div>
                <AlertStripeAdvarsel>
                    {intl.formatMessage({ id: 'oppsummering.størreEllerLik10Prosent' })}
                </AlertStripeAdvarsel>
                <Link className="knapp" to={forrigeURL}>
                    {intl.formatMessage({ id: 'knapp.forrige' })}
                </Link>
            </div>
        );
    }

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
                <div className={styles.beregningContainer}>
                    <VisBeregning
                        beregningsTittel={intl.formatMessage({ id: 'oppsummering.gammelBeregning.tittel' })}
                        beregning={props.revurdering.beregninger.beregning}
                    />

                    <VisBeregning
                        beregningsTittel={intl.formatMessage({ id: 'oppsummering.nyBeregning.tittel' })}
                        beregning={props.revurdering.beregninger.revurdert}
                    />
                </div>
                <div className={styles.brevContainer}>
                    <div className={styles.textAreaContainer}>
                        <Textarea
                            label={intl.formatMessage({ id: 'oppsummering.tekstTilVedtaksbrev.tittel' })}
                            name="tekstTilVedtaksbrev"
                            placeholder={intl.formatMessage({
                                id: 'oppsummering.tekstTilVedtaksbrev.placeholder',
                            })}
                            value={formik.values.tekstTilVedtaksbrev ?? ''}
                            feil={formik.errors.tekstTilVedtaksbrev}
                            onChange={formik.handleChange}
                        />
                    </div>
                    <div className={styles.seBrevContainer}>
                        <Knapp
                            onClick={() => hentBrev(formik.values.tekstTilVedtaksbrev)}
                            htmlType="button"
                            spinner={RemoteData.isPending(hentBrevStatus)}
                            mini
                        >
                            {intl.formatMessage({ id: 'knapp.seVedtaksbrev' })}
                        </Knapp>
                        {RemoteData.isFailure(hentBrevStatus) && (
                            <AlertStripeFeil>
                                {hentBrevStatus?.error?.body?.message ||
                                    intl.formatMessage({ id: 'oppsummering.ukjentFeil' })}
                            </AlertStripeFeil>
                        )}
                    </div>
                </div>
                {RemoteData.isFailure(sendtTilAttesteringStatus) && (
                    <AlertStripeFeil className={sharedStyles.alertstripe}>
                        {sendtTilAttesteringStatus.error.body?.message}
                    </AlertStripeFeil>
                )}
                <div className={sharedStyles.knappContainer}>
                    <Link className="knapp" to={forrigeURL}>
                        {intl.formatMessage({ id: 'knapp.forrige' })}
                    </Link>
                    <Hovedknapp spinner={RemoteData.isPending(sendtTilAttesteringStatus)}>
                        {intl.formatMessage({ id: 'knapp.sendTilAttestering' })}
                    </Hovedknapp>
                </div>
            </div>
        </form>
    );
};

export default RevurderingsOppsummering;
