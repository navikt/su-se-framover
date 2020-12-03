import * as RemoteData from '@devexperts/remote-data-ts';
import { Gender, PersonCard } from '@navikt/nap-person-card';
import { useFormik } from 'formik';
import AlertStripe, { AlertStripeFeil, AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import { Feiloppsummering, RadioPanelGruppe, Select, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import Innholdstittel from 'nav-frontend-typografi/lib/innholdstittel';
import React, { useEffect, useMemo, useState } from 'react';
import { IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';

import { fetchBrev } from '~api/pdfApi';
import { Person } from '~api/personApi';
import { PersonAdvarsel } from '~components/PersonAdvarsel';
import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { erAvslått, erIverksatt, erTilAttestering } from '~features/behandling/behandlingUtils';
import * as personSlice from '~features/person/person.slice';
import { getGender, showName } from '~features/person/personUtils';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { mapToVilkårsinformasjon, vilkårTittelFormatted } from '~features/saksoversikt/utils';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { VisSimulering } from '~pages/saksbehandling/simulering/simulering';
import VisBeregning from '~pages/saksbehandling/steg/beregning/VisBeregning';
import Søkefelt from '~pages/saksbehandling/søkefelt/Søkefelt';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Behandling, Behandlingsstatus, UnderkjennelseGrunn } from '~types/Behandling';
import { Sak } from '~types/Sak';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import messages from './attestering-nb';
import styles from './attestering.module.less';

const VilkårsOppsummering = (props: { behandling: Behandling }) => {
    const vilkårsinformasjon = mapToVilkårsinformasjon(props.behandling.behandlingsinformasjon);

    return (
        <div>
            <Innholdstittel className={styles.tittel}>Vilkårsvurderinger</Innholdstittel>
            {vilkårsinformasjon.map((v) => (
                <VilkårsvurderingInfoLinje
                    type={v.vilkårtype}
                    status={v.status}
                    key={v.vilkårtype}
                    begrunnelse={v.begrunnelse}
                />
            ))}
        </div>
    );
};

const VilkårsvurderingInfoLinje = (props: {
    type: Vilkårtype;
    status: VilkårVurderingStatus;
    begrunnelse?: Nullable<string>;
}) => {
    return (
        <div className={styles.infolinjeContainer}>
            <div className={styles.infolinje}>
                <span className={styles.statusContainer}>
                    <VilkårvurderingStatusIcon className={styles.statusIcon} status={props.status} />
                </span>
                <div>
                    <span className={styles.infotittel}>{vilkårTittelFormatted(props.type)}:</span>
                    <p>{props.begrunnelse ?? ''}</p>
                </div>
            </div>
        </div>
    );
};

const VisDersomSimulert = (props: { sak: Sak; behandling: Behandling }) => {
    if (props.behandling.beregning && !erAvslått(props.behandling)) {
        return (
            <div className={styles.beregningOgOppdragContainer}>
                <div className={styles.beregningContainer}>
                    <VisBeregning
                        beregning={props.behandling.beregning}
                        forventetinntekt={props.behandling.behandlingsinformasjon.uførhet?.forventetInntekt ?? 0}
                    />
                </div>
                <div>
                    <Innholdstittel>Oppdragssimulering</Innholdstittel>
                    <VisSimulering sak={props.sak} behandling={props.behandling} />
                </div>
            </div>
        );
    }
    return <>Det er ikke gjort en beregning</>;
};

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
    const [fetchingBrev, setFetchingBrev] = useState<boolean>(false);

    const dispatch = useAppDispatch();

    const formik = useFormik<FormData>({
        initialValues: {},
        onSubmit: (values) => {
            if (values.beslutning) {
                dispatch(
                    sakSlice.startAttestering({
                        sakId: props.sak.id,
                        behandlingId: props.behandling.id,
                    })
                );
                return;
            }

            if (values.kommentar && values.grunn) {
                dispatch(
                    sakSlice.attesteringUnderkjenn({
                        sakId: props.sak.id,
                        behandlingId: props.behandling.id,
                        grunn: values.grunn,
                        kommentar: values.kommentar,
                    })
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

    const gender = useMemo<Gender>(() => getGender(props.søker), [props.søker]);

    const { errors } = formik;

    if (RemoteData.isSuccess(attesteringStatus)) {
        return (
            <div className={styles.content}>
                <AlertStripe type="suksess">
                    <p>
                        {intl.formatMessage({
                            id: [Behandlingsstatus.IVERKSATT_INNVILGET, Behandlingsstatus.IVERKSATT_AVSLAG].includes(
                                props.behandling.status
                            )
                                ? 'status.iverksatt'
                                : 'status.sendtTilbake',
                        })}
                    </p>
                    <Link to={Routes.saksoversiktIndex.createURL()}>
                        {intl.formatMessage({ id: 'lenke.saksoversikt' })}
                    </Link>
                </AlertStripe>
            </div>
        );
    }

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
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <PersonCard
                    fodselsnummer={props.søker.fnr}
                    gender={gender}
                    name={showName(props.søker.navn)}
                    renderLabelContent={(): JSX.Element => <PersonAdvarsel person={props.søker} />}
                />
                <Søkefelt />
            </div>
            <div className={styles.content}>
                <div className={styles.vedtakContainer}>
                    <Innholdstittel>Vedtak</Innholdstittel>
                    <div>
                        {!erAvslått(props.behandling) && (
                            <AlertStripeSuksess>{props.behandling.status}</AlertStripeSuksess>
                        )}
                        {erAvslått(props.behandling) && <AlertStripeFeil>{props.behandling.status}</AlertStripeFeil>}
                    </div>
                    <div>
                        <VilkårsOppsummering behandling={props.behandling} />
                    </div>
                    <div>
                        <VisDersomSimulert sak={props.sak} behandling={props.behandling} />
                    </div>
                    <div>
                        <Innholdstittel>Vis brev kladd</Innholdstittel>
                        <Knapp
                            spinner={fetchingBrev}
                            onClick={() => {
                                setFetchingBrev(true);
                                fetchBrev(props.sak.id, props.behandling.id).then((res) => {
                                    if (res.status === 'ok') {
                                        window.open(URL.createObjectURL(res.data));
                                    }
                                    setFetchingBrev(false);
                                });
                            }}
                        >
                            Last ned brev
                        </Knapp>
                    </div>
                </div>
                <div className={styles.navigeringContainer}>
                    {erTilAttestering(props.behandling) && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                formik.handleSubmit();
                                setHasSubmitted(true);
                            }}
                        >
                            <RadioPanelGruppe
                                className={styles.formElement}
                                name={intl.formatMessage({ id: 'attestering.beslutning' })}
                                legend={intl.formatMessage({ id: 'attestering.beslutning' })}
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
                                                grunn: v ? (event.target.value as UnderkjennelseGrunn) : undefined,
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
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const Attestering = () => {
    const dispatch = useAppDispatch();
    const urlParams = Routes.useRouteParams<typeof Routes.attestering>();
    const { søker, sak } = useAppSelector((s) => ({ søker: s.søker.søker, sak: s.sak.sak }));
    const intl = useI18n({ messages });

    useEffect(() => {
        if (RemoteData.isInitial(sak)) {
            dispatch(sakSlice.fetchSak({ sakId: urlParams.sakId }));
        }
    }, [sak._tag]);

    useEffect(() => {
        if (RemoteData.isSuccess(sak) && RemoteData.isInitial(søker)) {
            dispatch(personSlice.fetchPerson({ fnr: sak.value.fnr }));
        }
    }, [søker._tag, sak._tag]);

    return pipe(
        RemoteData.combine(søker, sak),
        RemoteData.fold(
            () => null,
            () => <NavFrontendSpinner />,
            (_err) => <AlertStripe type="feil">{intl.formatMessage({ id: 'feil.generisk' })}</AlertStripe>,
            ([søkerValue, sakValue]) => {
                const behandling = sakValue.behandlinger.find((x) => x.id === urlParams.behandlingId);
                if (!behandling) {
                    return (
                        <AlertStripe type="feil">{intl.formatMessage({ id: 'feil.fantIkkeBehandling' })}</AlertStripe>
                    );
                }
                return <Attesteringsinnhold behandling={behandling} søker={søkerValue} sak={sakValue} intl={intl} />;
            }
        )
    );
};

export default Attestering;
