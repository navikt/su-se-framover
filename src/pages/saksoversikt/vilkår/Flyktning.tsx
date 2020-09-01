import { useFormik } from 'formik';
import { Radio, RadioGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

const Flyktning = (props: VilkårsvurderingBaseProps) => {
    const formik = useFormik({
        initialValues: {},
        onSubmit(values) {
            console.log({ values });
            history.push(props.nesteUrl);
        },
    });
    const history = useHistory();

    return (
        <Vurdering tittel="Flyktning">
            {{
                left: (
                    <form onSubmit={formik.handleSubmit}>
                        <RadioGruppe legend="Er søker registrer flyktning etter utlendingslova §28?">
                            <Radio label="Ja" name="ja" />
                            <Radio label="Nei" name="nei" />
                            <Radio label="Uavklart" name="uavklart" />
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
