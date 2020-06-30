import * as React from 'react';
import { Input } from 'nav-frontend-skjema';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useFormik } from 'formik';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknad.slice';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import messages from './dinformue-nb';
import { Nullable } from '~lib/types';
import { useHistory } from 'react-router-dom';
import { Feiloppsummering } from 'nav-frontend-skjema';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useI18n } from '~lib/hooks';
import sharedI18n from '../steg-shared-i18n';

interface FormData {
    eierBolig: Nullable<boolean>;
    borIBolig: Nullable<boolean>;
    verdiPåBolig: Nullable<string>;
    boligBrukesTil: Nullable<string>;
    eierMerEnnEnBolig: Nullable<boolean>;
    harDepositumskonto: Nullable<boolean>;
    depositumsBeløp: Nullable<string>;
    kontonummer: Nullable<string>;
    verdiPåEiendom: Nullable<string>;
    eiendomBrukesTil: Nullable<string>;
    eierKjøretøy: Nullable<boolean>;
    verdiPåKjøretøy: Nullable<string>;
    kjøretøyDeEier: Nullable<string>;
    harInnskuddPåKonto: Nullable<boolean>;
    innskuddsBeløp: Nullable<string>;
    harVerdipapir: Nullable<boolean>;
    verdipapirBeløp: Nullable<string>;
    skylderNoenMegPenger: Nullable<boolean>;
    skylderNoenMegPengerBeløp: Nullable<string>;
    harKontanterOver1000: Nullable<boolean>;
    kontanterBeløp: Nullable<string>;
}

