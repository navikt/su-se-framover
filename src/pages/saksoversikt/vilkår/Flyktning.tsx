import { useFormik } from 'formik';
import { Radio, RadioGruppe } from 'nav-frontend-skjema';
import React from 'react';
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
}

const schema = yup.object<FormData>({
    flyktningStatus: yup
        .mixed()
        .defined()
        .oneOf(
            [FlyktningStatus.VilkårOppfylt, FlyktningStatus.VilkårIkkeOppfylt, FlyktningStatus.Uavklart],
            'Vennligst velg et alternativ '
        ),
});

const Flyktning = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const formik = useFormik<FormData>({
        initialValues: {
            flyktningStatus: props.behandling.behandlingsinformasjon.flyktning?.status ?? null,
        },
        onSubmit(values) {
            console.log({ values });
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
    });
    const history = useHistory();

    return (
        <Vurdering tittel="Flyktning">
            {{
                left: (
                    <form onSubmit={formik.handleSubmit}>
                        <RadioGruppe
                            legend="Er søker registrer flyktning etter utlendingslova §28?"
                            feil={formik.errors.flyktningStatus}
                        >
                            <Radio
                                label="Ja"
                                name="registertFlyktning"
                                onChange={() => formik.setValues({ flyktningStatus: FlyktningStatus.VilkårOppfylt })}
                                defaultChecked={formik.values.flyktningStatus === FlyktningStatus.VilkårOppfylt}
                            />
                            <Radio
                                label="Nei"
                                name="registertFlyktning"
                                onChange={() =>
                                    formik.setValues({ flyktningStatus: FlyktningStatus.VilkårIkkeOppfylt })
                                }
                                defaultChecked={formik.values.flyktningStatus === FlyktningStatus.VilkårIkkeOppfylt}
                            />
                            <Radio
                                label="Uavklart"
                                name="registertFlyktning"
                                onChange={() => formik.setValues({ flyktningStatus: FlyktningStatus.Uavklart })}
                                defaultChecked={formik.values.flyktningStatus === FlyktningStatus.Uavklart}
                            />
                        </RadioGruppe>
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
                                                begrunnelse: null,
                                                status: formik.values.flyktningStatus,
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
