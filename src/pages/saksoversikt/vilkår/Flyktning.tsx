import { useFormik } from 'formik';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { FlyktningStatus } from '~types/Behandlingsinformasjon';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

interface FormData {
    flyktningStatus: Nullable<FlyktningStatus>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    flyktningStatus: yup
        .mixed()
        .defined()
        .oneOf(
            [FlyktningStatus.VilkårOppfylt, FlyktningStatus.VilkårIkkeOppfylt, FlyktningStatus.Uavklart],
            'Vennligst velg et alternativ '
        ),
    begrunnelse: yup.string().defined(),
});

const Flyktning = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const formik = useFormik<FormData>({
        initialValues: {
            flyktningStatus:
                props.behandling.behandlingsinformasjon.flyktning?.status ??
                (props.behandling.søknad.søknadInnhold.flyktningsstatus.registrertFlyktning
                    ? FlyktningStatus.VilkårOppfylt
                    : FlyktningStatus.VilkårIkkeOppfylt),
            begrunnelse: props.behandling.behandlingsinformasjon.flyktning?.begrunnelse ?? null,
        },
        onSubmit(values) {
            if (!values.flyktningStatus) return;

            dispatch(
                lagreBehandlingsinformasjon({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    behandlingsinformasjon: {
                        flyktning: {
                            status: values.flyktningStatus,
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

    return (
        <Vurdering tittel="Flyktning">
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <RadioGruppe
                            legend="Er søker registrer flyktning etter utlendingslova §28?"
                            feil={formik.errors.flyktningStatus}
                        >
                            <Radio
                                label="Ja"
                                name="registertFlyktning"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        flyktningStatus: FlyktningStatus.VilkårOppfylt,
                                    })
                                }
                                defaultChecked={formik.values.flyktningStatus === FlyktningStatus.VilkårOppfylt}
                            />
                            <Radio
                                label="Nei"
                                name="registertFlyktning"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        flyktningStatus: FlyktningStatus.VilkårIkkeOppfylt,
                                    })
                                }
                                defaultChecked={formik.values.flyktningStatus === FlyktningStatus.VilkårIkkeOppfylt}
                            />
                            <Radio
                                label="Uavklart"
                                name="registertFlyktning"
                                onChange={() =>
                                    formik.setValues({ ...formik.values, flyktningStatus: FlyktningStatus.Uavklart })
                                }
                                defaultChecked={formik.values.flyktningStatus === FlyktningStatus.Uavklart}
                            />
                        </RadioGruppe>
                        <Textarea
                            label="Begrunnelse"
                            name="begrunnelse"
                            value={formik.values.begrunnelse || ''}
                            onChange={(e) => {
                                formik.setValues({
                                    ...formik.values,
                                    begrunnelse: e.target.value ? e.target.value : null,
                                });
                            }}
                            feil={formik.errors.begrunnelse}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                if (!formik.values.flyktningStatus) return;

                                dispatch(
                                    lagreBehandlingsinformasjon({
                                        sakId: props.sakId,
                                        behandlingId: props.behandling.id,
                                        behandlingsinformasjon: {
                                            ...props.behandling.behandlingsinformasjon,
                                            flyktning: {
                                                status: formik.values.flyktningStatus,
                                                begrunnelse: formik.values.begrunnelse,
                                            },
                                        },
                                    })
                                );
                            }}
                        />
                    </form>
                ),
                right: (
                    <Faktablokk
                        tittel="Fra søknad"
                        fakta={[
                            {
                                tittel: 'Er du registrert flyktning?',
                                verdi: props.behandling.søknad.søknadInnhold.flyktningsstatus.registrertFlyktning
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

export default Flyktning;
