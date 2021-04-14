import * as RemoteData from '@devexperts/remote-data-ts';
import { AsyncThunk } from '@reduxjs/toolkit';
import { useFormik, FormikErrors } from 'formik';
import { AlertStripeFeil, AlertStripeSuksess, AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import { Textarea, Checkbox, Radio } from 'nav-frontend-skjema';
import { Innholdstittel } from 'nav-frontend-typografi';
import React, { useCallback, useState } from 'react';
import { IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';

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
} from '~types/Revurdering';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';
import { erRevurderingIngenEndring } from '../revurderingUtils';

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

function BrevInputPro<T>(props: {
    tekst: string;
    fn: AsyncThunk<{ objectUrl: string }, T, { rejectValue: ApiError }>;
    fnArgs: T;
    handleChange: (e: React.ChangeEvent<unknown>) => void;
    intl: IntlShape;
    tittel: string;
    placeholder?: string;
}) {
    const dispatch = useAppDispatch();
    const [hentBrevStatus, setHentBrevStatus] = useState<RemoteData.RemoteData<ApiError | undefined, null>>(
        RemoteData.initial
    );

    const onHentBrev = async () => {
        if (RemoteData.isPending(hentBrevStatus)) return;

        setHentBrevStatus(RemoteData.pending);
        const response = await dispatch(props.fn(props.fnArgs));

        if (props.fn.fulfilled.match(response)) {
            setHentBrevStatus(RemoteData.success(null));
            window.open(response.payload.objectUrl);
        }
    };

    return (
        <div className={styles.brevContainer}>
            <div className={styles.textAreaContainer}>
                <Textarea
                    label={props.tittel}
                    name="tekstTilVedtaksbrev"
                    placeholder={props.placeholder}
                    value={props.tekst ?? ''}
                    onChange={props.handleChange}
                />
            </div>
            <div className={styles.seBrevContainer}>
                <Knapp onClick={onHentBrev} htmlType="button" spinner={RemoteData.isPending(hentBrevStatus)} mini>
                    {props.intl.formatMessage({ id: 'knapp.seVedtaksbrev' })}
                </Knapp>
                {RemoteData.isFailure(hentBrevStatus) && (
                    <AlertStripeFeil>
                        {hentBrevStatus?.error?.body?.message || props.intl.formatMessage({ id: 'feil.ukjentFeil' })}
                    </AlertStripeFeil>
                )}
            </div>
        </div>
    );
}

const RevurderingsOppsummering = (props: {
    sakId: string;
    revurdering: SimulertRevurdering | BeregnetIngenEndring | UnderkjentRevurdering;
}) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });
    const dispatch = useAppDispatch();
    const [sendtTilAttesteringStatus, setSendtTilAttesteringStatus] = useState<
        RemoteData.RemoteData<ApiError, RevurderingTilAttestering>
    >(RemoteData.initial);
    const [hentBrevStatus, setHentBrevStatus] = useState<RemoteData.RemoteData<ApiError | undefined, null>>(
        RemoteData.initial
    );
    const [skalForhåndsvarsle, setSkalForhåndsvarsle] = useState(true);
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
                </div>
                {props.revurdering.status === RevurderingsStatus.SIMULERT_OPPHØRT && (
                    <div className={styles.opphørsadvarsel}>
                        <AlertStripeAdvarsel>
                            {intl.formatMessage({ id: 'revurdering.opphør.advarsel' })}
                        </AlertStripeAdvarsel>
                    </div>
                )}
                {erRevurderingIngenEndring(props.revurdering) ? (
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
                    <>
                        <Radio
                            label="Ja"
                            name="forshåndsvarsel"
                            onChange={() => setSkalForhåndsvarsle(true)}
                            defaultChecked={skalForhåndsvarsle}
                        />
                        <Radio
                            label="Nei"
                            name="forshåndsvarsel"
                            onChange={() => setSkalForhåndsvarsle(false)}
                            defaultChecked={!skalForhåndsvarsle}
                        />
                        {skalForhåndsvarsle ? (
                            <BrevInputPro
                                tittel={'Skal bruker forhåndsvarsles?'}
                                tekst={formik.values.tekstTilVedtaksbrev ?? ''}
                                fn={revurderingSlice.forhåndsvarsleRevurdering}
                                fnArgs={{
                                    sakId: props.sakId,
                                    revurderingId: props.revurdering?.id ?? '',
                                    fritekstTilBrev: formik.values.tekstTilVedtaksbrev ?? '',
                                }}
                                handleChange={formik.handleChange}
                                intl={intl}
                            />
                        ) : (
                            <BrevInput
                                values={formik.values}
                                hentBrevStatus={hentBrevStatus}
                                errors={formik.errors}
                                hentBrev={hentBrev}
                                handleChange={formik.handleChange}
                                intl={intl}
                            />
                        )}
                    </>
                )}

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
