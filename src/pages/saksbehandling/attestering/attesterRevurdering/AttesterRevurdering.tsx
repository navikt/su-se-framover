import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert } from '@navikt/ds-react';
import { useFormik } from 'formik';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { RadioPanelGruppe, Textarea, Select } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Innholdstittel, Systemtittel } from 'nav-frontend-typografi';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import * as PdfApi from '~api/pdfApi';
import { Person } from '~api/personApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Personlinje from '~components/personlinje/Personlinje';
import Revurderingoppsummering from '~components/revurdering/oppsummering/Revurderingoppsummering';
import * as RevurderingActions from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { IverksattRevurdering, RevurderingsStatus, UnderkjentRevurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { erRevurderingTilAttestering, erGregulering } from '~utils/revurdering/revurderingUtils';

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
    const { intl } = useI18n({ messages: { ...sharedMessages, ...messages } });
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const [hentPdfStatus, setHentPdfStatus] = useState<RemoteData.RemoteData<ApiError, null>>(RemoteData.initial);
    const [sendtBeslutning, setSendtBeslutning] = useState<
        RemoteData.RemoteData<ApiError, IverksattRevurdering | UnderkjentRevurdering>
    >(RemoteData.initial);
    const [grunnlagsdataOgVilkårsvurderinger, hentGrunnlagsdataOgVilkårsvurderinger] = useAsyncActionCreator(
        RevurderingActions.hentGjeldendeGrunnlagsdataOgVilkårsvurderinger
    );

    useEffect(() => {
        if (!revurdering) {
            return;
        }
        hentGrunnlagsdataOgVilkårsvurderinger({
            revurderingId: revurdering.id,
            sakId: props.sak.id,
        });
    }, [revurdering?.id]);

    const formik = useFormik<FormData>({
        initialValues: {},
        onSubmit: async (values) => {
            if (values.beslutning) {
                setSendtBeslutning(RemoteData.pending);
                const res = await dispatch(
                    RevurderingActions.iverksettRevurdering({
                        sakId: props.sak.id,
                        revurderingId: urlParams.revurderingId,
                    })
                );

                if (RevurderingActions.iverksettRevurdering.fulfilled.match(res)) {
                    dispatch(sakSlice.fetchSak({ saksnummer: props.sak.saksnummer.toString() }));
                    const message = intl.formatMessage({ id: 'attester.iverksatt' });
                    history.push(Routes.createSakIntroLocation(message, props.sak.id));
                }

                if (RevurderingActions.iverksettRevurdering.rejected.match(res)) {
                    if (!res.payload) return;
                    setSendtBeslutning(RemoteData.failure(res.payload));
                }
            }

            if (!values.beslutning && values.grunn) {
                setSendtBeslutning(RemoteData.pending);
                const res = await dispatch(
                    RevurderingActions.underkjennRevurdering({
                        sakId: props.sak.id,
                        revurderingId: urlParams.revurderingId,
                        grunn: values.grunn,
                        kommentar: values.kommentar,
                    })
                );

                if (RevurderingActions.underkjennRevurdering.fulfilled.match(res)) {
                    const message = intl.formatMessage({ id: 'attester.sendtTilbake' });
                    history.push(Routes.createSakIntroLocation(message, props.sak.id));
                }

                if (RevurderingActions.underkjennRevurdering.rejected.match(res)) {
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
                <Alert variant="error">{intl.formatMessage({ id: 'feil.fantIkkeRevurdering' })}</Alert>
            </div>
        );
    }

    if (!erRevurderingTilAttestering(revurdering)) {
        return (
            <div className={styles.advarselContainer}>
                <Alert variant="error">{intl.formatMessage({ id: 'feil.ikkeTilAttestering' })}</Alert>
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
        <div className={SharedStyles.container}>
            <Personlinje søker={props.søker} sak={props.sak} />
            <Innholdstittel className={SharedStyles.tittel}>{intl.formatMessage({ id: 'page.tittel' })}</Innholdstittel>
            {pipe(
                grunnlagsdataOgVilkårsvurderinger,
                RemoteData.fold(
                    () => <NavFrontendSpinner />,
                    () => <NavFrontendSpinner />,
                    (err) => <ApiErrorAlert error={err} />,
                    (grunnlag) => (
                        <div>
                            <div className={styles.oppsummeringContainer}>
                                <Revurderingoppsummering
                                    revurdering={revurdering}
                                    forrigeGrunnlagsdataOgVilkårsvurderinger={grunnlag}
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
                                <Alert variant="error" className={styles.brevFeil}>
                                    {intl.formatMessage({ id: 'feil.klarteIkkeHenteBrev' })}
                                </Alert>
                            )}

                            {revurdering.status === RevurderingsStatus.TIL_ATTESTERING_OPPHØRT && (
                                <div className={styles.opphørsadvarsel}>
                                    <Alert variant="warning">{intl.formatMessage({ id: 'info.opphør' })}</Alert>
                                </div>
                            )}

                            <form
                                className={SharedStyles.container}
                                onSubmit={(e) => {
                                    setHasSubmitted(true);
                                    formik.handleSubmit(e);
                                }}
                            >
                                <div className={styles.beslutningContainer}>
                                    <RadioPanelGruppe
                                        className={SharedStyles.formElement}
                                        name={intl.formatMessage({ id: 'beslutning.tittel' })}
                                        legend={
                                            <Systemtittel>
                                                {intl.formatMessage({ id: 'beslutning.tittel' })}
                                            </Systemtittel>
                                        }
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
                                        onChange={(_, value) =>
                                            formik.setValues((v) => ({ ...v, beslutning: value === 'godkjenn' }))
                                        }
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
                                <Hovedknapp
                                    className={styles.sendBeslutningKnapp}
                                    spinner={RemoteData.isPending(sendtBeslutning)}
                                >
                                    {intl.formatMessage({ id: 'knapp.tekst' })}
                                </Hovedknapp>
                                {RemoteData.isFailure(sendtBeslutning) && (
                                    <ApiErrorAlert error={sendtBeslutning.error} />
                                )}
                            </form>
                        </div>
                    )
                )
            )}
        </div>
    );
};

export default AttesterRevurdering;
