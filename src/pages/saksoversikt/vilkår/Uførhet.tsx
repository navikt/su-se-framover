import { useFormik } from 'formik';
import { Radio, RadioGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { Nullable } from '~lib/types';
import yup from '~lib/validering';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

type UførhetType = Nullable<boolean> | 'uføresakTilBehandling';

interface FormData {
    harUførevedtak: UførhetType;
}

// eslint-disable-next-line
const schema = yup.object<FormData>({
    harUførevedtak: yup.mixed().defined().oneOf([true, false, 'uføresakTilBehandling']),
});
console.log(schema);

const Uførhet = (props: VilkårsvurderingBaseProps) => {
    const formik = useFormik<FormData>({
        initialValues: {
            harUførevedtak: null,
        },
        onSubmit(values) {
            console.log({ values });
            history.push(props.nesteUrl);
        },
        //TODO: fjern kommentar for validering
        //validationSchema: schema,
    });
    const history = useHistory();

    return (
        <Vurdering tittel="Uførhet">
            {{
                left: (
                    <form onSubmit={formik.handleSubmit}>
                        <RadioGruppe legend="Har søker fått vedtak om uføretrygd der vilkårene i §12-4 til §12-7 i folketrygdloven er oppfylt?">
                            <Radio
                                label="Ja"
                                name="harUførevedtak"
                                onChange={() => formik.setValues({ harUførevedtak: true })}
                            />
                            <Radio
                                label="Nei"
                                name="harUførevedtak"
                                onChange={() => formik.setValues({ harUførevedtak: false })}
                            />
                            <Radio
                                label="Har uføresak til behandling"
                                name="harUførevedtak"
                                onChange={() => formik.setValues({ harUførevedtak: 'uføresakTilBehandling' })}
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
