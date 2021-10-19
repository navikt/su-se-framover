import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader, Textarea, Select, Panel } from '@navikt/ds-react';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import * as PdfApi from '~api/pdfApi';
import { Person } from '~api/personApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { BooleanRadioGroup } from '~components/formElements/FormElements';
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
            <Heading level="1" size="xlarge" className={SharedStyles.tittel}>
                {intl.formatMessage({ id: 'page.tittel' })}
            </Heading>
            {pipe(
                grunnlagsdataOgVilkårsvurderinger,
                RemoteData.fold(
                    () => <Loader />,
                    () => <Loader />,
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
                                <Button
                                    variant="secondary"
                                    className={styles.brevButton}
                                    type="button"
                                    onClick={handleShowBrevClick}
                                >
                                    {intl.formatMessage({ id: 'knapp.brev' })}
                                    {RemoteData.isPending(hentPdfStatus) && <Loader />}
                                </Button>
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
                                <Panel border>
                                    <div className={styles.beslutningContainer}>
                                        <BooleanRadioGroup
                                            className={SharedStyles.formElement}
                                            name="beslutning"
                                            legend={intl.formatMessage({ id: 'beslutning.tittel' })}
                                            value={formik.values.beslutning}
                                            onChange={(value) =>
                                                formik.setValues((v) => ({
                                                    ...v,
                                                    beslutning: value,
                                                }))
                                            }
                                            error={formik.errors.beslutning}
                                            labels={{
                                                true: intl.formatMessage({ id: 'beslutning.godkjenn' }),
                                                false: intl.formatMessage({ id: 'beslutning.underkjenn' }),
                                            }}
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
                                                    error={formik.errors.grunn}
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
                                                        error={formik.errors.kommentar}
                                                        onChange={formik.handleChange}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <Button className={styles.sendBeslutningKnapp}>
                                        {intl.formatMessage({ id: 'knapp.tekst' })}
                                        {RemoteData.isPending(sendtBeslutning) && <Loader />}
                                    </Button>
                                    {RemoteData.isFailure(sendtBeslutning) && (
                                        <ApiErrorAlert error={sendtBeslutning.error} />
                                    )}
                                </Panel>
                            </form>
                        </div>
                    )
                )
            )}
        </div>
    );
};

export default AttesterRevurdering;
