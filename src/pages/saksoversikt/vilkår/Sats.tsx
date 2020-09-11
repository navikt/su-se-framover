import { useFormik } from 'formik';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { SuperRadioGruppe } from '~components/FormElements';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { DelerBoligMed, Sats as BehandlingsinformasjonSats } from '~types/Behandlingsinformasjon';

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
        delerBolig: true,
        delerBoligMed: values.delerBoligMedHvem,
        ektemakeEllerSamboerUførFlyktning: values.mottarEktemakeEllerSamboerSU,
        ektemakeEllerSamboerUnder67År: values.erEktemakeEllerSamboerUnder67,
        begrunnelse: null,
    };
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
            history.push(props.forrigeUrl);
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
                            onChange={formik.setValues}
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
                                onChange={formik.setValues}
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
                                onChange={formik.setValues}
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
                                onChange={formik.setValues}
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