const schema = yup.object<FormData>({
    eierBolig: yup.boolean().nullable().required(),
    borIBolig: yup.boolean().nullable().defined().when('eierBolig', {
        is: true,
        then: yup.boolean().nullable().required(),
    }),
    verdiPåBolig: yup
        .number()
        .nullable()
        .defined()
        .when('harFormue', {
            is: true,
            then: yup
                .number()
                .typeError('Verdi på bolig må være et tall')
                .label('Verdi på bolig')
                .nullable(false)
                .positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    boligBrukesTil: yup
        .string()
        .nullable()
        .defined()
        .when('borIBolig', {
            is: false,
            then: yup.string().nullable().min(1).required(),
        }),
    eierMerEnnEnBolig: yup.boolean().nullable().defined().when('eierBolig', {
        is: true,
        then: yup.boolean().nullable().required(),
    }),
    harDepositumskonto: yup
        .boolean()
        .nullable()
        .defined()
        .when('eierBolig', { is: false, then: yup.boolean().nullable().required() }),
    depositumsBeløp: yup
        .number()
        .nullable()
        .defined()
        .when('harDepositumskonto', {
            is: true,
            then: yup
                .number()
                .typeError('Depositumsbeløpet må være et tall')
                .label('Depositumsbeløpet')
                .nullable(false)
                .positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    //TODO: andre typer kontonummer ?
    kontonummer: yup
        .number()
        .nullable()
        .defined()
        .when('harDepositumskonto', {
            is: true,
            then: yup.number().typeError('kontonummer må være et tall').label('kontonummer').nullable(false).positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    verdiPåEiendom: yup
        .number()
        .nullable()
        .defined()
        .when('eierMerEnnEnBolig', {
            is: true,
            then: yup
                .number()
                .typeError('Verdi på eiendom må være et tall')
                .label('Verdi på eiendom')
                .nullable(false)
                .positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    eiendomBrukesTil: yup
        .string()
        .nullable()
        .defined()
        .when('eierMerEnnEnBolig', {
            is: true,
            then: yup.string().nullable().min(1).required(),
        }),
    eierKjøretøy: yup.boolean().nullable().required(),
    verdiPåKjøretøy: yup
        .number()
        .nullable()
        .defined()
        .when('eierKjøretøy', {
            is: true,
            then: yup
                .number()
                .typeError('Verdi på kjøretøyet må være et tall')
                .label('Verdi på kjøretøyet')
                .nullable(false)
                .positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    kjøretøyDeEier: yup
        .string()
        .nullable()
        .defined()
        .when('eierKjøretøy', {
            is: true,
            then: yup.string().nullable().min(1).required(),
        }),
    harInnskuddPåKonto: yup.boolean().nullable().required(),
    innskuddsBeløp: yup
        .number()
        .nullable()
        .label('Beløp på innskuddet')
        .defined()
        .when('harInnskuddPåKonto', {
            is: true,
            then: yup.number().typeError('Beløp på innskuddet må være et tall').nullable(false).positive().required(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    harVerdipapir: yup.boolean().nullable().required(),
    verdipapirBeløp: yup
        .number()
        .nullable()
        .defined()
        .label('Beløp på verdipapir')
        .when('harVerdipapir', {
            is: true,
            then: yup.number().typeError('Beløp på verdipapir må være et tall').nullable(false).positive(),
        }) as yup.Schema<Nullable<string>>,
    skylderNoenMegPenger: yup.boolean().nullable().required(),
    skylderNoenMegPengerBeløp: yup
        .number()
        .nullable()
        .label('skylderNoenMegPenger beløp')
        .defined()
        .when('skylderNoenMegPenger', {
            is: true,
            then: yup.number().typeError('skylderNoenMegPenger beløp må være et tall').nullable(false).positive(),
        }) as yup.Schema<Nullable<string>>,
    harKontanterOver1000: yup.boolean().nullable().required(),
    kontanterBeløp: yup
        .number()
        .nullable()
        .defined()
        .when('harKontanterOver1000', {
            is: true,
            then: yup
                .number()
                .typeError('Beløp på kontanter må være et tall')
                .label('Beløp på kontanter')
                .nullable(false)
                .positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
});

const DinFormue = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const formueFraStore = useAppSelector((s) => s.soknad.formue);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const save = (values: FormData) => {
        dispatch(
            søknadSlice.actions.formueUpdated({
                eierBolig: values.eierBolig,
                borIBolig: values.borIBolig,
                verdiPåBolig: values.verdiPåBolig,
                boligBrukesTil: values.boligBrukesTil,
                eierMerEnnEnBolig: values.eierMerEnnEnBolig,
                harDepositumskonto: values.harDepositumskonto,
                depositumsBeløp: values.depositumsBeløp,
                kontonummer: values.kontonummer,
                verdiPåEiendom: values.verdiPåEiendom,
                eiendomBrukesTil: values.eiendomBrukesTil,
                eierKjøretøy: values.eierKjøretøy,
                verdiPåKjøretøy: values.verdiPåKjøretøy,
                kjøretøyDeEier: values.kjøretøyDeEier,
                harInnskuddPåKonto: values.harInnskuddPåKonto,
                innskuddsBeløp: values.innskuddsBeløp,
                harVerdipapir: values.harVerdipapir,
                verdipapirBeløp: values.verdipapirBeløp,
                skylderNoenMegPenger: values.skylderNoenMegPenger,
                skylderNoenMegPengerBeløp: values.skylderNoenMegPengerBeløp,
                harKontanterOver1000: values.harKontanterOver1000,
                kontanterBeløp: values.kontanterBeløp,
            })
        );
    };

    const formik = useFormik<FormData>({
        initialValues: {
            eierBolig: formueFraStore.eierBolig,
            borIBolig: formueFraStore.borIBolig,
            verdiPåBolig: formueFraStore.verdiPåBolig,
            boligBrukesTil: formueFraStore.boligBrukesTil,
            eierMerEnnEnBolig: formueFraStore.eierMerEnnEnBolig,
            harDepositumskonto: formueFraStore.harDepositumskonto,
            depositumsBeløp: formueFraStore.depositumsBeløp,
            kontonummer: formueFraStore.kontonummer,
            verdiPåEiendom: formueFraStore.verdiPåEiendom,
            eiendomBrukesTil: formueFraStore.eiendomBrukesTil,
            eierKjøretøy: formueFraStore.eierKjøretøy,
            verdiPåKjøretøy: formueFraStore.verdiPåKjøretøy,
            kjøretøyDeEier: formueFraStore.kjøretøyDeEier,
            harInnskuddPåKonto: formueFraStore.harInnskuddPåKonto,
            innskuddsBeløp: formueFraStore.innskuddsBeløp,
            harVerdipapir: formueFraStore.harVerdipapir,
            verdipapirBeløp: formueFraStore.verdipapirBeløp,
            skylderNoenMegPenger: formueFraStore.skylderNoenMegPenger,
            skylderNoenMegPengerBeløp: formueFraStore.skylderNoenMegPengerBeløp,
            harKontanterOver1000: formueFraStore.harKontanterOver1000,
            kontanterBeløp: formueFraStore.kontanterBeløp,
        },
        onSubmit: (values) => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);
    console.log(formik.values);
    return (
        <div className={sharedStyles.container}>
            <RawIntlProvider value={intl}>
                <form
                    onSubmit={(e) => {
                        setHasSubmitted(true);
                        formik.handleSubmit(e);
                        setTimeout(() => {
                            if (feiloppsummeringref.current) {
                                feiloppsummeringref.current.focus();
                            }
                        }, 0);
                    }}
                >
                    <div className={sharedStyles.formContainer}>
                        <JaNeiSpørsmål
                            id="eierBolig"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.eierDuBolig.label" />}
                            feil={null}
                            state={formik.values.eierBolig}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    eierBolig: e,
                                    borIBolig: null,
                                    verdiPåBolig: null,
                                    boligBrukesTil: null,
                                    harDepositumskonto: null,
                                    depositumsBeløp: null,
                                    kontonummer: null,
                                })
                            }
                        />
                        {formik.values.eierBolig && (
                            <JaNeiSpørsmål
                                id="borIBolig"
                                className={sharedStyles.sporsmal}
                                legend={<FormattedMessage id="input.borIBolig.label" />}
                                feil={null}
                                state={formik.values.borIBolig}
                                onChange={(e) =>
                                    formik.setValues({
                                        ...formik.values,
                                        borIBolig: e,
                                        verdiPåBolig: null,
                                        boligBrukesTil: null,
                                    })
                                }
                            />
                        )}

                        {formik.values.borIBolig === false && (
                            <div>
                                <Input
                                    id="verdiPåBolig"
                                    name="verdiPåBolig"
                                    label={<FormattedMessage id="input.verdiPåBolig.label" />}
                                    value={formik.values.verdiPåBolig || ''}
                                    onChange={formik.handleChange}
                                />
                                <Input
                                    id="boligBrukesTil"
                                    name="boligBrukesTil"
                                    label={<FormattedMessage id="input.boligBrukesTil.label" />}
                                    value={formik.values.boligBrukesTil || ''}
                                    onChange={formik.handleChange}
                                />
                            </div>
                        )}

                        {formik.values.eierBolig === false && (
                            <JaNeiSpørsmål
                                id="depositumskonto"
                                className={sharedStyles.sporsmal}
                                legend={<FormattedMessage id="input.depositumskonto.label" />}
                                feil={null}
                                state={formik.values.harDepositumskonto}
                                onChange={(e) =>
                                    formik.setValues({
                                        ...formik.values,
                                        harDepositumskonto: e,
                                        depositumsBeløp: null,
                                        kontonummer: null,
                                    })
                                }
                            />
                        )}

                        {formik.values.harDepositumskonto && (
                            <div>
                                <Input
                                    id="depositumsBeløp"
                                    name="depositumsBeløp"
                                    label={<FormattedMessage id="input.depositumsBeløp.label" />}
                                    value={formik.values.depositumsBeløp || ''}
                                    onChange={formik.handleChange}
                                />
                                <Input
                                    id="kontonummer"
                                    name="kontonummer"
                                    label={<FormattedMessage id="input.kontonummer.label" />}
                                    value={formik.values.kontonummer || ''}
                                    onChange={formik.handleChange}
                                />
                            </div>
                        )}

                        {formik.values.eierBolig && (
                            <JaNeiSpørsmål
                                id="eierMerEnnEnBolig"
                                className={sharedStyles.sporsmal}
                                legend={<FormattedMessage id="input.eierMerEnnEnBolig.label" />}
                                feil={null}
                                state={formik.values.eierMerEnnEnBolig}
                                onChange={(e) =>
                                    formik.setValues({
                                        ...formik.values,
                                        eierMerEnnEnBolig: e,
                                        verdiPåEiendom: null,
                                        eiendomBrukesTil: null,
                                    })
                                }
                            />
                        )}

                        {formik.values.eierMerEnnEnBolig && (
                            <div>
                                <Input
                                    id="verdiPåEiendom"
                                    name="verdiPåEiendom"
                                    label={<FormattedMessage id="input.verdiPåEiendom.label" />}
                                    value={formik.values.verdiPåEiendom || ''}
                                    onChange={formik.handleChange}
                                />
                                <Input
                                    id="eiendomBrukesTil"
                                    name="eiendomBrukesTil"
                                    label={<FormattedMessage id="input.eiendomBrukesTil.label" />}
                                    value={formik.values.eiendomBrukesTil || ''}
                                    onChange={formik.handleChange}
                                />
                            </div>
                        )}

                        <JaNeiSpørsmål
                            id="eierKjøretøy"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.eierKjøretøy.label" />}
                            feil={null}
                            state={formik.values.eierKjøretøy}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    eierKjøretøy: e,
                                    verdiPåKjøretøy: null,
                                    kjøretøyDeEier: null,
                                })
                            }
                        />

                        {formik.values.eierKjøretøy && (
                            <div>
                                <Input
                                    id="verdiPåKjøretøy"
                                    name="verdiPåKjøretøy"
                                    label={<FormattedMessage id="input.verdiPåKjøretøyTotal.label" />}
                                    value={formik.values.verdiPåKjøretøy || ''}
                                    onChange={formik.handleChange}
                                />
                                <Input
                                    id="kjøretøyDeEier"
                                    name="kjøretøyDeEier"
                                    label={<FormattedMessage id="input.kjøretøyDeEier.label" />}
                                    value={formik.values.kjøretøyDeEier || ''}
                                    onChange={formik.handleChange}
                                />
                            </div>
                        )}

                        <JaNeiSpørsmål
                            id="harInnskudPåKonto"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harInnskuddPåKonto.label" />}
                            feil={null}
                            state={formik.values.harInnskuddPåKonto}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    harInnskuddPåKonto: e,
                                    innskuddsBeløp: null,
                                })
                            }
                        />

                        {formik.values.harInnskuddPåKonto && (
                            <Input
                                id="innskuddsBeløp"
                                name="innskuddsBeløp"
                                label={<FormattedMessage id="input.innskuddsBeløp.label" />}
                                value={formik.values.innskuddsBeløp || ''}
                                onChange={formik.handleChange}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="harVerdipapir"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harVerdipapir.label" />}
                            feil={null}
                            state={formik.values.harVerdipapir}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    harVerdipapir: e,
                                    verdipapirBeløp: null,
                                })
                            }
                        />

                        {formik.values.harVerdipapir && (
                            <Input
                                id="verdipapirBeløp"
                                name="verdipapirBeløp"
                                label={<FormattedMessage id="input.verdipapirBeløp.label" />}
                                value={formik.values.verdipapirBeløp || ''}
                                onChange={formik.handleChange}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="skylderNoenMegPenger"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.skylderNoenMegPenger.label" />}
                            feil={null}
                            state={formik.values.skylderNoenMegPenger}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    skylderNoenMegPenger: e,
                                    skylderNoenMegPengerBeløp: null,
                                })
                            }
                        />

                        {formik.values.skylderNoenMegPenger && (
                            <Input
                                id="skylderNoenMegPengerBeløp"
                                name="skylderNoenMegPengerBeløp"
                                label={<FormattedMessage id="input.skylderNoenMegPengerBeløp.label" />}
                                value={formik.values.skylderNoenMegPengerBeløp || ''}
                                onChange={formik.handleChange}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="harKontanterOver1000"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harKontanterOver1000.label" />}
                            feil={null}
                            state={formik.values.harKontanterOver1000}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    harKontanterOver1000: e,
                                    kontanterBeløp: null,
                                })
                            }
                        />

                        {formik.values.harKontanterOver1000 && (
                            <Input
                                id="kontanterBeløp"
                                name="kontanterBeløp"
                                label={<FormattedMessage id="input.kontanterBeløp.label" />}
                                value={formik.values.kontanterBeløp || ''}
                                onChange={formik.handleChange}
                            />
                        )}
                    </div>
                    <Feiloppsummering
                        className={sharedStyles.feiloppsummering}
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                        hidden={!formikErrorsHarFeil(formik.errors)}
                        innerRef={feiloppsummeringref}
                    />
                    <Bunnknapper
                        previous={{
                            onClick: () => {
                                save(formik.values);
                                history.push(props.forrigeUrl);
                            },
                        }}
                    />
                </form>
            </RawIntlProvider>
        </div>
    );
};

export default DinFormue;
