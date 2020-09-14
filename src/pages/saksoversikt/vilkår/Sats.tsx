import { useFormik } from 'formik';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { Sats as FaktiskSats } from '~api/behandlingApi';
import { SuperRadioGruppe } from '~components/FormElements';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { DelerBoligMed, Satsinformasjon as BehandlingsinformasjonSats } from '~types/Behandlingsinformasjon';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

interface FormData {
    delerSøkerBolig: Nullable<boolean>;
    delerBoligMedHvem: Nullable<DelerBoligMed>;
    erEktemakeEllerSamboerUnder67: Nullable<boolean>;
    mottarEktemakeEllerSamboerSU: Nullable<boolean>;
}

const toBehandlingsinformasjonSats = (values: FormData): Nullable<BehandlingsinformasjonSats> => {
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
        return FaktiskSats.Høy;
    }
    switch (values.delerBoligMedHvem) {
        case null:
            return null;
        case DelerBoligMed.VOKSNE_BARN:
        case DelerBoligMed.ANNEN_VOKSEN:
            return FaktiskSats.Lav;
        case DelerBoligMed.EKTEMAKE_SAMBOER:
            switch (values.erEktemakeEllerSamboerUnder67) {
                case null:
                    return null;
                case false:
                    return FaktiskSats.Lav;
                case true:
                    switch (values.mottarEktemakeEllerSamboerSU) {
                        case null:
                            return null;
                        case false:
                            return FaktiskSats.Høy;
                        case true:
                            return FaktiskSats.Lav;
                    }
            }
    }
};

const schema = yup.object<FormData>({
    delerSøkerBolig: yup.boolean().required(),
    delerBoligMedHvem: yup
        .mixed<DelerBoligMed>()
        .oneOf([DelerBoligMed.ANNEN_VOKSEN, DelerBoligMed.EKTEMAKE_SAMBOER, DelerBoligMed.VOKSNE_BARN]),
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
});

