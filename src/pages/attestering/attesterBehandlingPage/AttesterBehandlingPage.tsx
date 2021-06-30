import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import { Feiloppsummering, RadioPanelGruppe, Select, Textarea } from 'nav-frontend-skjema';
import { Systemtittel } from 'nav-frontend-typografi';
import Innholdstittel from 'nav-frontend-typografi/lib/innholdstittel';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { Person } from '~api/personApi';
import Behandlingsoppsummering from '~components/oppsummering/Behandlingsoppsummering';
import Personlinje from '~components/personlinje/Personlinje';
import { erIverksatt, erTilAttestering } from '~features/behandling/behandlingUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useAsyncActionCreator, useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppSelector } from '~redux/Store';
import { Behandling, UnderkjennelseGrunn } from '~types/Behandling';
import { Sak } from '~types/Sak';

import SharedStyles from '../sharedStyles.module.less';

import messages from './attesteringPage-nb';
import styles from './attesteringPage.module.less';

interface FormData {
    beslutning?: boolean;
    grunn?: UnderkjennelseGrunn;
    kommentar?: string;
}

function getTextId(grunn: UnderkjennelseGrunn) {
    switch (grunn) {
        case UnderkjennelseGrunn.BEREGNINGEN_ER_FEIL:
            return 'input.grunn.value.beregningErFeil';
        case UnderkjennelseGrunn.DOKUMENTASJON_MANGLER:
            return 'input.grunn.value.dokumentasjonMangler';
        case UnderkjennelseGrunn.VEDTAKSBREVET_ER_FEIL:
            return 'input.grunn.value.vedtaksbrevetErFeil';
        case UnderkjennelseGrunn.INNGANGSVILKÅRENE_ER_FEILVURDERT:
            return 'input.grunn.value.inngangsvilkåreneErFeil';
        case UnderkjennelseGrunn.ANDRE_FORHOLD:
            return 'input.grunn.value.andreForhold';
    }
}

