import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element } from 'nav-frontend-typografi';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Sats as FaktiskSats } from '~/types/Sats';
import { ApiError, ErrorCode } from '~api/apiClient';
import { fetchPerson, Person } from '~api/personApi';
import { SuperRadioGruppe } from '~components/FormElements';
import { Personkort } from '~components/Personkort';
import { eqBosituasjon } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Bosituasjon } from '~types/Behandlingsinformasjon';

import Faktablokk from '../Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './sats-nb';
import styles from './sats.module.less';
import { hentEktefellesAlder, hentEktefellesFnrEllerFødselsdato } from './utils';

interface FormData {
    epsFnr: Nullable<string>;
    delerSøkerBolig: Nullable<boolean>;
    mottarEktemakeEllerSamboerSU: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

const toBosituasjon = (values: FormData): Nullable<Bosituasjon> => {
    if (values.delerSøkerBolig === null && values.epsFnr === null) {
        return null;
    }

    return {
        epsFnr: values.epsFnr,
        delerBolig: values.delerSøkerBolig,
        ektemakeEllerSamboerUførFlyktning: values.mottarEktemakeEllerSamboerSU,
        begrunnelse: null,
    };
};

const utledSats = (values: FormData, harEPS: boolean) => {
    console.log(values);
    if (!values.delerSøkerBolig && values.delerSøkerBolig !== null) {
        return FaktiskSats.Høy;
    }

    if (values.delerSøkerBolig && !harEPS) {
        return FaktiskSats.Ordinær;
    }

    if (harEPS) {
        switch (values.mottarEktemakeEllerSamboerSU) {
            case null:
                return null;
            case false:
                return FaktiskSats.Høy;
            case true:
                return FaktiskSats.Ordinær;
        }
    }

    return null;
};

const schema = yup.object<FormData>({
    epsFnr: yup.string(),
    delerSøkerBolig: yup.boolean().defined().when('epsFnr', {
        is: null,
        then: yup.boolean().required(),
    }),
    mottarEktemakeEllerSamboerSU: yup.boolean().defined().when('erEktemakeEllerSamboerUnder67', {
        is: true,
        then: yup.boolean().required(),
        otherwise: yup.boolean().nullable().defined(),
    }),
    begrunnelse: yup.string().defined(),
});

const Sats = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [eps, setEPS] = useState<Person>();
    const [fetchEpsError, setfetchEpsError] = useState<ApiError>();
    const eksisterendeBosituasjon = props.behandling.behandlingsinformasjon.bosituasjon;
    const epsFnr = props.behandling.behandlingsinformasjon.ektefelle?.fnr;

    useEffect(() => {
        if (!epsFnr) {
            return;
        }
        async function fetchEps(fnr: string) {
            const res = await fetchPerson(fnr);
            if (res.status === 'ok') {
                setEPS(res.data);
            } else {
                setfetchEpsError(res.error);
            }
        }

        fetchEps(epsFnr);
    }, [epsFnr]);

