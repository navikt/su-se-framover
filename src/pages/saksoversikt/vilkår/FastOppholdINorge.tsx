import { useFormik } from 'formik';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

const FastOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const formik = useFormik({
        initialValues: {},
        onSubmit(values) {
            console.log({ values });
            history.push(props.nesteUrl);
        },
    });
    const history = useHistory();

    return (
        <Vurdering tittel="Fast opphold i Norge?">
            {{
                left: (
                    <form onSubmit={formik.handleSubmit}>
                        <RadioGruppe legend="Oppholder søker sig fast i Norge">
                            <Radio label="Ja" name="ja" />
                            <Radio label="Nei" name="nei" />
                            <Radio label="Uavklart" name="uavklart" />
                        </RadioGruppe>
                        <Textarea label="Begrunnelse" name="begrunnelse" value="" onChange={formik.handleChange} />
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
