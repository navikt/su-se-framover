import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeAdvarsel, AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { RadioPanelGruppe, Textarea, Select } from 'nav-frontend-skjema';
import { Innholdstittel, Systemtittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import * as PdfApi from '~api/pdfApi';
import { Person } from '~api/personApi';
import VisBeregning from '~components/beregningOgSimulering/beregning/VisBeregning';
import Personlinje from '~components/personlinje/Personlinje';
import RevurderingIngenEndringAlert from '~components/revurdering/RevurderingIngenEndringAlert';
import RevurderingÅrsakOgBegrunnelse from '~components/revurdering/RevurderingÅrsakOgBegrunnelse';
import * as revurderingSlice from '~features/revurdering/revurderingActions';
import RevurderingskallFeilet from '~features/revurdering/revurderingskallFeilet/RevurderingskallFeilet';
import {
    erRevurderingTilAttestering,
    erRevurderingIngenEndring,
    erGregulering,
} from '~features/revurdering/revurderingUtils';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { IverksattRevurdering, RevurderingsStatus, UnderkjentRevurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';

import SharedStyles from '../sharedStyles.module.less';

import messages from './attesterRevurdering-nb';
import styles from './attesterRevurdering.module.less';

interface FormData {
    beslutning?: boolean;
    grunn?: UnderkjennRevurderingGrunn;
    kommentar?: string;
}

export enum UnderkjennRevurderingGrunn {
    BEREGNINGEN_ER_FEIL = 'BEREGNINGEN_ER_FEIL',
    DOKUMENTASJON_MANGLER = 'DOKUMENTASJON_MANGLER',
    VEDTAKSBREVET_ER_FEIL = 'VEDTAKSBREVET_ER_FEIL',
    ANDRE_FORHOLD = 'ANDRE_FORHOLD',
}

function getTextId(grunn: UnderkjennRevurderingGrunn) {
    switch (grunn) {
        case UnderkjennRevurderingGrunn.BEREGNINGEN_ER_FEIL:
            return 'input.grunn.value.beregningErFeil';
        case UnderkjennRevurderingGrunn.DOKUMENTASJON_MANGLER:
            return 'input.grunn.value.dokumentasjonMangler';
        case UnderkjennRevurderingGrunn.VEDTAKSBREVET_ER_FEIL:
            return 'input.grunn.value.vedtaksbrevetErFeil';
        case UnderkjennRevurderingGrunn.ANDRE_FORHOLD:
            return 'input.grunn.value.andreForhold';
    }
}

const schema = yup.object<FormData>({
    beslutning: yup.boolean().required(),
    grunn: yup.mixed<UnderkjennRevurderingGrunn>().when('beslutning', {
        is: false,
        then: yup.mixed<UnderkjennRevurderingGrunn>().oneOf(Object.values(UnderkjennRevurderingGrunn)).required(),
    }),
    kommentar: yup.string().when('beslutning', {
        is: false,
        then: yup.string().required(),
    }),
});

const AttesterRevurdering = (props: { sak: Sak; søker: Person }) => {
    const urlParams = Routes.useRouteParams<typeof Routes.attesterRevurdering>();
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const [hentPdfStatus, setHentPdfStatus] = useState<RemoteData.RemoteData<ApiError, null>>(RemoteData.initial);
    const [sendtBeslutning, setSendtBeslutning] = useState<
        RemoteData.RemoteData<ApiError, IverksattRevurdering | UnderkjentRevurdering>
    >(RemoteData.initial);

    const formik = useFormik<FormData>({
        initialValues: {},
        onSubmit: async (values) => {
            if (values.beslutning) {
                setSendtBeslutning(RemoteData.pending);
                const res = await dispatch(
                    revurderingSlice.iverksettRevurdering({
                        sakId: props.sak.id,
                        revurderingId: urlParams.revurderingId,
                    })
                );

                if (revurderingSlice.iverksettRevurdering.fulfilled.match(res)) {
                    dispatch(sakSlice.fetchSak({ saksnummer: props.sak.saksnummer.toString() }));
                    const message = intl.formatMessage({ id: 'attester.iverksatt' });
                    history.push(Routes.createSakIntroLocation(message, props.sak.id));
                }

                if (revurderingSlice.iverksettRevurdering.rejected.match(res)) {
                    //TODO: fix at res.payload kan være undefined?
                    if (!res.payload) return;
                    setSendtBeslutning(RemoteData.failure(res.payload));
                }
            }

            if (!values.beslutning && values.grunn) {
                setSendtBeslutning(RemoteData.pending);
                const res = await dispatch(
                    revurderingSlice.underkjennRevurdering({
                        sakId: props.sak.id,
                        revurderingId: urlParams.revurderingId,
                        grunn: values.grunn,
                        kommentar: values.kommentar,
                    })
                );

                if (revurderingSlice.underkjennRevurdering.fulfilled.match(res)) {
                    const message = intl.formatMessage({ id: 'attester.sendtTilbake' });
                    history.push(Routes.createSakIntroLocation(message, props.sak.id));
                }

                if (revurderingSlice.underkjennRevurdering.rejected.match(res)) {
                    //TODO: fix at res.payload kan være undefined?
                    if (!res.payload) return;
                    setSendtBeslutning(RemoteData.failure(res.payload));
                }
            }
        },
        validateOnChange: hasSubmitted,
        validationSchema: schema,
    });

    if (!revurdering) {
        return (
            <div className={styles.advarselContainer}>
                <AlertStripeFeil>{intl.formatMessage({ id: 'feil.fantIkkeRevurdering' })}</AlertStripeFeil>
            </div>
        );
    }

    if (!erRevurderingTilAttestering(revurdering)) {
        return (
            <div className={styles.advarselContainer}>
                <AlertStripeFeil>{intl.formatMessage({ id: 'feil.ikkeTilAttestering' })}</AlertStripeFeil>
            </div>
        );
    }

    const handleShowBrevClick = async () => {
        setHentPdfStatus(RemoteData.pending);
        const res = await PdfApi.fetchBrevutkastForRevurdering(props.sak.id, revurdering.id);
        if (res.status === 'ok') {
            setHentPdfStatus(RemoteData.success(null));
            window.open(URL.createObjectURL(res.data));
        } else {
            setHentPdfStatus(RemoteData.failure(res.error));
        }
    };

    return (
        <form
            className={SharedStyles.container}
            onSubmit={(e) => {
                setHasSubmitted(true);
                formik.handleSubmit(e);
            }}
        >
            <Personlinje søker={props.søker} sak={props.sak} />
            <div className={SharedStyles.content}>
                <div className={SharedStyles.tittelContainer}>
                    <Innholdstittel className={SharedStyles.pageTittel}>
                        {intl.formatMessage({ id: 'page.tittel' })}
                    </Innholdstittel>
                </div>
                {erRevurderingIngenEndring(revurdering) && (
                    <RevurderingIngenEndringAlert årsak={revurdering.årsak} className={styles.ingenEndringInfoboks} />
                )}
                <RevurderingÅrsakOgBegrunnelse className={styles.årsakBegrunnelseContainer} revurdering={revurdering} />
                <div className={styles.beregningContainer}>
                    <VisBeregning
                        beregningsTittel={intl.formatMessage({ id: 'beregning.gammelBeregning' })}
                        beregning={revurdering.beregninger.beregning}
                    />

                    <VisBeregning
                        beregningsTittel={intl.formatMessage({ id: 'beregning.nyBeregning' })}
                        beregning={revurdering.beregninger.revurdert}
                    />
                </div>
                {revurdering.skalFøreTilBrevutsending && !erGregulering(revurdering.årsak) && (
                    <Knapp
                        className={styles.brevButton}
                        htmlType="button"
                        spinner={RemoteData.isPending(hentPdfStatus)}
                        onClick={handleShowBrevClick}
                    >
                        {intl.formatMessage({ id: 'knapp.brev' })}
                    </Knapp>
                )}
                {RemoteData.isFailure(hentPdfStatus) && (
                    <AlertStripeFeil className={styles.brevFeil}>
                        {intl.formatMessage({ id: 'feil.klarteIkkeHenteBrev' })}
                    </AlertStripeFeil>
                )}

                {revurdering.status === RevurderingsStatus.TIL_ATTESTERING_OPPHØRT && (
                    <div className={styles.opphørsadvarsel}>
                        <AlertStripeAdvarsel>{intl.formatMessage({ id: 'info.opphør' })}</AlertStripeAdvarsel>
                    </div>
                )}

                <div className={styles.beslutningContainer}>
                    <RadioPanelGruppe
                        className={SharedStyles.formElement}
                        name={intl.formatMessage({ id: 'beslutning.tittel' })}
                        legend={<Systemtittel>{intl.formatMessage({ id: 'beslutning.tittel' })}</Systemtittel>}
                        radios={[
                            {
                                label: intl.formatMessage({ id: 'beslutning.godkjenn' }),
                                value: 'godkjenn',
                            },
                            {
                                label: intl.formatMessage({ id: 'beslutning.underkjenn' }),
                                value: 'revurder',
                            },
                        ]}
                        checked={
                            formik.values.beslutning
                                ? 'godkjenn'
                                : formik.values.beslutning === false
                                ? 'revurder'
                                : undefined
                        }
                        onChange={(_, value) => formik.setValues((v) => ({ ...v, beslutning: value === 'godkjenn' }))}
                        feil={formik.errors.beslutning}
                    />
                    {formik.values.beslutning === false && (
                        <div className={styles.selectContainer}>
                            <Select
                                label={intl.formatMessage({ id: 'input.grunn.label' })}
                                onChange={(event) =>
                                    formik.setValues((v) => ({
                                        ...v,
                                        grunn: event.target.value as UnderkjennRevurderingGrunn,
                                    }))
                                }
                                value={formik.values.grunn ?? ''}
                                feil={formik.errors.grunn}
                                className={styles.select}
                            >
                                <option value="" disabled>
                                    {intl.formatMessage({ id: 'input.grunn.value.default' })}
                                </option>
                                {Object.values(UnderkjennRevurderingGrunn).map((grunn, index) => (
                                    <option value={grunn} key={index}>
                                        {intl.formatMessage({
                                            id: getTextId(grunn),
                                        })}
                                    </option>
                                ))}
                            </Select>

                            <div className={styles.textAreaContainer}>
                                <Textarea
                                    label={intl.formatMessage({ id: 'input.kommentar.label' })}
                                    name="kommentar"
                                    value={formik.values.kommentar ?? ''}
                                    feil={formik.errors.kommentar}
                                    onChange={formik.handleChange}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Hovedknapp className={styles.sendBeslutningKnapp} spinner={RemoteData.isPending(sendtBeslutning)}>
                {intl.formatMessage({ id: 'knapp.tekst' })}
            </Hovedknapp>
            {RemoteData.isFailure(sendtBeslutning) && <RevurderingskallFeilet error={sendtBeslutning.error} />}
        </form>
    );
};

export default AttesterRevurdering;