    const formik = useFormik<FormData>({
        initialValues: {
            epsFnr: props.behandling.behandlingsinformasjon.ektefelle?.fnr ?? null,
            delerSøkerBolig: eksisterendeBosituasjon?.delerBolig ?? null,
            mottarEktemakeEllerSamboerSU: eksisterendeBosituasjon?.ektemakeEllerSamboerUførFlyktning ?? null,
            begrunnelse: eksisterendeBosituasjon?.begrunnelse ?? null,
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
        async onSubmit(values) {
            const res = await handleSave(values);
            if (res && lagreBehandlingsinformasjon.fulfilled.match(res)) {
                history.push(props.nesteUrl);
            }
        },
    });

    const handleSave = (values: FormData) => {
        const boSituasjonValues = toBosituasjon(values);
        if (!boSituasjonValues) {
            return;
        }

        if (eqBosituasjon.equals(boSituasjonValues, props.behandling.behandlingsinformasjon.bosituasjon)) {
            history.push(props.nesteUrl);
            return;
        }

        return dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    bosituasjon: boSituasjonValues,
                },
            })
        );
    };

    return (
        <Vurdering tittel={intl.formatMessage({ id: 'page.tittel' })}>
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
                                        {intl.formatMessage({ id: 'display.eps.label' })}
                                    </Element>
                                    <Personkort person={eps} />
                                </div>
                            )}
                            {fetchEpsError && (
                                <AlertStripe type="feil">
                                    {fetchEpsError.statusCode === ErrorCode.Unauthorized
                                        ? intl.formatMessage({ id: 'feilmelding.ikkeTilgang' })
                                        : fetchEpsError.statusCode === ErrorCode.NotFound
                                        ? intl.formatMessage({ id: 'feilmelding.ikkeFunnet' })
                                        : intl.formatMessage({ id: 'feilmelding.ukjent' })}
                                </AlertStripe>
                            )}
                        </div>

                        {!eps && !fetchEpsError ? (
                            <SuperRadioGruppe
                                legend={intl.formatMessage({ id: 'radio.delerSøkerBoligOver18.legend' })}
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
                                        label: intl.formatMessage({ id: 'radio.label.ja' }),
                                        radioValue: true,
                                    },
                                    {
                                        label: intl.formatMessage({ id: 'radio.label.nei' }),
                                        radioValue: false,
                                    },
                                ]}
                            />
                        ) : (
                            ''
                        )}

                        {eps && (
                            <SuperRadioGruppe
                                legend={intl.formatMessage({
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
                                        label: intl.formatMessage({
                                            id: 'radio.label.ja',
                                        }),
                                        radioValue: true,
                                    },
                                    {
                                        label: intl.formatMessage({
                                            id: 'radio.label.nei',
                                        }),
                                        radioValue: false,
                                    },
                                ]}
                            />
                        )}

                        {utledSats(formik.values, Boolean(eps)) && (
                            <>
                                <hr />
                                <span>
                                    {`${intl.formatMessage({ id: 'display.sats' })} ${utledSats(
                                        formik.values,
                                        Boolean(eps)
                                    )}`}
                                </span>
                                <hr />
                                <hr />
                            </>
                        )}
                        <Textarea
                            label={intl.formatMessage({
                                id: 'input.label.begrunnelse',
                            })}
                            name="begrunnelse"
                            value={formik.values.begrunnelse ?? ''}
                            feil={formik.errors.begrunnelse}
                            onChange={formik.handleChange}
                        />
                        {pipe(
                            lagreBehandlingsinformasjonStatus,
                            RemoteData.fold(
                                () => null,
                                () => (
                                    <NavFrontendSpinner>
                                        {intl.formatMessage({ id: 'display.lagre.lagrer' })}
                                    </NavFrontendSpinner>
                                ),
                                () => (
                                    <AlertStripe type="feil">
                                        {intl.formatMessage({ id: 'display.lagre.lagringFeilet' })}
                                    </AlertStripe>
                                ),
                                () => null
                            )
                        )}
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                handleSave(formik.values);
                            }}
                        />
                    </form>
                ),
                right: (
                    <Faktablokk
                        tittel={intl.formatMessage({
                            id: 'display.fraSøknad',
                        })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({
                                    id: 'display.fraSøknad.hvemDelerSøkerBoligMed',
                                }),
                                verdi: props.behandling.søknad.søknadInnhold.boforhold.delerBoligMed ?? '-',
                            },
                            {
                                tittel: intl.formatMessage({
                                    id: 'display.fraSøknad.ektefelleEllerSamboerFnr',
                                }),
                                verdi: props.behandling.søknad.søknadInnhold.boforhold.ektefellePartnerSamboer
                                    ? hentEktefellesFnrEllerFødselsdato(
                                          props.behandling.søknad.søknadInnhold.boforhold.ektefellePartnerSamboer
                                      )
                                    : '-',
                            },
                            {
                                tittel: intl.formatMessage({
                                    id: 'display.fraSøknad.ektefelleEllerSamboerAlder',
                                }),
                                verdi: props.behandling.søknad.søknadInnhold.boforhold.ektefellePartnerSamboer
                                    ? hentEktefellesAlder(
                                          props.behandling.søknad.søknadInnhold.boforhold.ektefellePartnerSamboer
                                      ).toString()
                                    : '-',
                            },
                            {
                                tittel: intl.formatMessage({
                                    id: 'display.fraSøknad.ektefelleEllerSamboerNavn',
                                }),
                                verdi:
                                    props.behandling.søknad.søknadInnhold.boforhold.ektefellePartnerSamboer?.type ===
                                    'UtenFnr'
                                        ? props.behandling.søknad.søknadInnhold.boforhold.ektefellePartnerSamboer.navn
                                        : '-',
                            },
                            {
                                tittel: intl.formatMessage({
                                    id: 'display.fraSøknad.ektemakeEllerSamboerUførFlyktning',
                                }),
                                verdi: props.behandling.søknad.søknadInnhold.boforhold.ektefellePartnerSamboer
                                    ? props.behandling.søknad.søknadInnhold.boforhold.ektefellePartnerSamboer
                                          .erUførFlyktning
                                        ? 'Ja'
                                        : 'Nei'
                                    : '-',
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default Sats;
