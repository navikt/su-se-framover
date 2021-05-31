import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Feiloppsummering, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element, Feilmelding } from 'nav-frontend-typografi';
import React, { useEffect, useState } from 'react';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Sats as FaktiskSats } from '~/types/Sats';
import { ApiError } from '~api/apiClient';
import { Person, fetchPerson } from '~api/personApi';
import { SuperRadioGruppe } from '~components/FormElements';
import { Personkort } from '~components/Personkort';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { eqBosituasjon } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Bosituasjon } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';

import { SatsFaktablokk } from '../faktablokk/faktablokker/SatsFaktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './sats-nb';
import styles from './sats.module.less';

interface FormData {
    delerSøkerBolig: Nullable<boolean>;
    mottarEktemakeEllerSamboerSU: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

interface SatsProps {
    behandlingId: string;
    eps: Nullable<Person>;
    søker: Person;
    bosituasjon: Nullable<Bosituasjon>;
    søknadInnhold: SøknadInnhold;
    forrigeUrl: string;
    nesteUrl: string;
    sakId: string;
    intl: IntlShape;
}

const toBosituasjon = (values: FormData, eps: Nullable<Person>): Nullable<Bosituasjon> => {
    if (values.delerSøkerBolig === null && eps === null) {
        return null;
    }

    return {
        delerBolig: values.delerSøkerBolig,
        ektemakeEllerSamboerUførFlyktning: values.mottarEktemakeEllerSamboerSU,
        begrunnelse: values.begrunnelse,
    };
};

const utledSats = (values: FormData, harEPS: boolean, epsAlder?: Nullable<number>) => {
    if (!values.delerSøkerBolig && values.delerSøkerBolig !== null) {
        return FaktiskSats.Høy;
    }

    if (harEPS && !epsAlder) {
        return 'Feil skjedde under utleding av sats';
    }

    if (values.delerSøkerBolig && !harEPS) {
        return FaktiskSats.Ordinær;
    }

    if (harEPS) {
        if (epsAlder && epsAlder < 67) {
            switch (values.mottarEktemakeEllerSamboerSU) {
                case null:
                    return null;
                case false:
                    return FaktiskSats.Høy;
                case true:
                    return FaktiskSats.Ordinær;
            }
        } else {
            return FaktiskSats.Ordinær;
        }
    }
    return null;
};

const getValidationSchema = (eps: Nullable<Person>) => {
    return yup.object<FormData>({
        delerSøkerBolig: yup
            .boolean()
            .defined()
            .test('deler søker bolig', 'Feltet må fylles ut', function (delerSøkerBolig) {
                if (!eps) {
                    return delerSøkerBolig !== null;
                }
                return true;
            }),
        mottarEktemakeEllerSamboerSU: yup
            .boolean()
            .defined()
            .test('eps mottar SU', 'Feltet må fylles ut', function (mottarSu) {
                if (eps && eps.alder && eps.alder < 67) {
                    return mottarSu !== null;
                }

                return true;
            }),
        begrunnelse: yup.string().defined(),
    });
};

const Sats = (props: VilkårsvurderingBaseProps) => {
    const [eps, setEps] = useState<RemoteData.RemoteData<ApiError | undefined, Person>>(RemoteData.initial);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
    const history = useHistory();

    useEffect(() => {
        async function fetchEPS(fnr: string) {
            setEps(RemoteData.pending);

            const res = await fetchPerson(fnr);
            if (res.status === 'error') {
                setEps(RemoteData.failure(res.error));
            } else {
                setEps(RemoteData.success(res.data));
            }
        }

        if (props.behandling.behandlingsinformasjon.ektefelle?.fnr) {
            fetchEPS(props.behandling.behandlingsinformasjon.ektefelle?.fnr);
        }
    }, []);

    return pipe(
        eps,
        RemoteData.fold(
            () => {
                //Denne er for når søker ikke har EPS - den blir bare satt til pending når vi fetcher
                return (
                    <SatsForm
                        behandlingId={props.behandling.id}
                        søker={props.søker}
                        eps={null}
                        bosituasjon={props.behandling.behandlingsinformasjon.bosituasjon}
                        søknadInnhold={props.behandling.søknad.søknadInnhold}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                        sakId={props.sakId}
                        intl={intl}
                    />
                );
            },
            () => <NavFrontendSpinner />,
            () => (
                <div className={styles.epsFeilContainer}>
                    <Feilmelding>{intl.formatMessage({ id: 'feilmelding.pdlFeil' })}</Feilmelding>
                    <Hovedknapp
                        onClick={() => {
                            history.push(props.forrigeUrl);
                        }}
                    >
                        {intl.formatMessage({ id: 'knapp.tilbake' })}
                    </Hovedknapp>
                </div>
            ),
            (eps) => (
                <SatsForm
                    behandlingId={props.behandling.id}
                    søker={props.søker}
                    eps={eps}
                    bosituasjon={props.behandling.behandlingsinformasjon.bosituasjon}
                    søknadInnhold={props.behandling.søknad.søknadInnhold}
                    forrigeUrl={props.forrigeUrl}
                    nesteUrl={props.nesteUrl}
                    sakId={props.sakId}
                    intl={intl}
                />
            )
        )
    );
};

const SatsForm = (props: SatsProps) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const eksisterendeBosituasjon = props.bosituasjon;
    const eps = props.eps;

