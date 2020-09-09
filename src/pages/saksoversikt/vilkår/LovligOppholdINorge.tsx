import { useFormik } from 'formik';
import { Radio, RadioGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { Nullable } from '~lib/types';
import yup from '~lib/validering';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

type LovligOppholdINorgeType = Nullable<boolean> | 'uavklart';

interface FormData {
    lovligOppholdINorge: LovligOppholdINorgeType;
}

const schema = yup.object<FormData>({
    lovligOppholdINorge: yup.mixed().defined().oneOf([true, false, 'uavklart'], 'Vennligst velg et alternativ '),
});

const LovligOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const formik = useFormik<FormData>({
        initialValues: {
            lovligOppholdINorge: null,
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
                        <RadioGruppe
                            legend="Har søker lovlig opphold i Norge?"
                            feil={formik.errors.lovligOppholdINorge}
                        >
                            <Radio
                                label="Ja"
                                name="lovligOppholdINorge"
                                onChange={() => formik.setValues({ lovligOppholdINorge: true })}
                            />
                            <Radio
                                label="Nei"
                                name="lovligOppholdINorge"
                                onChange={() => formik.setValues({ lovligOppholdINorge: false })}
                            />
                            <Radio
                                label="Uavklart"
                                name="lovligOppholdINorge"
                                onChange={() => formik.setValues({ lovligOppholdINorge: 'uavklart' })}
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
