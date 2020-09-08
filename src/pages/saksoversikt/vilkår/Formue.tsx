import { useFormik } from 'formik';
import { Input, Textarea, Checkbox } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Faktablokk from './Faktablokk';
import styles from './formue.module.less';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

const Hack = (props: { tittel: string }) => (
    <>
        <h3> {props.tittel} </h3>
        <Input className={styles.input} defaultValue={0} />
    </>
);
const formuer = [
    'Verdi boliger som ikke er primærbolig',
    'Verdi bil(sekundær), campingvogn eller kjøretøy',
    'Innskudd på konto (inkludert depositumskonto)',
    'Verdipapirer, aksjefond ++',
    'Skylder noen søker penger?',
    'Kontanter over 1000',
    'Depositumskonto',
];

const Formue = (props: VilkårsvurderingBaseProps) => {
    const formik = useFormik({
        initialValues: {},
        onSubmit(values) {
            console.log({ values });
            history.push(props.nesteUrl);
        },
    });
    const history = useHistory();
    const { formue } = props.behandling.søknad.søknadInnhold;

    return (
        <Vurdering tittel="Formue">
            {{
                left: (
                    <form onSubmit={formik.handleSubmit}>
                        {formuer.map((tittel, index) => (
                            <Hack key={index} tittel={tittel} />
                        ))}
                        <b>Totalt: todo</b>
                        <Checkbox label={'Må innhente mer informasjon'} />
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
                                tittel: 'Verdi på bolig',
                                verdi: formue.verdiPåBolig?.toString() ?? '0',
                            },
                            {
                                tittel: 'Verdi på eiendom',
                                verdi: formue.verdiPåEiendom?.toString() ?? '0',
                            },
                            {
                                tittel: 'Kjøretøy',
                                verdi:
                                    formue.kjøretøy
                                        ?.reduce((acc, kjøretøy) => acc + kjøretøy.verdiPåKjøretøy, 0)
                                        .toString() ?? '0',
                            },
                            {
                                tittel: 'Innskuddsbeløp',
                                verdi: formue.innskuddsBeløp?.toString() ?? '0',
                            },
                            {
                                tittel: 'Verdipapirbeløp',
                                verdi: formue.verdipapirBeløp?.toString() ?? '0',
                            },
                            {
                                tittel: 'Kontanter',
                                verdi: formue.kontanterBeløp?.toString() ?? '0',
                            },
                            {
                                tittel: 'SkylderNoenMegPengerBeløp',
                                verdi: formue.kontanterBeløp?.toString() ?? '0',
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default Formue;