    const formik = useFormik<FormData>({
        initialValues: {
            delerSøkerBolig: eps ? null : eksisterendeBosituasjon?.delerBolig ?? null,
            mottarEktemakeEllerSamboerSU:
                eps && eps.alder && eps.alder >= 67
                    ? null
                    : eksisterendeBosituasjon?.ektemakeEllerSamboerUførFlyktning ?? null,
            begrunnelse: eksisterendeBosituasjon?.begrunnelse ?? null,
        },
        validationSchema: getValidationSchema(eps),
        validateOnChange: hasSubmitted,
        async onSubmit(values) {
            handleSave(values, props.nesteUrl);
        },
    });

    const handleSave = async (values: FormData, nesteUrl: string) => {
        const boSituasjonValues = toBosituasjon(values, eps);
        if (!boSituasjonValues) {
            return;
        }

        if (eqBosituasjon.equals(boSituasjonValues, props.bosituasjon)) {
            history.push(nesteUrl);
            return;
        }

        const res = await dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandlingId,
                behandlingsinformasjon: {
                    bosituasjon: boSituasjonValues,
                },
            })
        );

        if (res && lagreBehandlingsinformasjon.fulfilled.match(res)) {
            history.push(nesteUrl);
        }
    };

    return (
        <ToKolonner tittel={props.intl.formatMessage({ id: 'page.tittel' })}>
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <div>
                            {eps && (
                                <div className={styles.personkortContainer}>
                                    <Element className={styles.personkortTittel}>
                                        {props.intl.formatMessage({ id: 'display.eps.label' })}
                                    </Element>
                                    <Personkort person={eps} />
                                </div>
                            )}
                        </div>
                        {!eps && (
                            <SuperRadioGruppe
                                id="delerSøkerBolig"
                                legend={props.intl.formatMessage({ id: 'radio.delerSøkerBoligOver18.legend' })}
                                values={formik.values}
                                errors={formik.errors}
                                property="delerSøkerBolig"
                                onChange={(val) => {
                                    formik.setValues((v) => ({
                                        ...v,
                                        delerSøkerBolig: val.delerSøkerBolig,
                                    }));
                                }}
                                options={[
                                    {
                                        label: props.intl.formatMessage({ id: 'radio.label.ja' }),
                                        radioValue: true,
                                    },
                                    {
                                        label: props.intl.formatMessage({ id: 'radio.label.nei' }),
                                        radioValue: false,
                                    },
                                ]}
                            />
                        )}
                        {eps?.alder && eps.alder < 67 ? (
                            <SuperRadioGruppe
                                id="mottarEktemakeEllerSamboerSU"
                                legend={props.intl.formatMessage({
                                    id: 'radio.ektemakeEllerSamboerUførFlyktning.legend',
                                })}
                                values={formik.values}
                                errors={formik.errors}
                                onChange={(val) => {
                                    formik.setValues((v) => ({
                                        ...v,
                                        mottarEktemakeEllerSamboerSU: val.mottarEktemakeEllerSamboerSU,
                                    }));
                                }}
                                property="mottarEktemakeEllerSamboerSU"
                                options={[
                                    {
                                        label: props.intl.formatMessage({
                                            id: 'radio.label.ja',
                                        }),
                                        radioValue: true,
                                    },
                                    {
                                        label: props.intl.formatMessage({
                                            id: 'radio.label.nei',
                                        }),
                                        radioValue: false,
                                    },
                                ]}
                            />
                        ) : (
                            ''
                        )}
                        {utledSats(formik.values, Boolean(eps), eps?.alder) && (
                            <>
                                <hr />
                                <span>
                                    {`${props.intl.formatMessage({ id: 'display.sats' })} ${utledSats(
                                        formik.values,
                                        Boolean(eps),
                                        eps?.alder
                                    )}`}
                                </span>
                                <hr />
                                <hr />
                            </>
                        )}
                        <div className={styles.textareaContainer}>
                            <Textarea
                                label={props.intl.formatMessage({
                                    id: 'input.label.begrunnelse',
                                })}
                                name="begrunnelse"
                                value={formik.values.begrunnelse ?? ''}
                                feil={formik.errors.begrunnelse}
                                onChange={formik.handleChange}
                            />
                        </div>
                        {pipe(
                            lagreBehandlingsinformasjonStatus,
                            RemoteData.fold(
                                () => null,
                                () => (
                                    <NavFrontendSpinner>
                                        {props.intl.formatMessage({ id: 'display.lagre.lagrer' })}
                                    </NavFrontendSpinner>
                                ),
                                () => (
                                    <AlertStripe type="feil">
                                        {props.intl.formatMessage({ id: 'display.lagre.lagringFeilet' })}
                                    </AlertStripe>
                                ),
                                () => null
                            )
                        )}
                        <Feiloppsummering
                            tittel={props.intl.formatMessage({ id: 'feiloppsummering.title' })}
                            feil={formikErrorsTilFeiloppsummering(formik.errors)}
                            hidden={!formikErrorsHarFeil(formik.errors)}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                formik.validateForm().then((res) => {
                                    if (Object.keys(res).length === 0) {
                                        handleSave(
                                            formik.values,
                                            Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })
                                        );
                                    }
                                });
                            }}
                        />
                    </form>
                ),
                right: <SatsFaktablokk søknadInnhold={props.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Sats;
