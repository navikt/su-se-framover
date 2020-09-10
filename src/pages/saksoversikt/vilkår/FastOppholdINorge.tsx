import { useFormik } from 'formik';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { Nullable } from '~lib/types';
import yup from '~lib/validering';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

type FastOppholdINorgeType = Nullable<boolean> | 'uavklart';

interface FormData {
    fastOppholdINorge: FastOppholdINorgeType;
    fastOppholdINorgeBegrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    fastOppholdINorge: yup.mixed().defined().oneOf([true, false, 'uavklart'], 'Vennligst velg et alternativ '),
    fastOppholdINorgeBegrunnelse: yup.string().required().typeError('Feltet kan ikke være tomt'),
});

const FastOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const formik = useFormik<FormData>({
        initialValues: {
            fastOppholdINorge: null,
            fastOppholdINorgeBegrunnelse: null,
        },
        onSubmit(values) {
            console.log({ values });
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
    });
    const history = useHistory();

    return (
        <Vurdering tittel="Fast opphold i Norge?">
            {{
                left: (
                    <form onSubmit={formik.handleSubmit}>
                        <RadioGruppe legend="Oppholder søker sig fast i Norge" feil={formik.errors.fastOppholdINorge}>
                            <Radio
                                label="Ja"
                                name="fastOppholdINorge"
                                onChange={() => formik.setValues({ ...formik.values, fastOppholdINorge: true })}
                            />
                            <Radio
                                label="Nei"
                                name="fastOppholdINorge"
                                onChange={() => formik.setValues({ ...formik.values, fastOppholdINorge: false })}
                            />
                            <Radio
                                label="Uavklart"
                                name="fastOppholdINorge"
                                onChange={() => formik.setValues({ ...formik.values, fastOppholdINorge: 'uavklart' })}
                            />
                        </RadioGruppe>
                        <Textarea
                            label="Begrunnelse"
                            name="fastOppholdINorgeBegrunnelse"
                            feil={formik.errors.fastOppholdINorgeBegrunnelse}
                            value={formik.values.fastOppholdINorgeBegrunnelse || ''}
                            onChange={formik.handleChange}
                        />
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
