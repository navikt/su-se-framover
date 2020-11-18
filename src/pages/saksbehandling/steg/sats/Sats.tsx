import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Sats as FaktiskSats } from '~/types/Sats';
import { SuperRadioGruppe } from '~components/FormElements';
import { PersonkortEPS } from '~components/Personkort';
import { eqBosituasjon } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Bosituasjon } from '~types/Behandlingsinformasjon';

import Faktablokk from '../faktablokk/Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './sats-nb';
import styles from './sats.module.less';
import { EPSMedAlder, setSatsFaktablokk } from './utils';

interface FormData {
    epsFnr: Nullable<string>;
    epsAlder: Nullable<number>;
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
        begrunnelse: values.begrunnelse,
    };
};

const utledSats = (values: FormData, harEPS: boolean, epsAlder?: Nullable<number>) => {
    if (!values.delerSøkerBolig && values.delerSøkerBolig !== null) {
        return FaktiskSats.Høy;
    }

    if (harEPS && !epsAlder) {
        return 'Feil skjedde ved å utlede sats';
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

const schema = yup.object<FormData>({
    epsFnr: yup.string().nullable().defined(),
    epsAlder: yup.number().nullable().defined(),
    delerSøkerBolig: yup.boolean().defined().when('epsFnr', {
        is: null,
        then: yup.boolean().required(),
    }),
    mottarEktemakeEllerSamboerSU: yup
        .boolean()
        .defined()
        .test('eps mottar SU', 'Feltet må fylles ut', function (mottarSu) {
            const { epsFnr, epsAlder } = this.parent;

            if (epsFnr && epsAlder < 67) {
                return mottarSu !== null;
            }

            return true;
        }),
    begrunnelse: yup.string().defined(),
});

const Sats = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
    const eksisterendeBosituasjon = props.behandling.behandlingsinformasjon.bosituasjon;
    const eps = props.behandling.behandlingsinformasjon.ektefelle as Nullable<EPSMedAlder>;

    const formik = useFormik<FormData>({
        initialValues: {
            epsFnr: eps?.fnr ?? null,
            epsAlder: eps?.alder ?? null,
            delerSøkerBolig: eps ? null : eksisterendeBosituasjon?.delerBolig ?? null,
            mottarEktemakeEllerSamboerSU:
                eps && eps.alder && eps?.alder >= 67
                    ? null
                    : eksisterendeBosituasjon?.ektemakeEllerSamboerUførFlyktning ?? null,
            begrunnelse: eksisterendeBosituasjon?.begrunnelse ?? null,
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
        async onSubmit(values) {
            handleSave(values, props.nesteUrl);
        },
    });

    const handleSave = async (values: FormData, nesteUrl: string) => {
        const boSituasjonValues = toBosituasjon(values);
        if (!boSituasjonValues) {
            return;
        }

        if (eqBosituasjon.equals(boSituasjonValues, props.behandling.behandlingsinformasjon.bosituasjon)) {
            history.push(nesteUrl);
            return;
        }

        const res = await dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
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
                                    <PersonkortEPS eps={eps} />
                                </div>
                            )}
                        </div>
                        {!eps && (
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
                        )}
                        {eps?.alder && eps.alder < 67 ? (
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
                        ) : (
                            ''
                        )}
                        {utledSats(formik.values, Boolean(eps), eps?.alder) && (
                            <>
                                <hr />
                                <span>
                                    {`${intl.formatMessage({ id: 'display.sats' })} ${utledSats(
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
                                label={intl.formatMessage({
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
                        <Feiloppsummering
                            tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
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
                right: (
                    <Faktablokk
                        tittel={intl.formatMessage({
                            id: 'display.fraSøknad',
                        })}
                        fakta={setSatsFaktablokk(props.behandling.søknad.søknadInnhold, intl, eps)}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default Sats;
