import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Sats as FaktiskSats } from '~/types/Sats';
import { SuperRadioGruppe } from '~components/FormElements';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { DelerBoligMed } from '~features/søknad/types';
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

interface FormData {
    delerSøkerBolig: Nullable<boolean>;
    delerBoligMedHvem: Nullable<DelerBoligMed>;
    erEktemakeEllerSamboerUnder67: Nullable<boolean>;
    mottarEktemakeEllerSamboerSU: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

const toBosituasjon = (values: FormData): Nullable<Bosituasjon> => {
    if (values.delerSøkerBolig === null) {
        return null;
    }
    return {
        delerBolig: values.delerSøkerBolig,
        delerBoligMed: values.delerBoligMedHvem,
        ektemakeEllerSamboerUførFlyktning: values.mottarEktemakeEllerSamboerSU,
        ektemakeEllerSamboerUnder67År: values.erEktemakeEllerSamboerUnder67,
        begrunnelse: null,
    };
};

const utledSats = (values: FormData) => {
    if (values.delerSøkerBolig === null) {
        return null;
    }
    if (!values.delerSøkerBolig) {
        return FaktiskSats.Ordinær;
    }
    switch (values.delerBoligMedHvem) {
        case null:
            return null;
        case DelerBoligMed.VOKSNE_BARN:
        case DelerBoligMed.ANNEN_VOKSEN:
            return FaktiskSats.Ordinær;
        case DelerBoligMed.EKTEMAKE_SAMBOER:
            switch (values.erEktemakeEllerSamboerUnder67) {
                case null:
                    return null;
                case false:
                    return FaktiskSats.Ordinær;
                case true:
                    switch (values.mottarEktemakeEllerSamboerSU) {
                        case null:
                            return null;
                        case false:
                            return FaktiskSats.Ordinær;
                        case true:
                            return FaktiskSats.Ordinær;
                    }
            }
    }
};

const schema = yup.object<FormData>({
    delerSøkerBolig: yup.boolean().required(),
    delerBoligMedHvem: yup.mixed<DelerBoligMed>().when('delerSøkerBolig', {
        is: true,
        then: yup
            .mixed()
            .oneOf([DelerBoligMed.ANNEN_VOKSEN, DelerBoligMed.EKTEMAKE_SAMBOER, DelerBoligMed.VOKSNE_BARN]),
    }),
    erEktemakeEllerSamboerUnder67: yup.boolean().defined().when('delerBoligMedHvem', {
        is: DelerBoligMed.EKTEMAKE_SAMBOER,
        then: yup.boolean().required(),
        otherwise: yup.boolean().nullable().defined(),
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

    const eksisterende = props.behandling.behandlingsinformasjon.bosituasjon;
    const søknad = props.behandling.søknad.søknadInnhold;
    const formik = useFormik<FormData>({
        initialValues: {
            delerSøkerBolig: eksisterende?.delerBolig ?? søknad.boforhold.delerBoligMedVoksne,
            delerBoligMedHvem: eksisterende?.delerBoligMed ?? søknad.boforhold.delerBoligMed,
            erEktemakeEllerSamboerUnder67:
                eksisterende?.ektemakeEllerSamboerUnder67År ?? søknad.boforhold.ektemakeEllerSamboerUnder67År,
            mottarEktemakeEllerSamboerSU:
                eksisterende?.ektemakeEllerSamboerUførFlyktning ?? søknad.boforhold.ektemakeEllerSamboerUførFlyktning,
            begrunnelse: eksisterende?.begrunnelse ?? null,
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
        const v = toBosituasjon(values);
        if (!v) {
            return;
        }
        return dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    bosituasjon: v,
                },
            })
        );
    };

    const handleChange = (values: FormData) => {
        if (values.delerSøkerBolig !== true) {
            formik.setValues({
                delerSøkerBolig: values.delerSøkerBolig,
                delerBoligMedHvem: null,
                erEktemakeEllerSamboerUnder67: null,
                mottarEktemakeEllerSamboerSU: null,
                begrunnelse: values.begrunnelse,
            });
        } else if (values.delerBoligMedHvem !== DelerBoligMed.EKTEMAKE_SAMBOER) {
            formik.setValues({
                delerSøkerBolig: values.delerSøkerBolig,
                delerBoligMedHvem: values.delerBoligMedHvem,
                erEktemakeEllerSamboerUnder67: null,
                mottarEktemakeEllerSamboerSU: null,
                begrunnelse: values.begrunnelse,
            });
        } else if (values.erEktemakeEllerSamboerUnder67 !== true) {
            formik.setValues({
                delerSøkerBolig: values.delerSøkerBolig,
                delerBoligMedHvem: values.delerBoligMedHvem,
                erEktemakeEllerSamboerUnder67: values.erEktemakeEllerSamboerUnder67,
                mottarEktemakeEllerSamboerSU: null,
                begrunnelse: values.begrunnelse,
            });
        } else {
            formik.setValues({
                delerSøkerBolig: values.delerSøkerBolig,
                delerBoligMedHvem: values.delerBoligMedHvem,
                erEktemakeEllerSamboerUnder67: values.erEktemakeEllerSamboerUnder67,
                mottarEktemakeEllerSamboerSU: values.mottarEktemakeEllerSamboerSU,
                begrunnelse: values.begrunnelse,
            });
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
                        <SuperRadioGruppe
                            legend={intl.formatMessage({ id: 'radio.delerSøkerBoligOver18.legend' })}
                            values={formik.values}
                            errors={formik.errors}
                            property="delerSøkerBolig"
                            onChange={handleChange}
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
                        {formik.values.delerSøkerBolig && (
                            <SuperRadioGruppe
                                legend={intl.formatMessage({ id: 'radio.hvemDelerSøkerBoligMed.legend' })}
                                values={formik.values}
                                errors={formik.errors}
                                onChange={handleChange}
                                property="delerBoligMedHvem"
                                options={[
                                    {
                                        label: intl.formatMessage({
                                            id: 'radio.label.ektemakeEllerSamboer',
                                        }),
                                        radioValue: DelerBoligMed.EKTEMAKE_SAMBOER,
                                    },
                                    {
                                        label: intl.formatMessage({
                                            id: 'radio.label.voksneBarn',
                                        }),
                                        radioValue: DelerBoligMed.VOKSNE_BARN,
                                    },
                                    {
                                        label: intl.formatMessage({
                                            id: 'radio.label.annenVoksen',
                                        }),
                                        radioValue: DelerBoligMed.ANNEN_VOKSEN,
                                    },
                                ]}
                            />
                        )}
                        {formik.values.delerBoligMedHvem === DelerBoligMed.EKTEMAKE_SAMBOER && (
                            <SuperRadioGruppe
                                legend={intl.formatMessage({ id: 'radio.ektemakeEllerSamboerUnder67år.legend' })}
                                values={formik.values}
                                errors={formik.errors}
                                onChange={handleChange}
                                property="erEktemakeEllerSamboerUnder67"
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

                        {formik.values.erEktemakeEllerSamboerUnder67 === true && (
                            <SuperRadioGruppe
                                legend={intl.formatMessage({
                                    id: 'radio.ektemakeEllerSamboerUførFlyktning.legend',
                                })}
                                values={formik.values}
                                errors={formik.errors}
                                onChange={handleChange}
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
                        {utledSats(formik.values) && (
                            <>
                                <hr />
                                <span>
                                    {intl.formatMessage({
                                        id: 'display.sats',
                                    })}
                                    {utledSats(formik.values)}
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
                                    id: 'display.fraSøknad.ektemakeEllerSamboerUnder67år',
                                }),
                                verdi:
                                    props.behandling.søknad.søknadInnhold.boforhold.ektemakeEllerSamboerUnder67År ===
                                    null
                                        ? intl.formatMessage({
                                              id: 'display.fraSøknad.ikkeRegistert',
                                          })
                                        : props.behandling.søknad.søknadInnhold.boforhold.ektemakeEllerSamboerUnder67År
                                        ? intl.formatMessage({
                                              id: 'radio.label.ja',
                                          })
                                        : intl.formatMessage({
                                              id: 'radio.label.nei',
                                          }),
                            },
                            {
                                tittel: intl.formatMessage({
                                    id: 'display.fraSøknad.ektemakeEllerSamboerUførFlyktning',
                                }),
                                verdi:
                                    props.behandling.søknad.søknadInnhold.boforhold
                                        .ektemakeEllerSamboerUførFlyktning === null
                                        ? intl.formatMessage({
                                              id: 'display.fraSøknad.ikkeRegistert',
                                          })
                                        : props.behandling.søknad.søknadInnhold.boforhold
                                              .ektemakeEllerSamboerUførFlyktning
                                        ? intl.formatMessage({
                                              id: 'radio.label.ja',
                                          })
                                        : intl.formatMessage({
                                              id: 'radio.label.nei',
                                          }),
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default Sats;
