import { useFormik } from 'formik';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import React from 'react';
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
    status: Nullable<FastOppholdINorgeStatus>;
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
    begrunnelse: yup.string().nullable().defined().typeError('Feltet kan ikke være tomt'),
});

const FastOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.fastOppholdINorge?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.fastOppholdINorge?.begrunnelse ?? null,
        },
        onSubmit() {
            updateBehandlingsinformasjon();
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
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
                    <form onSubmit={formik.handleSubmit}>
                        <RadioGruppe legend="Oppholder søker sig fast i Norge" feil={formik.errors.status}>
                            <Radio
                                label="Ja"
                                name="fastOppholdINorge"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: FastOppholdINorgeStatus.VilkårOppfylt,
                                    })
                                }
                                defaultChecked={formik.values.status === FastOppholdINorgeStatus.VilkårOppfylt}
                            />
                            <Radio
                                label="Nei"
                                name="fastOppholdINorge"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: FastOppholdINorgeStatus.VilkårIkkeOppfylt,
                                    })
                                }
                                defaultChecked={formik.values.status === FastOppholdINorgeStatus.VilkårIkkeOppfylt}
                            />
                            <Radio
                                label="Uavklart"
                                name="fastOppholdINorge"
                                onChange={() =>
                                    formik.setValues({ ...formik.values, status: FastOppholdINorgeStatus.Uavklart })
                                }
                                defaultChecked={formik.values.status === FastOppholdINorgeStatus.Uavklart}
                            />
                        </RadioGruppe>
                        <Textarea
                            label="Begrunnelse"
                            name="fastOppholdINorgeBegrunnelse"
                            feil={formik.errors.begrunnelse}
                            value={formik.values.begrunnelse ?? ''}
                            onChange={(e) => {
                                formik.setValues({ ...formik.values, begrunnelse: e.target.value });
                            }}
                        />
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
