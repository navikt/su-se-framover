import { useFormik } from 'formik';
import { Radio, RadioGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { UførhetStatus } from '~types/Behandlingsinformasjon';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

interface FormData {
    uførevedtak: Nullable<UførhetStatus>;
}

const schema = yup.object<FormData>({
    uførevedtak: yup
        .mixed()
        .defined()
        .oneOf([UførhetStatus.VilkårOppfylt, UførhetStatus.VilkårIkkeOppfylt, UførhetStatus.HarUføresakTilBehandling]),
});

const Uførhet = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();

    const formik = useFormik<FormData>({
        initialValues: {
            uførevedtak: props.behandling.behandlingsinformasjon.uførhet?.status ?? null,
        },
        onSubmit(values) {
            console.log({ values });
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
    });
    const history = useHistory();

    return (
        <Vurdering tittel="Uførhet">
            {{
                left: (
                    <form onSubmit={formik.handleSubmit}>
                        <RadioGruppe
                            legend="Har søker fått vedtak om uføretrygd der vilkårene i §12-4 til §12-7 i folketrygdloven er oppfylt?"
                            feil={formik.errors.uførevedtak}
                        >
                            <Radio
                                label="Ja"
                                name="uførevedtak"
                                onChange={() => formik.setValues({ uførevedtak: UførhetStatus.VilkårOppfylt })}
                                defaultChecked={formik.values.uførevedtak === UførhetStatus.VilkårOppfylt}
                            />
                            <Radio
                                label="Nei"
                                name="uførevedtak"
                                onChange={() => formik.setValues({ uførevedtak: UførhetStatus.VilkårIkkeOppfylt })}
                                defaultChecked={formik.values.uførevedtak === UførhetStatus.VilkårIkkeOppfylt}
                            />
                            <Radio
                                label="Har uføresak til behandling"
                                name="uførevedtak"
                                onChange={() =>
                                    formik.setValues({ uførevedtak: UførhetStatus.HarUføresakTilBehandling })
                                }
                                defaultChecked={formik.values.uførevedtak === UførhetStatus.HarUføresakTilBehandling}
                            />
                        </RadioGruppe>
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                console.log('tilbake');
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                if (!formik.values.uførevedtak) return;

                                dispatch(
                                    lagreBehandlingsinformasjon({
                                        sakId: props.sakId,
                                        behandlingId: props.behandling.id,
                                        behandlingsinformasjon: {
                                            ...props.behandling.behandlingsinformasjon,
                                            uførhet: {
                                                status: formik.values.uførevedtak,
                                                uføregrad: null,
                                                forventetInntekt: null,
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
                                tittel: 'Har du fått vedtak om uføretrygd?',
                                verdi: props.behandling.søknad.søknadInnhold.uførevedtak.harUførevedtak ? 'Ja' : 'Nei',
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default Uførhet;
