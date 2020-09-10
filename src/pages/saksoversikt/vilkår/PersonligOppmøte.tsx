import { useFormik } from 'formik';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

const PersonligOppmøte = (props: VilkårsvurderingBaseProps) => {
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
                        <RadioGruppe legend="Har søker møtt personlig?">
                            <Radio label="Ja" name="ja" />
                            <Radio label="Søker har verge" name="verge" />
                            <Radio
                                label="Søker har fullmektig som har møtt opp og legeattest for dette"
                                name="fullmektig"
                            />
                            <Radio label="Nei" name="nei" />
                        </RadioGruppe>
                        <RadioGruppe legend="Har søker verge eller fullmektig?">
                            <Radio label="Verge" name="verge" />
                            <Radio label="Fullmektig" name="fullmektig" />
                            <Radio label="Ingen av delene" name="ingen" />
                        </RadioGruppe>
                        <RadioGruppe legend="Legeattest?">
                            <Radio label="Ja" name="ja" />
                            <Radio label="Nei" name="nei" />
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
                                tittel: 'Hvem har møtt opp?',
                                verdi:
                                    props.behandling.søknad.søknadInnhold.forNav.harFullmektigEllerVerge === null
                                        ? 'Personlig'
                                        : props.behandling.søknad.søknadInnhold.forNav.harFullmektigEllerVerge,
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default PersonligOppmøte;
