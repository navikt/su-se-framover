import { useFormik } from 'formik';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { FastOppholdINorgeStatus } from '~types/Behandlingsinformasjon';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

interface FormData {
    status?: FastOppholdINorgeStatus;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    status: yup
        .mixed<FastOppholdINorgeStatus>()
        .defined()
        .oneOf(
            [
                FastOppholdINorgeStatus.Uavklart,
                FastOppholdINorgeStatus.VilkårIkkeOppfylt,
                FastOppholdINorgeStatus.VilkårOppfylt,
            ],
            'Vennligst velg et alternativ '
        ),
    begrunnelse: yup.string().nullable().defined().when('status', {
        is: FastOppholdINorgeStatus.Uavklart,
        then: yup.string().required(),
        otherwise: yup.string().nullable().defined(),
    }),
});

const FastOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.fastOppholdINorge?.status ?? undefined,
            begrunnelse: props.behandling.behandlingsinformasjon.fastOppholdINorge?.begrunnelse ?? null,
        },
        onSubmit(values) {
            if (!values.status) return;

            dispatch(
                lagreBehandlingsinformasjon({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    behandlingsinformasjon: {
                        fastOppholdINorge: {
                            status: values.status,
                            begrunnelse: values.begrunnelse,
                        },
                    },
                })
            );

            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });
    const history = useHistory();
    const updateBehandlingsinformasjon = () => {
        if (!formik.values.status) return;

        dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    fastOppholdINorge: {
                        status: formik.values.status,
                        begrunnelse: formik.values.begrunnelse,
                    },
                },
            })
        );
    };

    return (
        <Vurdering tittel="Fast opphold i Norge?">
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <RadioGruppe legend="Oppholder søker sig fast i Norge" feil={formik.errors.status}>
                            <Radio
                                label="Ja"
                                name="fastOppholdINorge"
                                checked={formik.values.status === FastOppholdINorgeStatus.VilkårOppfylt}
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: FastOppholdINorgeStatus.VilkårOppfylt,
                                        begrunnelse: null,
                                    })
                                }
                                defaultChecked={formik.values.status === FastOppholdINorgeStatus.VilkårOppfylt}
                            />
                            <Radio
                                label="Nei"
                                name="fastOppholdINorge"
                                checked={formik.values.status === FastOppholdINorgeStatus.VilkårIkkeOppfylt}
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: FastOppholdINorgeStatus.VilkårIkkeOppfylt,
                                        begrunnelse: null,
                                    })
                                }
                                defaultChecked={formik.values.status === FastOppholdINorgeStatus.VilkårIkkeOppfylt}
                            />
                            <Radio
                                label="Uavklart"
                                name="fastOppholdINorge"
                                checked={formik.values.status === FastOppholdINorgeStatus.Uavklart}
                                onChange={() =>
                                    formik.setValues({ ...formik.values, status: FastOppholdINorgeStatus.Uavklart })
                                }
                                defaultChecked={formik.values.status === FastOppholdINorgeStatus.Uavklart}
                            />
                        </RadioGruppe>
                        {formik.values.status === FastOppholdINorgeStatus.Uavklart && (
                            <Textarea
                                label="Begrunnelse"
                                name="begrunnelse"
                                feil={formik.errors.begrunnelse}
                                value={formik.values.begrunnelse ?? ''}
                                onChange={formik.handleChange}
                            />
                        )}
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={updateBehandlingsinformasjon}
                        />
                    </form>
                ),
                right: (
                    <Faktablokk
                        tittel="Fra søknad"
                        fakta={[
                            {
                                tittel: 'Har oppholdstillatelse?',
                                verdi: props.behandling.søknad.søknadInnhold.oppholdstillatelse.harOppholdstillatelse
                                    ? 'Ja'
                                    : 'Nei',
                            },
                            {
                                tittel: 'Type oppholdstillatelse',
                                verdi:
                                    props.behandling.søknad.søknadInnhold.oppholdstillatelse.typeOppholdstillatelse ??
                                    '',
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default FastOppholdINorge;
