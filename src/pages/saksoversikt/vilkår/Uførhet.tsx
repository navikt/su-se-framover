import { useFormik } from 'formik';
import { Radio, RadioGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

const Uførhet = (props: VilkårsvurderingBaseProps) => {
    const formik = useFormik({
        initialValues: {},
        onSubmit(values) {
            console.log({ values });
            history.push(props.nesteUrl);
        },
    });
    const history = useHistory();

    return (
        <Vurdering tittel="Uførhet">
            {{
                left: (
                    <form onSubmit={formik.handleSubmit}>
                        <RadioGruppe legend="Har søker fått vedtak om uføretrygd der vilkårene i §12-4 til §12-7 i folketrygdloven er oppfylt?">
                            <Radio label="Ja" name="ja" />
                            <Radio label="Nei" name="nei" />
                            <Radio label="Har uføresak til behandling" name="saktilbehandling" />
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