const Attesteringsinnhold = ({
    intl,
    ...props
}: {
    behandling: Behandling;
    sak: Sak;
    søker: Person;
    intl: IntlShape;
}) => {
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const attesteringStatus = useAppSelector((s) => s.sak.attesteringStatus);
    const history = useHistory();
    const [, attesteringIverksett] = useAsyncActionCreator(sakSlice.attesteringIverksett);
    const [, attesteringUnderkjent] = useAsyncActionCreator(sakSlice.attesteringUnderkjenn);
    const [, fetchSak] = useAsyncActionCreator(sakSlice.fetchSak);
    const redirectTilSaksoversikt = (message: string) => {
        history.push(Routes.createSakIntroLocation(message, props.sak.id));
    };

    const formik = useFormik<FormData>({
        initialValues: {},
        onSubmit: async (values) => {
            if (values.beslutning) {
                attesteringIverksett(
                    {
                        sakId: props.sak.id,
                        behandlingId: props.behandling.id,
                    },
                    (res) => {
                        fetchSak({ sakId: res.sakId }, () => {
                            redirectTilSaksoversikt(intl.formatMessage({ id: 'status.iverksatt' }));
                        });
                    }
                );
            }

            if (values.kommentar && values.grunn) {
                attesteringUnderkjent(
                    {
                        sakId: props.sak.id,
                        behandlingId: props.behandling.id,
                        grunn: values.grunn,
                        kommentar: values.kommentar,
                    },
                    () => {
                        redirectTilSaksoversikt(intl.formatMessage({ id: 'status.sendtTilbake' }));
                    }
                );
            }
        },
        validationSchema: yup.object<FormData>({
            beslutning: yup.boolean().required(),
            grunn: yup.mixed<UnderkjennelseGrunn>().when('beslutning', {
                is: false,
                then: yup.mixed<UnderkjennelseGrunn>().oneOf(Object.values(UnderkjennelseGrunn)).required(),
            }),
            kommentar: yup.string().when('beslutning', {
                is: false,
                then: yup.string().required(),
            }),
        }),
        validateOnChange: hasSubmitted,
    });

    const { errors } = formik;

    if (!erTilAttestering(props.behandling) && !erIverksatt(props.behandling)) {
        return (
            <div className={styles.content}>
                <AlertStripe type="feil">
                    <p>{intl.formatMessage({ id: 'feil.ikkeKlarForAttestering' })}</p>
                    <Link to={Routes.saksoversiktIndex.createURL()}>
                        {intl.formatMessage({ id: 'lenke.saksoversikt' })}
                    </Link>
                </AlertStripe>
            </div>
        );
    }

    return (
        <div className={SharedStyles.container}>
            <Personlinje søker={props.søker} sak={props.sak} />
            <div className={SharedStyles.content}>
                <Innholdstittel className={SharedStyles.tittel}>
                    {intl.formatMessage({ id: 'page.tittel' })}
                </Innholdstittel>

                <Behandlingsoppsummering sak={props.sak} behandling={props.behandling} medBrevutkastknapp />

                <div className={SharedStyles.navigeringContainer}>
                    {erTilAttestering(props.behandling) && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                formik.handleSubmit();
                                setHasSubmitted(true);
                            }}
                        >
                            <RadioPanelGruppe
                                className={SharedStyles.formElement}
                                name={intl.formatMessage({ id: 'attestering.beslutning' })}
                                legend={
                                    <Systemtittel>{intl.formatMessage({ id: 'attestering.beslutning' })}</Systemtittel>
                                }
                                radios={[
                                    {
                                        label: intl.formatMessage({ id: 'attestering.beslutning.godkjenn' }),
                                        value: 'godkjenn',
                                    },
                                    {
                                        label: intl.formatMessage({ id: 'attestering.beslutning.revurder' }),
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
                                feil={errors.beslutning}
                            />
                            {formik.values.beslutning === false && (
                                <>
                                    <Select
                                        label={intl.formatMessage({ id: 'input.grunn.label' })}
                                        onChange={(event) =>
                                            formik.setValues((v) => ({
                                                ...v,
                                                grunn: event.target.value as UnderkjennelseGrunn,
                                            }))
                                        }
                                        value={formik.values.grunn ?? ''}
                                        feil={errors.grunn}
                                        className={styles.formElement}
                                    >
                                        <option value="" disabled>
                                            {intl.formatMessage({ id: 'input.grunn.value.default' })}
                                        </option>
                                        {Object.values(UnderkjennelseGrunn).map((grunn, index) => (
                                            <option value={grunn} key={index}>
                                                {intl.formatMessage({
                                                    id: getTextId(grunn),
                                                })}
                                            </option>
                                        ))}
                                    </Select>

                                    <div className={styles.formElement}>
                                        <Textarea
                                            label={intl.formatMessage({ id: 'input.kommentar.label' })}
                                            name="kommentar"
                                            value={formik.values.kommentar ?? ''}
                                            feil={formik.errors.kommentar}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                </>
                            )}
                            <Feiloppsummering
                                className={styles.feiloppsummering}
                                tittel={'Feiloppsummering'}
                                feil={formikErrorsTilFeiloppsummering(formik.errors)}
                                hidden={!formikErrorsHarFeil(formik.errors)}
                            />
                            <Knapp
                                spinner={RemoteData.isPending(attesteringStatus)}
                                className={styles.sendInnAttestering}
                            >
                                {intl.formatMessage({ id: 'attestering.knapp.send' })}
                            </Knapp>
                            {RemoteData.isFailure(attesteringStatus) && (
                                <div className={styles.sendInnAttesteringFeilet}>
                                    <AlertStripe type="feil">
                                        <p>{intl.formatMessage({ id: 'status.feilet' })}</p>
                                        <p>
                                            {attesteringStatus.error.body?.message ||
                                                intl.formatMessage({ id: 'feil.ukjentFeil' })}
                                        </p>
                                    </AlertStripe>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const AttesterBehandling = (props: { sak: Sak; søker: Person }) => {
    const urlParams = Routes.useRouteParams<typeof Routes.attesterBehandling>();
    const { intl } = useI18n({ messages });

    const behandling = props.sak.behandlinger.find((x) => x.id === urlParams.behandlingId);

    if (!behandling) {
        return <AlertStripe type="feil">{intl.formatMessage({ id: 'feil.fantIkkeBehandling' })}</AlertStripe>;
    }
    return <Attesteringsinnhold behandling={behandling} sak={props.sak} søker={props.søker} intl={intl} />;
};

export default AttesterBehandling;
