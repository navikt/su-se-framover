import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader, RadioGroup, Radio, Select, Textarea } from '@navikt/ds-react';
import { useFormik } from 'formik';
import { Systemtittel } from 'nav-frontend-typografi';
import Innholdstittel from 'nav-frontend-typografi/lib/innholdstittel';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { Person } from '~api/personApi';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import Personlinje from '~components/personlinje/Personlinje';
import Søknadsbehandlingoppsummering from '~components/søknadsbehandlingoppsummering/Søknadsbehandlingoppsummering';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppSelector } from '~redux/Store';
import { Behandling, UnderkjennelseGrunn } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { erIverksatt, erTilAttestering } from '~utils/behandling/behandlingUtils';

import SharedStyles from '../sharedStyles.module.less';

import messages from './attesterSøknadsbehandling-nb';
import styles from './attesterSøknadsbehandling.module.less';

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
                <Alert variant="error">
                    <p>{intl.formatMessage({ id: 'feil.ikkeKlarForAttestering' })}</p>
                    <Link to={Routes.saksoversiktIndex.createURL()}>
                        {intl.formatMessage({ id: 'lenke.saksoversikt' })}
                    </Link>
                </Alert>
            </div>
        );
    }

    return (
        <div className={SharedStyles.container}>
            <Personlinje søker={props.søker} sak={props.sak} />
            <div>
                <Innholdstittel className={SharedStyles.tittel}>
                    {intl.formatMessage({ id: 'page.tittel' })}
                </Innholdstittel>

                <Søknadsbehandlingoppsummering sak={props.sak} behandling={props.behandling} medBrevutkastknapp />

                <div className={SharedStyles.navigeringContainer}>
                    {erTilAttestering(props.behandling) && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                formik.handleSubmit();
                                setHasSubmitted(true);
                            }}
                        >
                            <RadioGroup
                                className={SharedStyles.formElement}
                                name={intl.formatMessage({ id: 'attestering.beslutning' })}
                                legend={
                                    <Systemtittel>{intl.formatMessage({ id: 'attestering.beslutning' })}</Systemtittel>
                                }
                                value={formik.values.beslutning?.toString()}
                                onChange={(value) =>
                                    formik.setValues((v) => ({ ...v, beslutning: value === true.toString() }))
                                }
                                error={errors.beslutning}
                            >
                                <Radio id="beslutning" value={true.toString()}>
                                    {intl.formatMessage({ id: 'attestering.beslutning.godkjenn' })}
                                </Radio>
                                <Radio value={false.toString()}>
                                    {intl.formatMessage({ id: 'attestering.beslutning.revurder' })}
                                </Radio>
                            </RadioGroup>
                            {formik.values.beslutning === false && (
                                <>
                                    <div className={SharedStyles.formElement}>
                                        <Select
                                            label={intl.formatMessage({ id: 'input.grunn.label' })}
                                            onChange={(event) =>
                                                formik.setValues((v) => ({
                                                    ...v,
                                                    grunn: event.target.value as UnderkjennelseGrunn,
                                                }))
                                            }
                                            value={formik.values.grunn}
                                            error={errors.grunn}
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
                                    </div>

                                    <Textarea
                                        label={intl.formatMessage({ id: 'input.kommentar.label' })}
                                        name="kommentar"
                                        value={formik.values.kommentar ?? ''}
                                        error={formik.errors.kommentar}
                                        onChange={formik.handleChange}
                                        className={SharedStyles.formElement}
                                    />
                                </>
                            )}
                            <Feiloppsummering
                                className={styles.feiloppsummering}
                                tittel={'Feiloppsummering'}
                                feil={formikErrorsTilFeiloppsummering(formik.errors)}
                                hidden={!formikErrorsHarFeil(formik.errors)}
                            />
                            <Button variant="primary" className={styles.sendInnAttestering}>
                                {intl.formatMessage({ id: 'attestering.knapp.send' })}
                                {RemoteData.isPending(attesteringStatus) && <Loader />}
                            </Button>
                            {RemoteData.isFailure(attesteringStatus) && (
                                <div className={styles.sendInnAttesteringFeilet}>
                                    <Alert variant="error">
                                        <p>{intl.formatMessage({ id: 'status.feilet' })}</p>
                                        <p>
                                            {
                                                // TODO: Map error.code til feilmelding i stedet for å vise feilmelding fra backend direkte
                                                attesteringStatus.error.body?.message ||
                                                    intl.formatMessage({ id: 'feil.ukjentFeil' })
                                            }
                                        </p>
                                    </Alert>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const AttesterSøknadsbehandling = (props: { sak: Sak; søker: Person }) => {
    const urlParams = Routes.useRouteParams<typeof Routes.attesterSøknadsbehandling>();
    const { intl } = useI18n({ messages });

    const behandling = props.sak.behandlinger.find((x) => x.id === urlParams.behandlingId);

    if (!behandling) {
        return <Alert variant="error">{intl.formatMessage({ id: 'feil.fantIkkeBehandling' })}</Alert>;
    }
    return <Attesteringsinnhold behandling={behandling} sak={props.sak} søker={props.søker} intl={intl} />;
};

export default AttesterSøknadsbehandling;
