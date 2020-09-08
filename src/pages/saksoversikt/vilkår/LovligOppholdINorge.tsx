import { useFormik } from 'formik';
import { Radio, RadioGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

const LovligOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const formik = useFormik({
        initialValues: {},
        onSubmit(values) {
            console.log({ values });
            history.push(props.nesteUrl);
        },
    });
    const history = useHistory();

    return (
        <Vurdering tittel="Lovlig opphold i Norge">
            {{
                left: (
                    <form onSubmit={formik.handleSubmit}>
                        <RadioGruppe legend="Har søker lovlig opphold i Norge?">
                            <Radio label="Ja" name="ja" />
                            <Radio label="Nei" name="nei" />
                            <Radio label="Uavklart" name="saktilbehandling" />
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
