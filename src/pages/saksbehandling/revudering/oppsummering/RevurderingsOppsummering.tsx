import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { Textarea } from 'nav-frontend-skjema';
import { Feilmelding, Innholdstittel } from 'nav-frontend-typografi';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import * as revurderingSlice from '~features/revurdering/revurdering.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import VisBeregning from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/VisBeregning';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import { Beregning } from '~types/Beregning';

import messages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';

import styles from './revurderingsOppsummering.module.less';

interface OppsummeringFormData {
    gammelBeregning: Nullable<Beregning>;
    nyBeregning: Beregning;
    tekstTilVedtaksbrev: Nullable<string>;
}

const schema = yup.object<OppsummeringFormData>({
    gammelBeregning: yup.object<Beregning>().required(),
    nyBeregning: yup.object<Beregning>().required(),
    tekstTilVedtaksbrev: yup.string().nullable().defined(),
});

const RevurderingsOppsummering = (props: {
    sakId: string;
    //TODO: muligens må fjernes når vi finner ut mer om hvordan brev skal fungere for revurdering
    behandlingId: Nullable<string>;
}) => {
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const intl = useI18n({ messages });
    const dispatch = useAppDispatch();

    const { beregnOgSimulerStatus, revurderingsVedtakStatus, sendTilAttesteringStatus } = useAppSelector(
        (state) => state.revurdering
    );
    if (!RemoteData.isSuccess(beregnOgSimulerStatus)) {
        return (
            <div className={sharedStyles.revurderingContainer}>
                <Innholdstittel className={sharedStyles.tittel}>
                    {intl.formatMessage({ id: 'oppsummering.tittel' })}
                </Innholdstittel>
                <div className={sharedStyles.mainContentContainer}>
                    <div>
                        <Feilmelding className={sharedStyles.feilmelding}>
                            {intl.formatMessage({ id: 'revurdering.noeGikkGalt' })}
                        </Feilmelding>
                    </div>
                    <div className={sharedStyles.knappContainer}>
                        <Link
                            className="knapp"
                            to={Routes.revurderValgtSak.createURL({
                                sakId: props.sakId,
                                steg: RevurderingSteg.EndringAvFradrag,
                            })}
                        >
                            {intl.formatMessage({ id: 'knapp.forrige' })}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const hentBrev = useCallback(() => {
        if (RemoteData.isPending(revurderingsVedtakStatus)) {
            return;
        }

        dispatch(
            revurderingSlice.fetchRevurderingsVedtak({ sakId: props.sakId, behandlingId: props.behandlingId! })
        ).then((action) => {
            if (revurderingSlice.fetchRevurderingsVedtak.fulfilled.match(action)) {
                window.open(action.payload.objectUrl);
            }
        });
    }, [props.sakId]);

    const formik = useFormik({
        initialValues: {
            gammelBeregning: beregnOgSimulerStatus.value.beregning,
            nyBeregning: beregnOgSimulerStatus.value.revurdert,
            tekstTilVedtaksbrev: null,
        },
        async onSubmit(values) {
            console.log(values);
            dispatch(
                revurderingSlice.sendTilAttestering({
                    sakId: props.sakId,
                    gammelBeregning: values.gammelBeregning,
                    nyBeregning: values.nyBeregning,
                    tekstTilVedtaksbrev: values.tekstTilVedtaksbrev,
                })
            );
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });
    console.log(beregnOgSimulerStatus.value);
    console.log(formik.values);
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
                        beregning={formik.values.gammelBeregning}
                    />

                    {RemoteData.isSuccess(beregnOgSimulerStatus) && (
                        <VisBeregning
                            beregningsTittel={intl.formatMessage({ id: 'oppsummering.nyBeregning.tittel' })}
                            beregning={formik.values.nyBeregning}
                        />
                    )}
                </div>
                <div className={styles.brevContainer}>
                    <div className={styles.textAreaContainer}>
                        <Textarea
                            label={intl.formatMessage({ id: 'oppsummering.tekstTilVedtaksbrev.tittel' })}
                            name="tekstTilVedtaksbrev"
                            placeholder="Skriv inn innholdstekst i tekstfeltet her."
                            value={formik.values.tekstTilVedtaksbrev ?? ''}
                            feil={formik.errors.tekstTilVedtaksbrev}
                            onChange={formik.handleChange}
                        />
                    </div>
                    <div className={styles.seBrevContainer}>
                        <Knapp
                            onClick={hentBrev}
                            htmlType="button"
                            spinner={RemoteData.isPending(revurderingsVedtakStatus)}
                        >
                            {intl.formatMessage({ id: 'knapp.seVedtaksbrev' })}
                        </Knapp>
                        {RemoteData.isFailure(revurderingsVedtakStatus) && (
                            <AlertStripeFeil>{revurderingsVedtakStatus.error.body?.message}</AlertStripeFeil>
                        )}
                    </div>
                </div>
                {RemoteData.isFailure(sendTilAttesteringStatus) && (
                    <AlertStripeFeil className={sharedStyles.alertstripe}>
                        {sendTilAttesteringStatus.error.body?.message}
                    </AlertStripeFeil>
                )}
                <div className={sharedStyles.knappContainer}>
                    <Link
                        className="knapp"
                        to={Routes.revurderValgtSak.createURL({
                            sakId: props.sakId,
                            steg: RevurderingSteg.EndringAvFradrag,
                        })}
                    >
                        {intl.formatMessage({ id: 'knapp.forrige' })}
                    </Link>
                    <Hovedknapp>{intl.formatMessage({ id: 'knapp.sendTilAttestering' })}</Hovedknapp>
                </div>
            </div>
        </form>
    );
};

export default RevurderingsOppsummering;
