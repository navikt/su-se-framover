import { useFormik } from 'formik';
import { Radio, RadioGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { LovligOppholdStatus } from '~types/Behandlingsinformasjon';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

interface FormData {
    status: Nullable<LovligOppholdStatus>;
}

const schema = yup.object<FormData>({
    status: yup
        .mixed<LovligOppholdStatus>()
        .defined()
        .oneOf(
            [LovligOppholdStatus.Uavklart, LovligOppholdStatus.VilkårIkkeOppfylt, LovligOppholdStatus.VilkårOppfylt],
            'Vennligst velg et alternativ '
        ),
});

const LovligOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.lovligOpphold?.status ?? null,
        },
        onSubmit(values) {
            console.log({ values });
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
    });
    const history = useHistory();

    return (
        <Vurdering tittel="Lovlig opphold i Norge">
            {{
                left: (
                    <form onSubmit={formik.handleSubmit}>
                        <RadioGruppe legend="Har søker lovlig opphold i Norge?" feil={formik.errors.status}>
                            <Radio
                                label="Ja"
                                name="lovligOppholdINorge"
                                onChange={() =>
                                    formik.setValues({ ...formik.values, status: LovligOppholdStatus.VilkårOppfylt })
                                }
                            />
                            <Radio
                                label="Nei"
                                name="lovligOppholdINorge"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: LovligOppholdStatus.VilkårIkkeOppfylt,
                                    })
                                }
                            />
                            <Radio
                                label="Uavklart"
                                name="lovligOppholdINorge"
                                onChange={() =>
                                    formik.setValues({ ...formik.values, status: LovligOppholdStatus.Uavklart })
                                }
                            />
                        </RadioGruppe>
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                console.log('tilbake');
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                if (!formik.values.status) return;

                                dispatch(
                                    lagreBehandlingsinformasjon({
                                        sakId: props.sakId,
                                        behandlingId: props.behandling.id,
                                        behandlingsinformasjon: {
                                            ...props.behandling.behandlingsinformasjon,
                                            lovligOpphold: {
                                                status: formik.values.status,
                                                begrunnelse: null,
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
                                tittel: 'Er du norsk statsborgare?',
                                verdi: props.behandling.søknad.søknadInnhold.oppholdstillatelse.erNorskStatsborger
                                    ? 'Ja'
                                    : 'Nei',
                            },
                            {
                                tittel: 'Oppholdstillatelse?',
                                verdi: props.behandling.søknad.søknadInnhold.oppholdstillatelse.typeOppholdstillatelse
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

export default LovligOppholdINorge;