const Sats = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const history = useHistory();

    const eksisterende = props.behandling.behandlingsinformasjon.sats;
    const formik = useFormik<FormData>({
        initialValues: {
            delerSøkerBolig: eksisterende?.delerBolig ?? null,
            delerBoligMedHvem: eksisterende?.delerBoligMed ?? null,
            erEktemakeEllerSamboerUnder67: eksisterende?.ektemakeEllerSamboerUnder67År ?? null,
            mottarEktemakeEllerSamboerSU: eksisterende?.ektemakeEllerSamboerUførFlyktning ?? null,
        },
        validationSchema: schema,
        onSubmit: (values) => {
            handleSave(values);
            history.push(props.nesteUrl);
        },
    });

    const handleSave = async (values: FormData) => {
        const v = toBehandlingsinformasjonSats(values);
        if (!v) {
            return;
        }
        await dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    sats: v,
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
            });
        } else if (values.delerBoligMedHvem !== DelerBoligMed.EKTEMAKE_SAMBOER) {
            formik.setValues({
                delerSøkerBolig: values.delerSøkerBolig,
                delerBoligMedHvem: values.delerBoligMedHvem,
                erEktemakeEllerSamboerUnder67: null,
                mottarEktemakeEllerSamboerSU: null,
            });
        } else if (values.erEktemakeEllerSamboerUnder67 !== true) {
            formik.setValues({
                delerSøkerBolig: values.delerSøkerBolig,
                delerBoligMedHvem: values.delerBoligMedHvem,
                erEktemakeEllerSamboerUnder67: values.erEktemakeEllerSamboerUnder67,
                mottarEktemakeEllerSamboerSU: null,
            });
        } else {
            formik.setValues({
                delerSøkerBolig: values.delerSøkerBolig,
                delerBoligMedHvem: values.delerBoligMedHvem,
                erEktemakeEllerSamboerUnder67: values.erEktemakeEllerSamboerUnder67,
                mottarEktemakeEllerSamboerSU: values.mottarEktemakeEllerSamboerSU,
            });
        }
    };

    return (
        <Vurdering tittel="Sats">
            {{
                left: (
                    <form onSubmit={formik.handleSubmit}>
                        <SuperRadioGruppe
                            legend="Deler søker bolig med noen over 18 år?"
                            values={formik.values}
                            errors={formik.errors}
                            property="delerSøkerBolig"
                            onChange={handleChange}
                            options={[
                                {
                                    label: 'Ja',
                                    radioValue: true,
                                },
                                {
                                    label: 'Nei',
                                    radioValue: false,
                                },
                            ]}
                        />
                        {formik.values.delerSøkerBolig && (
                            <SuperRadioGruppe
                                legend="Hvem deler søker bolig med?"
                                values={formik.values}
                                errors={formik.errors}
                                onChange={handleChange}
                                property="delerBoligMedHvem"
                                options={[
                                    {
                                        label: 'Ektemake eller samboer',
                                        radioValue: DelerBoligMed.EKTEMAKE_SAMBOER,
                                    },
                                    {
                                        label: 'Voksne barn',
                                        radioValue: DelerBoligMed.VOKSNE_BARN,
                                    },
                                    {
                                        label: 'Annen voksen',
                                        radioValue: DelerBoligMed.ANNEN_VOKSEN,
                                    },
                                ]}
                            />
                        )}
                        {formik.values.delerBoligMedHvem === DelerBoligMed.EKTEMAKE_SAMBOER && (
                            <SuperRadioGruppe
                                legend="Er ektemake eller samboer under 67 år?"
                                values={formik.values}
                                errors={formik.errors}
                                onChange={handleChange}
                                property="erEktemakeEllerSamboerUnder67"
                                options={[
                                    {
                                        label: 'Ja',
                                        radioValue: true,
                                    },
                                    {
                                        label: 'Nei',
                                        radioValue: false,
                                    },
                                ]}
                            />
                        )}

                        {formik.values.erEktemakeEllerSamboerUnder67 === true && (
                            <SuperRadioGruppe
                                legend="Mottar ektemake eller samboer supplerende stønad for uføre flyktninger?"
                                values={formik.values}
                                errors={formik.errors}
                                onChange={handleChange}
                                property="mottarEktemakeEllerSamboerSU"
                                options={[
                                    {
                                        label: 'Ja',
                                        radioValue: true,
                                    },
                                    {
                                        label: 'Nei',
                                        radioValue: false,
                                    },
                                ]}
                            />
                        )}
                        {utledSats(formik.values) && (
                            <>
                                <hr />
                                <span>Sats: {utledSats(formik.values)}</span>
                                <hr />
                                <hr />
                            </>
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
                        tittel="Fra søknad"
                        fakta={[
                            {
                                tittel: 'Har oppholdstillatelse?',
                                verdi: props.behandling.søknad.søknadInnhold.boforhold.delerBoligMedVoksne
                                    ? 'Ja'
                                    : 'Nei',
                            },
                            {
                                tittel: 'Hvem deler søker bolig med?',
                                verdi: props.behandling.søknad.søknadInnhold.boforhold.delerBoligMed ?? '-',
                            },
                            {
                                tittel: 'Er ektemake eller samboer under 67 år?',
                                verdi:
                                    props.behandling.søknad.søknadInnhold.boforhold.ektemakeEllerSamboerUnder67År ===
                                    null
                                        ? '-'
                                        : props.behandling.søknad.søknadInnhold.boforhold.ektemakeEllerSamboerUnder67År
                                        ? 'Ja'
                                        : 'Nei',
                            },
                            {
                                tittel: 'Mottar ektemake eller samboer supplerende stønad for uføre flyktninger?',
                                verdi:
                                    props.behandling.søknad.søknadInnhold.boforhold
                                        .ektemakeEllerSamboerUførFlyktning === null
                                        ? '-'
                                        : props.behandling.søknad.søknadInnhold.boforhold
                                              .ektemakeEllerSamboerUførFlyktning
                                        ? 'Ja'
                                        : 'Nei',
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default Sats;
