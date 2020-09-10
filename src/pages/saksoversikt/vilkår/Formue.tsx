import { useFormik } from 'formik';
import { Input, Textarea, Checkbox } from 'nav-frontend-skjema';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

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
    onChange: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e: React.ChangeEvent<any>): void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <T_1 = string | React.ChangeEvent<any>>(field: T_1): T_1 extends React.ChangeEvent<any>
            ? void
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (e: string | React.ChangeEvent<any>) => void;
    };
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

const Formue = (props: VilkårsvurderingBaseProps) => {
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [totalFormue, setTotalFormue] = useState<number | string>(0);
    const [totalFormueFraSøknad, setTotalFormueFraSøknad] = useState<number | string>(0);
    const { formue } = props.behandling.søknad.søknadInnhold;

    /*const formue = {
        borIBolig: true,
        verdiPåBolig: '10',
        boligBrukesTil: 'hehe',
        depositumsBeløp: '10',
        kontonummer: '5660',
        verdiPåEiendom: '10',
        eiendomBrukesTil: 'hehe',
        kjøretøy: [
            { verdiPåKjøretøy: 10, kjøretøyDeEier: 'kek' },
            { verdiPåKjøretøy: 10, kjøretøyDeEier: 'kek' },
        ],
        innskuddsBeløp: '10',
        verdipapirBeløp: '10',
        skylderNoenMegPengerBeløp: '10',
        kontanterBeløp: '10',
    };*/

    const formik = useFormik<FormData>({
        initialValues: {
            verdiPåBolig: formue.verdiPåBolig?.toString() || '0',
            verdiKjøretøy: totalVerdiKjøretøy(formue.kjøretøy).toString(),
            innskuddsBeløp: (
                parseInt(formue.innskuddsBeløp ? formue.innskuddsBeløp.toString() : '0', 10) +
                parseInt(formue.depositumsBeløp ? formue.depositumsBeløp.toString() : '0', 10)
            ).toString(),
            verdipapirBeløp: formue.verdipapirBeløp?.toString() || '0',
            skylderNoenMegPengerBeløp: formue.skylderNoenMegPengerBeløp?.toString() || '0',
            kontanterBeløp: formue.kontanterBeløp?.toString() || '0',
            depositumsBeløp: formue.depositumsBeløp?.toString() || '0',
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

    useEffect(() => {
        kalkulerFormue(formik.values);
    }, [formik.values]);

    useEffect(() => {
        kalkulerFormueFraSøknad();
    }, [formue]);

    function totalVerdiKjøretøy(kjøretøyArray: Nullable<Array<{ verdiPåKjøretøy: number; kjøretøyDeEier: string }>>) {
        if (kjøretøyArray === null) {
            return 0;
        }

        return kjøretøyArray.reduce((acc, kjøretøy) => acc + kjøretøy.verdiPåKjøretøy, 0);
    }

    function kalkulerFormueFraSøknad() {
        const formueFraSøknad = [
            formue.verdiPåBolig ? formue.verdiPåBolig.toString() : '0',
            formue.verdiPåEiendom ? formue.verdiPåEiendom.toString() : '0',
            totalVerdiKjøretøy(formue.kjøretøy).toString(),
            formue.innskuddsBeløp ? formue.innskuddsBeløp.toString() : '0',
            formue.verdipapirBeløp ? formue.verdipapirBeløp.toString() : '0',
            formue.skylderNoenMegPengerBeløp ? formue.skylderNoenMegPengerBeløp.toString() : '0',
            formue.kontanterBeløp ? formue.kontanterBeløp.toString() : '0',
            formue.depositumsBeløp ? formue.depositumsBeløp.toString() : '0',
        ];

        setTotalFormueFraSøknad(
            formueFraSøknad.reduce((acc, formue) => acc + parseInt(formue, 10), 0) -
                parseInt(formue.depositumsBeløp ? formue.depositumsBeløp.toString() : '0', 10)
        );
    }

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

        if (isNaN(totalt)) {
            setTotalFormue('Alle feltene må være tall for å regne ut');
        } else {
            setTotalFormue(totalt);
        }
    }

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
