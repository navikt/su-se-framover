import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { Textarea } from 'nav-frontend-skjema';
import { Feilmelding, Innholdstittel } from 'nav-frontend-typografi';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import { sendTilAttestering } from '~api/revurderingApi';
import * as revurderingSlice from '~features/revurdering/revurdering.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import VisBeregning from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/VisBeregning';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import { OpprettetRevurdering, TilAttesteringRevurdering } from '~types/Revurdering';

import messages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';

import styles from './revurderingsOppsummering.module.less';

interface OppsummeringFormData {
    tekstTilVedtaksbrev: Nullable<string>;
}

const schema = yup.object<OppsummeringFormData>({
    tekstTilVedtaksbrev: yup.string().nullable().defined(),
});

const RevurderingsOppsummering = (props: { sakId: string; revurdering: Nullable<OpprettetRevurdering> }) => {
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const intl = useI18n({ messages });
    const dispatch = useAppDispatch();
    const [sendtTilAttesteringStatus, setSendtTilAttesteringStatus] = useState<
        RemoteData.RemoteData<ApiError, TilAttesteringRevurdering>
    >(RemoteData.initial);

    const { beregnOgSimulerStatus, revurderingsVedtakStatus } = useAppSelector((state) => state.revurdering);

    const hentBrev = useCallback(
        (fritekst: Nullable<string>) => {
            if (RemoteData.isPending(revurderingsVedtakStatus)) {
                return;
            }

            dispatch(
                revurderingSlice.fetchRevurderingsVedtak({
                    sakId: props.sakId,
                    revurderingId: props.revurdering?.id ?? '',
                    fritekst,
                })
            ).then((action) => {
                if (revurderingSlice.fetchRevurderingsVedtak.fulfilled.match(action)) {
                    window.open(action.payload.objectUrl);
                }
            });
        },
        [props.sakId]
    );

    const formik = useFormik({
        initialValues: {
            tekstTilVedtaksbrev: null,
        },
        async onSubmit() {
            if (!props.revurdering?.id) {
                return;
            }

            setSendtTilAttesteringStatus(RemoteData.pending);
            const res = await sendTilAttestering(props.sakId, props.revurdering.id);

            if (res.status === 'error') {
                setSendtTilAttesteringStatus(RemoteData.failure(res.error));
                return;
            }
            setSendtTilAttesteringStatus(RemoteData.success(res.data));
            dispatch(revurderingSlice.default.actions.reset());
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const VisFeilmelding = () => (
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

    return pipe(
        beregnOgSimulerStatus,
        RemoteData.fold(
            () => <VisFeilmelding />,
            () => null,
            () => <VisFeilmelding />,
            (beregninger) => (
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
                                beregning={beregninger.beregning}
                            />

                            {RemoteData.isSuccess(beregnOgSimulerStatus) && (
                                <VisBeregning
                                    beregningsTittel={intl.formatMessage({ id: 'oppsummering.nyBeregning.tittel' })}
                                    beregning={beregninger.revurdert}
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
                                    onClick={() => hentBrev(formik.values.tekstTilVedtaksbrev)}
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
                        {RemoteData.isFailure(sendtTilAttesteringStatus) && (
                            <AlertStripeFeil className={sharedStyles.alertstripe}>
                                {sendtTilAttesteringStatus.error.body?.message}
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
                            <Hovedknapp spinner={RemoteData.isPending(sendtTilAttesteringStatus)}>
                                {intl.formatMessage({ id: 'knapp.sendTilAttestering' })}
                            </Hovedknapp>
                        </div>
                    </div>
                </form>
            )
        )
    );
};

export default RevurderingsOppsummering;
