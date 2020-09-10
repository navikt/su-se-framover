import { useFormik } from 'formik';
import { Input, Textarea, Checkbox } from 'nav-frontend-skjema';
import React, { useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { SøknadInnhold } from '~api/søknadApi';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';

import Faktablokk from './Faktablokk';
import styles from './formue.module.less';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

const FormueInput = (props: {
    className: string;
    tittel: string;
    inputName: string;
    defaultValues: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    feil: string | undefined;
}) => (
    <>
        <h3> {props.tittel} </h3>
        <Input
            className={props.className}
            name={props.inputName}
            defaultValue={props.defaultValues}
            feil={props.feil}
            onChange={props.onChange}
        />
    </>
);

interface FormData {
    verdiPåBolig: string;
    verdiKjøretøy: string;
    innskuddsBeløp: string;
    verdipapirBeløp: string;
    skylderNoenMegPengerBeløp: string;
    kontanterBeløp: string;
    depositumsBeløp: string;
    måHenteMerInfo: boolean;
    formueBegrunnelse: Nullable<string>;
}

const validateStringAsNumber = (yup.number().required().typeError('Feltet må være et tall') as unknown) as yup.Schema<
    string
>;

const schema = yup.object<FormData>({
    verdiPåBolig: validateStringAsNumber,
    verdiKjøretøy: validateStringAsNumber,
    innskuddsBeløp: validateStringAsNumber,
    verdipapirBeløp: validateStringAsNumber,
    skylderNoenMegPengerBeløp: validateStringAsNumber,
    kontanterBeløp: validateStringAsNumber,
    depositumsBeløp: validateStringAsNumber,
    måHenteMerInfo: yup.boolean().required(),
    formueBegrunnelse: yup.string().required().typeError('Begrunnelse kan ikke være tom'),
});

function kalkulerFormue(formikValues: FormData) {
    const formueArray = [
        formikValues.verdiPåBolig,
        formikValues.verdiKjøretøy,
        formikValues.innskuddsBeløp,
        formikValues.verdipapirBeløp,
        formikValues.skylderNoenMegPengerBeløp,
        formikValues.kontanterBeløp,
    ];

    const totalt =
        formueArray.reduce((acc, formue) => acc + parseInt(formue), 0) - parseInt(formikValues.depositumsBeløp, 10);
    return totalt;
}

function totalVerdiKjøretøy(kjøretøyArray: Nullable<Array<{ verdiPåKjøretøy: number; kjøretøyDeEier: string }>>) {
    if (kjøretøyArray === null) {
        return 0;
    }

    return kjøretøyArray.reduce((acc, kjøretøy) => acc + kjøretøy.verdiPåKjøretøy, 0);
}

function kalkulerFormueFraSøknad(f: SøknadInnhold['formue']) {
    const formueFraSøknad = [
        f.verdiPåBolig?.toString() ?? '0',
        f.verdiPåEiendom?.toString() ?? '0',
        totalVerdiKjøretøy(f.kjøretøy).toString(),
        f.innskuddsBeløp?.toString() ?? '0',
        f.verdipapirBeløp?.toString() ?? '0',
        f.skylderNoenMegPengerBeløp?.toString() ?? '0',
        f.kontanterBeløp?.toString() ?? '0',
        f.depositumsBeløp?.toString() ?? '0',
    ];

    return (
        formueFraSøknad.reduce((acc, formue) => acc + parseInt(formue, 10), 0) -
        parseInt(f.depositumsBeløp?.toString() ?? '0', 10)
    );
}

const Formue = (props: VilkårsvurderingBaseProps) => {
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const { formue } = props.behandling.søknad.søknadInnhold;

    const formik = useFormik<FormData>({
        initialValues: {
            verdiPåBolig: formue.verdiPåBolig?.toString() ?? '0',
            verdiKjøretøy: totalVerdiKjøretøy(formue.kjøretøy).toString(),
            innskuddsBeløp: (
                parseInt(formue.innskuddsBeløp?.toString() ?? '0', 10) +
                parseInt(formue.depositumsBeløp?.toString() ?? '0', 10)
            ).toString(),
            verdipapirBeløp: formue.verdipapirBeløp?.toString() ?? '0',
            skylderNoenMegPengerBeløp: formue.skylderNoenMegPengerBeløp?.toString() ?? '0',
            kontanterBeløp: formue.kontanterBeløp?.toString() ?? '0',
            depositumsBeløp: formue.depositumsBeløp?.toString() ?? '0',
            måHenteMerInfo: false,
            formueBegrunnelse: null,
        },
        onSubmit(values) {
            console.log({ values });
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });
    const history = useHistory();

    const totalFormue = useMemo(() => {
        const totalt = kalkulerFormue(formik.values);
        return isNaN(totalt) ? 'Alle feltene må være tall for å regne ut' : totalt;
    }, [formik.values]);

    const totalFormueFraSøknad = useMemo(() => {
        return kalkulerFormueFraSøknad(formue);
    }, [formue]);

    return (
        <Vurdering tittel="Formue">
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <FormueInput
                            tittel="Verdi boliger som ikke er primærbolig"
                            className={styles.formueInput}
                            inputName="verdiPåBolig"
                            defaultValues={formik.values.verdiPåBolig}
                            onChange={formik.handleChange}
                            feil={formik.errors.verdiPåBolig}
                        />
                        <FormueInput
                            tittel="Verdi bil(sekundær), campingvogn eller kjøretøy"
                            className={styles.formueInput}
                            inputName="verdiKjøretøy"
                            defaultValues={totalVerdiKjøretøy(formue.kjøretøy).toString()}
                            onChange={formik.handleChange}
                            feil={formik.errors.verdiKjøretøy}
                        />
                        <FormueInput
                            tittel="Innskudd på konto (inkludert depositumskonto)"
                            className={styles.formueInput}
                            inputName="innskuddsBeløp"
                            defaultValues={formik.values.innskuddsBeløp}
                            onChange={formik.handleChange}
                            feil={formik.errors.innskuddsBeløp}
                        />
                        <FormueInput
                            tittel="Verdipapirer, aksjefond ++"
                            className={styles.formueInput}
                            inputName="verdipapirBeløp"
                            defaultValues={formik.values.verdipapirBeløp}
                            onChange={formik.handleChange}
                            feil={formik.errors.verdipapirBeløp}
                        />
                        <FormueInput
                            tittel="Skylder noen søker penger?"
                            className={styles.formueInput}
                            inputName="skylderNoenMegPengerBeløp"
                            defaultValues={formik.values.skylderNoenMegPengerBeløp}
                            onChange={formik.handleChange}
                            feil={formik.errors.skylderNoenMegPengerBeløp}
                        />
                        <FormueInput
                            tittel="Kontanter over 1000"
                            className={styles.formueInput}
                            inputName="kontanterBeløp"
                            defaultValues={formik.values.kontanterBeløp}
                            onChange={formik.handleChange}
                            feil={formik.errors.kontanterBeløp}
                        />
                        <FormueInput
                            tittel="Depositumskonto"
                            className={styles.formueInput}
                            inputName="depositumsBeløp"
                            defaultValues={formik.values.depositumsBeløp}
                            onChange={formik.handleChange}
                            feil={formik.errors.depositumsBeløp}
                        />

                        <div className={styles.totalFormueContainer}>
                            <p className={styles.totalFormue}>Totalt: {totalFormue}</p>

                            {totalFormue > 500 ? (
                                <div>
                                    <p className={styles.vilkårOppfyltText}>
                                        Søker har mer enn 500 kroner i formue. Søker får dermed ikke Supplerende
                                        Stønad(TODO)
                                    </p>
                                    <hr></hr>
                                    <hr></hr>
                                </div>
                            ) : (
                                <div>
                                    <p className={styles.vilkårOppfyltText}>Oppfylt vilkår, formue under 0.5G(TODO)</p>
                                    <hr></hr>
                                    <hr></hr>
                                </div>
                            )}
                        </div>

                        <Checkbox
                            label={'Må innhente mer informasjon'}
                            name="måHenteMerInfo"
                            className={styles.henteMerInfoCheckbox}
                            checked={formik.values.måHenteMerInfo}
                            onChange={() =>
                                formik.setValues({ ...formik.values, måHenteMerInfo: !formik.values.måHenteMerInfo })
                            }
                        />
                        <Textarea
                            label="Begrunnelse"
                            name="formueBegrunnelse"
                            value={formik.values.formueBegrunnelse || ''}
                            onChange={formik.handleChange}
                            feil={formik.errors.formueBegrunnelse}
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
                    <div>
                        <Faktablokk
                            tittel="Fra søknad"
                            className={styles.formueFaktaBlokk}
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
                                    verdi: formue.skylderNoenMegPengerBeløp?.toString() ?? '0',
                                },
                                {
                                    tittel: 'Depositumskonto',
                                    verdi: formue.depositumsBeløp?.toString() ?? '0',
                                },
                            ]}
                        />
                        <p className={styles.formueFraSøknad}>Totalt: {totalFormueFraSøknad}</p>
                    </div>
                ),
            }}
        </Vurdering>
    );
};

export default Formue;
