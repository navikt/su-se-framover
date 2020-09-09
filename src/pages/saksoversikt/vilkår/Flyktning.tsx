import { useFormik } from 'formik';
import { Radio, RadioGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { Nullable } from '~lib/types';
import yup from '~lib/validering';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

type FlyktningType = Nullable<boolean> | 'uavklart';

interface FormData {
    registertFlyktning: FlyktningType;
}

const schema = yup.object<FormData>({
    registertFlyktning: yup.mixed().defined().oneOf([true, false, 'uavklart'], 'Vennligst velg et alternativ '),
});

const Flyktning = (props: VilkårsvurderingBaseProps) => {
    const formik = useFormik<FormData>({
        initialValues: {
            registertFlyktning: null,
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
                            feil={formik.errors.registertFlyktning}
                        >
                            <Radio
                                label="Ja"
                                name="registertFlyktning"
                                onChange={() => formik.setValues({ registertFlyktning: true })}
                            />
                            <Radio
                                label="Nei"
                                name="registertFlyktning"
                                onChange={() => formik.setValues({ registertFlyktning: false })}
                            />
                            <Radio
                                label="Uavklart"
                                name="registertFlyktning"
                                onChange={() => formik.setValues({ registertFlyktning: 'uavklart' })}
                            />
                        </RadioGruppe>
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                console.log('tilbake');
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                console.log('lagre og fortsett senere');
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
