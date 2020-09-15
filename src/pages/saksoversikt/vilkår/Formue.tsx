import { useFormik } from 'formik';
import { Input, Textarea, Checkbox } from 'nav-frontend-skjema';
import React, { useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { SøknadInnhold } from '~api/søknadApi';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { FormueStatus } from '~types/Behandlingsinformasjon';

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
    status: FormueStatus;
    verdiIkkePrimærbolig: string;
    verdiKjøretøy: string;
    innskudd: string;
    verdipapir: string;
    pengerSkyldt: string;
    kontanter: string;
    depositumskonto: string;
    begrunnelse: Nullable<string>;
}

const validateStringAsNumber = (yup.number().required().typeError('Feltet må være et tall') as unknown) as yup.Schema<
    string
>;

const schema = yup.object<FormData>({
    verdiIkkePrimærbolig: validateStringAsNumber,
    verdiKjøretøy: validateStringAsNumber,
    innskudd: validateStringAsNumber,
    verdipapir: validateStringAsNumber,
    pengerSkyldt: validateStringAsNumber,
    kontanter: validateStringAsNumber,
    depositumskonto: validateStringAsNumber,
    status: yup.mixed().required().oneOf([FormueStatus.Ok, FormueStatus.MåInnhenteMerInformasjon]),
    begrunnelse: yup.string().defined(),
});

function kalkulerFormue(formikValues: FormData) {
    const formueArray = [
        formikValues.verdiIkkePrimærbolig,
        formikValues.verdiKjøretøy,
        formikValues.innskudd,
        formikValues.verdipapir,
        formikValues.pengerSkyldt,
        formikValues.kontanter,
    ];

    const totalt =
        formueArray.reduce((acc, formue) => acc + parseInt(formue), 0) - parseInt(formikValues.depositumskonto, 10);
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
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const { formue } = props.behandling.søknad.søknadInnhold;

    const formik = useFormik<FormData>({
        initialValues: {
            verdiIkkePrimærbolig: formue.verdiPåBolig?.toString() ?? '0',
            verdiKjøretøy: totalVerdiKjøretøy(formue.kjøretøy).toString(),
            innskudd: (
                parseInt(formue.innskuddsBeløp?.toString() ?? '0', 10) +
                parseInt(formue.depositumsBeløp?.toString() ?? '0', 10)
            ).toString(),
            verdipapir: formue.verdipapirBeløp?.toString() ?? '0',
            pengerSkyldt: formue.skylderNoenMegPengerBeløp?.toString() ?? '0',
            kontanter: formue.kontanterBeløp?.toString() ?? '0',
            depositumskonto: formue.depositumsBeløp?.toString() ?? '0',
            status: FormueStatus.Ok,
            begrunnelse: props.behandling.behandlingsinformasjon.formue?.begrunnelse ?? null,
        },
        onSubmit(values) {
            dispatch(
                lagreBehandlingsinformasjon({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    behandlingsinformasjon: {
                        formue: {
                            status: values.status,
                            verdiIkkePrimærbolig: parseInt(values.verdiIkkePrimærbolig, 10),
                            verdiKjøretøy: parseInt(values.verdiKjøretøy, 10),
                            innskudd: parseInt(values.innskudd, 10),
                            verdipapir: parseInt(values.verdipapir, 10),
                            pengerSkyldt: parseInt(values.pengerSkyldt, 10),
                            kontanter: parseInt(values.kontanter, 10),
                            depositumskonto: parseInt(values.depositumskonto, 10),
                            begrunnelse: values.begrunnelse,
                        },
                    },
                })
            );
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
                            inputName="verdiIkkePrimærbolig"
                            defaultValues={formik.values.verdiIkkePrimærbolig}
                            onChange={formik.handleChange}
                            feil={formik.errors.verdiIkkePrimærbolig}
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
                            inputName="innskudd"
                            defaultValues={formik.values.innskudd}
                            onChange={formik.handleChange}
                            feil={formik.errors.innskudd}
                        />
                        <FormueInput
                            tittel="Verdipapirer, aksjefond ++"
                            className={styles.formueInput}
                            inputName="verdipapir"
                            defaultValues={formik.values.verdipapir}
                            onChange={formik.handleChange}
                            feil={formik.errors.verdipapir}
                        />
                        <FormueInput
                            tittel="Skylder noen søker penger?"
                            className={styles.formueInput}
                            inputName="pengerSkyldt"
                            defaultValues={formik.values.pengerSkyldt}
                            onChange={formik.handleChange}
                            feil={formik.errors.pengerSkyldt}
                        />
                        <FormueInput
                            tittel="Kontanter over 1000"
                            className={styles.formueInput}
                            inputName="kontanter"
                            defaultValues={formik.values.kontanter}
                            onChange={formik.handleChange}
                            feil={formik.errors.kontanter}
                        />
                        <FormueInput
                            tittel="Depositumskonto"
                            className={styles.formueInput}
                            inputName="depositumskonto"
                            defaultValues={formik.values.depositumskonto}
                            onChange={formik.handleChange}
                            feil={formik.errors.depositumskonto}
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
                            name="status"
                            className={styles.henteMerInfoCheckbox}
                            checked={formik.values.status === FormueStatus.MåInnhenteMerInformasjon}
                            onChange={() => {
                                formik.setValues({
                                    ...formik.values,
                                    status:
                                        formik.values.status === FormueStatus.Ok
                                            ? FormueStatus.MåInnhenteMerInformasjon
                                            : FormueStatus.Ok,
                                });
                            }}
                        />
                        <Textarea
                            label="Begrunnelse"
                            name="begrunnelse"
                            value={formik.values.begrunnelse || ''}
                            onChange={formik.handleChange}
                            feil={formik.errors.begrunnelse}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                dispatch(
                                    lagreBehandlingsinformasjon({
                                        sakId: props.sakId,
                                        behandlingId: props.behandling.id,
                                        behandlingsinformasjon: {
                                            formue: {
                                                status: formik.values.status,
                                                verdiIkkePrimærbolig: parseInt(formik.values.verdiIkkePrimærbolig, 10),
                                                verdiKjøretøy: parseInt(formik.values.verdiKjøretøy, 10),
                                                innskudd: parseInt(formik.values.innskudd, 10),
                                                verdipapir: parseInt(formik.values.verdipapir, 10),
                                                pengerSkyldt: parseInt(formik.values.pengerSkyldt, 10),
                                                kontanter: parseInt(formik.values.kontanter, 10),
                                                depositumskonto: parseInt(formik.values.depositumskonto, 10),
                                                begrunnelse: formik.values.begrunnelse,
                                            },
                                        },
                                    })
                                );
                            }}
                        />
                    </form>
                ),
                right: (
                    <div>
                        <Faktablokk
                            tittel="Fra søknad"
                            faktaBlokkerClassName={styles.formueFaktaBlokk}
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
