import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Input, Textarea, Checkbox } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup, { validateStringAsNumber } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { FormueStatus, Formue, Behandlingsinformasjon } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';

import Faktablokk from '../Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './formue-nb';
import styles from './formue.module.less';

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

const schema = yup.object<FormData>({
    verdiIkkePrimærbolig: validateStringAsNumber,
    verdiKjøretøy: validateStringAsNumber,
    innskudd: validateStringAsNumber,
    verdipapir: validateStringAsNumber,
    pengerSkyldt: validateStringAsNumber,
    kontanter: validateStringAsNumber,
    depositumskonto: validateStringAsNumber,
    status: yup.mixed().required().oneOf([FormueStatus.VilkårOppfylt, FormueStatus.MåInnhenteMerInformasjon]),
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

const setInitialValues = (behandlingsInfo: Behandlingsinformasjon, søknadsInnhold: SøknadInnhold) => {
    const behandlingsFormue = behandlingsInfo.formue;
    const søknadsFormue = søknadsInnhold.formue;

    return {
        verdiIkkePrimærbolig:
            behandlingsFormue?.verdiIkkePrimærbolig?.toString() ?? søknadsFormue.verdiPåBolig?.toString() ?? '0',
        verdiKjøretøy:
            behandlingsFormue?.verdiKjøretøy?.toString() ?? totalVerdiKjøretøy(søknadsFormue.kjøretøy).toString(),
        innskudd:
            behandlingsFormue?.innskudd?.toString() ??
            (
                parseInt(søknadsFormue.innskuddsBeløp?.toString() ?? '0', 10) +
                parseInt(søknadsFormue.depositumsBeløp?.toString() ?? '0', 10)
            ).toString(),
        verdipapir: behandlingsFormue?.verdipapir?.toString() ?? søknadsFormue.verdipapirBeløp?.toString() ?? '0',
        pengerSkyldt:
            behandlingsFormue?.pengerSkyldt?.toString() ?? søknadsFormue.skylderNoenMegPengerBeløp?.toString() ?? '0',
        kontanter: behandlingsFormue?.kontanter?.toString() ?? søknadsFormue.kontanterBeløp?.toString() ?? '0',
        depositumskonto:
            behandlingsFormue?.depositumskonto?.toString() ?? søknadsFormue.depositumsBeløp?.toString() ?? '0',
        status: behandlingsFormue?.status ?? FormueStatus.VilkårOppfylt,
        begrunnelse: behandlingsFormue?.begrunnelse ?? null,
    };
};

const Formue = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const søknadInnhold = props.behandling.søknad.søknadInnhold;
    const behandlingsInfo = props.behandling.behandlingsinformasjon;
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
    const G = 101351;

    const formik = useFormik<FormData>({
        initialValues: setInitialValues(behandlingsInfo, søknadInnhold),
        async onSubmit(values) {
            const res = await dispatch(
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

            if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
                history.push(props.nesteUrl);
            }
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });
    const history = useHistory();

    const totalFormue = useMemo(() => {
        const totalt = kalkulerFormue(formik.values);
        return isNaN(totalt) ? intl.formatMessage({ id: 'display.totalt.fyllUtAlleFelter' }) : totalt;
    }, [formik.values]);

    const totalFormueFraSøknad = useMemo(() => {
        return kalkulerFormueFraSøknad(søknadInnhold.formue);
    }, [søknadInnhold.formue]);

    return (
        <Vurdering tittel={intl.formatMessage({ id: 'page.tittel' })}>
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.verdiIkkePrimærBolig' })}
                            className={styles.formueInput}
                            inputName="verdiIkkePrimærbolig"
                            defaultValues={formik.values.verdiIkkePrimærbolig}
                            onChange={formik.handleChange}
                            feil={formik.errors.verdiIkkePrimærbolig}
                        />
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.verdiKjøretøy' })}
                            className={styles.formueInput}
                            inputName="verdiKjøretøy"
                            defaultValues={formik.values.verdiKjøretøy}
                            onChange={formik.handleChange}
                            feil={formik.errors.verdiKjøretøy}
                        />
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.inskuddPåKonto' })}
                            className={styles.formueInput}
                            inputName="innskudd"
                            defaultValues={formik.values.innskudd}
                            onChange={formik.handleChange}
                            feil={formik.errors.innskudd}
                        />
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.verdipapir' })}
                            className={styles.formueInput}
                            inputName="verdipapir"
                            defaultValues={formik.values.verdipapir}
                            onChange={formik.handleChange}
                            feil={formik.errors.verdipapir}
                        />
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.skylderNoenSøkerPenger' })}
                            className={styles.formueInput}
                            inputName="pengerSkyldt"
                            defaultValues={formik.values.pengerSkyldt}
                            onChange={formik.handleChange}
                            feil={formik.errors.pengerSkyldt}
                        />
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.kontanterOver1000' })}
                            className={styles.formueInput}
                            inputName="kontanter"
                            defaultValues={formik.values.kontanter}
                            onChange={formik.handleChange}
                            feil={formik.errors.kontanter}
                        />
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.depositumskonto' })}
                            className={styles.formueInput}
                            inputName="depositumskonto"
                            defaultValues={formik.values.depositumskonto}
                            onChange={formik.handleChange}
                            feil={formik.errors.depositumskonto}
                        />

                        <div className={styles.totalFormueContainer}>
                            <p className={styles.totalFormue}>
                                {intl.formatMessage({ id: 'display.totalt' })} {totalFormue}
                            </p>

                            {totalFormue > 0.5 * G ? (
                                <div>
                                    <p className={styles.vilkårOppfyltText}>
                                        {intl.formatMessage({ id: 'display.vilkårIkkeOppfylt' })}
                                    </p>
                                    <hr></hr>
                                    <hr></hr>
                                </div>
                            ) : (
                                <div>
                                    <p className={styles.vilkårOppfyltText}>
                                        {intl.formatMessage({ id: 'display.vilkårOppfylt' })}
                                    </p>
                                    <hr></hr>
                                    <hr></hr>
                                </div>
                            )}
                        </div>

                        <Checkbox
                            label={intl.formatMessage({ id: 'checkbox.henteMerInfo' })}
                            name="status"
                            className={styles.henteMerInfoCheckbox}
                            checked={formik.values.status === FormueStatus.MåInnhenteMerInformasjon}
                            onChange={() => {
                                formik.setValues({
                                    ...formik.values,
                                    status:
                                        formik.values.status === FormueStatus.VilkårOppfylt
                                            ? FormueStatus.MåInnhenteMerInformasjon
                                            : FormueStatus.VilkårOppfylt,
                                });
                            }}
                        />
                        <Textarea
                            label={intl.formatMessage({ id: 'input.label.begrunnelse' })}
                            name="begrunnelse"
                            value={formik.values.begrunnelse || ''}
                            onChange={formik.handleChange}
                            feil={formik.errors.begrunnelse}
                        />

                        {pipe(
                            lagreBehandlingsinformasjonStatus,
                            RemoteData.fold(
                                () => null,
                                () => (
                                    <NavFrontendSpinner>
                                        {intl.formatMessage({ id: 'display.lagre.lagrer' })}
                                    </NavFrontendSpinner>
                                ),
                                () => (
                                    <AlertStripe type="feil">
                                        {intl.formatMessage({ id: 'display.lagre.lagringFeilet' })}
                                    </AlertStripe>
                                ),
                                () => null
                            )
                        )}
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                const status =
                                    formik.values.status === FormueStatus.MåInnhenteMerInformasjon
                                        ? FormueStatus.MåInnhenteMerInformasjon
                                        : totalFormue <= 0.5 * G
                                        ? FormueStatus.VilkårOppfylt
                                        : FormueStatus.VilkårIkkeOppfylt;

                                dispatch(
                                    lagreBehandlingsinformasjon({
                                        sakId: props.sakId,
                                        behandlingId: props.behandling.id,
                                        behandlingsinformasjon: {
                                            formue: {
                                                status,
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
                            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
                            faktaBlokkerClassName={styles.formueFaktaBlokk}
                            fakta={[
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.verdiPåBolig' }),
                                    verdi: søknadInnhold.formue.verdiPåBolig?.toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.verdiPåEiendom' }),
                                    verdi: søknadInnhold.formue.verdiPåEiendom?.toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.verdiPåKjøretøy' }),
                                    verdi:
                                        søknadInnhold.formue.kjøretøy
                                            ?.reduce((acc, kjøretøy) => acc + kjøretøy.verdiPåKjøretøy, 0)
                                            .toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.innskuddsbeløp' }),
                                    verdi: søknadInnhold.formue.innskuddsBeløp?.toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.verdipapirbeløp' }),
                                    verdi: søknadInnhold.formue.verdipapirBeløp?.toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.kontanterOver1000' }),
                                    verdi: søknadInnhold.formue.kontanterBeløp?.toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.skylderNoenSøkerPengerBeløp' }),
                                    verdi: søknadInnhold.formue.skylderNoenMegPengerBeløp?.toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.depositumsBeløp' }),
                                    verdi: søknadInnhold.formue.depositumsBeløp?.toString() ?? '0',
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
