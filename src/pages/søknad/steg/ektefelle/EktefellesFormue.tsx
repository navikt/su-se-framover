import { useFormik, FormikErrors } from 'formik';
import { Knapp } from 'nav-frontend-knapper';
import { Input, Feiloppsummering } from 'nav-frontend-skjema';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './ektefellesformue-nb';

type FormData = SøknadState['formue'];

const kjøretøySchema = yup.object({
    verdiPåKjøretøy: yup
        .number()
        .typeError('Verdi på kjøretøy må være et tall')
        .positive()
        .label('Verdi på kjøretøy')
        .required('Fyll ut verdien av kjøretøyet') as yup.Schema<unknown> as yup.Schema<string>,
    kjøretøyDeEier: yup.string().required('Fyll ut registeringsnummeret'),
});

const schema = yup.object<FormData>({
    eierBolig: yup.boolean().nullable().required('Fyll ut om ektefelle/partner/samboer eier bolig'),
    borIBolig: yup
        .boolean()
        .nullable()
        .defined()
        .when('eierBolig', {
            is: true,
            then: yup.boolean().nullable().required('Fyll ut om ektefelle/partner/samboer bor i boligen'),
        }),
    verdiPåBolig: yup
        .number()
        .nullable()
        .defined()
        .when('borIBolig', {
            is: false,
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
            then: yup.string().nullable().min(1).required('Fyll ut hva boligen brukes til'),
        }),
    eierMerEnnEnBolig: yup
        .boolean()
        .nullable()
        .defined()
        .when('eierBolig', {
            is: true,
            then: yup.boolean().nullable().required('Fyll ut om ektefelle/partner/samboer eier mer enn én bolig'),
        }),
    harDepositumskonto: yup
        .boolean()
        .nullable()
        .defined()
        .when('eierBolig', {
            is: false,
            then: yup.boolean().nullable().required('Fyll ut om ektefelle/partner/samboer har depositumskonto'),
        }),
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
            then: yup.string().nullable().min(1).required('Fyll ut hva eiendommen brukes til'),
        }),
    eierKjøretøy: yup.boolean().nullable().required('Fyll ut om ektefelle/partner/samboer eier kjøretøy'),
    kjøretøy: yup
        .array(kjøretøySchema.required())
        .defined()
        .when('eierKjøretøy', {
            is: true,
            then: yup.array().min(1).required(),
            otherwise: yup.array().max(0),
        }),
    harInnskuddPåKonto: yup.boolean().nullable().required('Fyll ut om ektefelle/partner/samboer har penger på konto'),
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
    harVerdipapir: yup.boolean().nullable().required('Fyll ut om ektefelle/partner/samboer har verdipapir'),
    verdipapirBeløp: yup
        .number()
        .nullable()
        .defined()
        .label('Beløp på verdipapir')
        .when('harVerdipapir', {
            is: true,
            then: yup.number().typeError('Beløp på verdipapir må være et tall').nullable(false).positive(),
        }) as yup.Schema<Nullable<string>>,
    skylderNoenMegPenger: yup.boolean().nullable().required('Fyll ut om noen skylder ektefelle/partner/samboer penger'),
    skylderNoenMegPengerBeløp: yup
        .number()
        .nullable()
        .label('Hvor mye penger skylder de ektefelle/partner/samboer beløpet')
        .defined()
        .when('skylderNoenMegPenger', {
            is: true,
            then: yup.number().typeError('Beløpet må være et tall').nullable(false).positive(),
        }) as yup.Schema<Nullable<string>>,
    harKontanter: yup.boolean().nullable().required('Fyll ut om ektefelle/partner/samboer har kontanter'),
    kontanterBeløp: yup
        .number()
        .nullable()
        .defined()
        .when('harKontanter', {
            is: true,
            then: yup
                .number()
                .typeError('Beløp på kontanter over 1000 må være et tall')
                .label('Beløp på kontanter over 1000')
                .nullable(false)
                .positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
});

const KjøretøyInputFelter = (props: {
    arr: Array<{ verdiPåKjøretøy: string; kjøretøyDeEier: string }>;
    errors: string | string[] | Array<FormikErrors<{ verdiPåKjøretøy: string; kjøretøyDeEier: string }>> | undefined;
    feltnavn: string;
    onChange: (element: { index: number; verdiPåKjøretøy: string; kjøretøyDeEier: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    return (
        <ul>
            {props.arr.map((input, idx) => {
                const errorForLinje = Array.isArray(props.errors) ? props.errors[idx] : null;
                const kjøretøyId = `${props.feltnavn}[${idx}].kjøretøy`;
                const kjøretøyVerdiId = `${props.feltnavn}[${idx}].kjøretøyVerdi`;

                return (
                    <li className={sharedStyles.inputFelterDiv} key={idx}>
                        <Input
                            id={`${kjøretøyVerdiId}`}
                            name={`${kjøretøyVerdiId}`}
                            label={<FormattedMessage id="kjøretøy.verdi" />}
                            feil={errorForLinje && typeof errorForLinje === 'object' && errorForLinje.verdiPåKjøretøy}
                            value={input.verdiPåKjøretøy}
                            onChange={(e) => {
                                props.onChange({
                                    index: idx,
                                    kjøretøyDeEier: input.kjøretøyDeEier,
                                    verdiPåKjøretøy: e.target.value,
                                });
                            }}
                        />
                        <Input
                            id={`${kjøretøyId}`}
                            name={`${kjøretøyId}`}
                            label={<FormattedMessage id="kjøretøy.regNr" />}
                            value={input.kjøretøyDeEier}
                            feil={errorForLinje && typeof errorForLinje === 'object' && errorForLinje.kjøretøyDeEier}
                            onChange={(e) =>
                                props.onChange({
                                    index: idx,
                                    kjøretøyDeEier: e.target.value,
                                    verdiPåKjøretøy: input.verdiPåKjøretøy,
                                })
                            }
                        />
                        {props.arr.length > 1 && (
                            <Knapp
                                className={sharedStyles.fjernFeltLink}
                                onClick={() => props.onFjernClick(idx)}
                                htmlType="button"
                            >
                                <FormattedMessage id="button.fjernRad.label" />
                            </Knapp>
                        )}
                        {errorForLinje && typeof errorForLinje === 'string' && errorForLinje}
                    </li>
                );
            })}
            <div className={sharedStyles.leggTilFeltKnapp}>
                <Knapp onClick={() => props.onLeggTilClick()} htmlType="button">
                    <FormattedMessage id="button.leggTil.kjøretøy" />
                </Knapp>
            </div>
        </ul>
    );
};

const EktefellesFormue = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const ektefelle = useAppSelector((s) => s.soknad.ektefelle);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const save = (values: FormData) => {
        dispatch(
            søknadSlice.actions.ektefelleUpdated({
                ...ektefelle,
                formue: values,
            })
        );
    };

    const formik = useFormik<FormData>({
        initialValues: ektefelle.formue,
        onSubmit: (values) => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const { intl } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    return (
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
                className={sharedStyles.container}
            >
                <div className={sharedStyles.formContainer}>
                    <JaNeiSpørsmål
                        id="eierBolig"
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="eierBolig.label" />}
                        feil={formik.errors.eierBolig}
                        state={formik.values.eierBolig}
                        onChange={(e) =>
                            formik.setValues({
                                ...formik.values,
                                eierBolig: e,
                                borIBolig: null,
                                verdiPåBolig: null,
                                eierMerEnnEnBolig: null,
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
                            legend={<FormattedMessage id="eierBolig.borIBolig" />}
                            feil={formik.errors.borIBolig}
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
                        <div className={sharedStyles.inputFelterDiv}>
                            <Input
                                id="verdiPåBolig"
                                name="verdiPåBolig"
                                label={<FormattedMessage id="eierBolig.formuePåBolig" />}
                                value={formik.values.verdiPåBolig || ''}
                                feil={formik.errors.verdiPåBolig}
                                onChange={formik.handleChange}
                            />
                            <Input
                                id="boligBrukesTil"
                                name="boligBrukesTil"
                                label={<FormattedMessage id="eierBolig.boligBrukesTil" />}
                                value={formik.values.boligBrukesTil || ''}
                                feil={formik.errors.boligBrukesTil}
                                onChange={formik.handleChange}
                            />
                        </div>
                    )}

                    {formik.values.eierBolig === false && (
                        <JaNeiSpørsmål
                            id="depositumskonto"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="depositum.label" />}
                            feil={formik.errors.harDepositumskonto}
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
                        <div className={sharedStyles.inputFelterDiv}>
                            <Input
                                id="depositumsBeløp"
                                name="depositumsBeløp"
                                label={<FormattedMessage id="depositum.beløp" />}
                                value={formik.values.depositumsBeløp || ''}
                                feil={formik.errors.depositumsBeløp}
                                onChange={formik.handleChange}
                            />
                            <Input
                                id="kontonummer"
                                name="kontonummer"
                                label={<FormattedMessage id="depositum.kontonummer" />}
                                value={formik.values.kontonummer || ''}
                                feil={formik.errors.kontonummer}
                                onChange={formik.handleChange}
                            />
                        </div>
                    )}

                    {formik.values.eierBolig && (
                        <JaNeiSpørsmål
                            id="eierMerEnnEnBolig"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="andreEiendommer.label" />}
                            feil={formik.errors.eierMerEnnEnBolig}
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
                        <div className={sharedStyles.inputFelterDiv}>
                            <Input
                                id="verdiPåEiendom"
                                name="verdiPåEiendom"
                                label={<FormattedMessage id="andreEiendommer.verdi" />}
                                value={formik.values.verdiPåEiendom || ''}
                                feil={formik.errors.verdiPåEiendom}
                                onChange={formik.handleChange}
                            />
                            <Input
                                id="eiendomBrukesTil"
                                name="eiendomBrukesTil"
                                label={<FormattedMessage id="andreEiendommer.brukesTil" />}
                                value={formik.values.eiendomBrukesTil || ''}
                                feil={formik.errors.eiendomBrukesTil}
                                onChange={formik.handleChange}
                            />
                        </div>
                    )}

                    <JaNeiSpørsmål
                        id="eierKjøretøy"
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="kjøretøy.label" />}
                        feil={formik.errors.eierKjøretøy}
                        state={formik.values.eierKjøretøy}
                        onChange={(e) =>
                            formik.setValues({
                                ...formik.values,
                                eierKjøretøy: e,
                                kjøretøy: e ? [{ verdiPåKjøretøy: '', kjøretøyDeEier: '' }] : [],
                            })
                        }
                    />

                    {formik.values.eierKjøretøy && (
                        <KjøretøyInputFelter
                            arr={formik.values.kjøretøy}
                            errors={formik.errors.kjøretøy}
                            feltnavn={'kjøretøy'}
                            onLeggTilClick={() => {
                                formik.setValues({
                                    ...formik.values,
                                    kjøretøy: [
                                        ...formik.values.kjøretøy,
                                        {
                                            verdiPåKjøretøy: '',
                                            kjøretøyDeEier: '',
                                        },
                                    ],
                                });
                            }}
                            onFjernClick={(index) => {
                                formik.setValues({
                                    ...formik.values,
                                    kjøretøy: formik.values.kjøretøy.filter((_, i) => index !== i),
                                });
                            }}
                            onChange={(val) => {
                                formik.setValues({
                                    ...formik.values,
                                    kjøretøy: formik.values.kjøretøy.map((input, i) =>
                                        val.index === i
                                            ? {
                                                  verdiPåKjøretøy: val.verdiPåKjøretøy,
                                                  kjøretøyDeEier: val.kjøretøyDeEier,
                                              }
                                            : input
                                    ),
                                });
                            }}
                        />
                    )}

                    <JaNeiSpørsmål
                        id="harInnskuddPåKonto"
                        className={sharedStyles.sporsmal}
                        legend={
                            formik.values.harDepositumskonto ? (
                                <FormattedMessage id="innskudd.pengerPåKontoInkludertDepositum" />
                            ) : (
                                <FormattedMessage id="innskudd.label" />
                            )
                        }
                        feil={formik.errors.harInnskuddPåKonto}
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
                            className={sharedStyles.marginBottom}
                            id="innskuddsBeløp"
                            name="innskuddsBeløp"
                            label={<FormattedMessage id="innskudd.beløp" />}
                            value={formik.values.innskuddsBeløp || ''}
                            feil={formik.errors.innskuddsBeløp}
                            onChange={formik.handleChange}
                        />
                    )}

                    <JaNeiSpørsmål
                        id="harVerdipapir"
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="verdipapir.label" />}
                        feil={formik.errors.harVerdipapir}
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
                            className={sharedStyles.marginBottom}
                            id="verdipapirBeløp"
                            name="verdipapirBeløp"
                            label={<FormattedMessage id="verdipapir.beløp" />}
                            value={formik.values.verdipapirBeløp || ''}
                            feil={formik.errors.verdipapirBeløp}
                            onChange={formik.handleChange}
                        />
                    )}

                    <JaNeiSpørsmål
                        id="skylderNoenMegPenger"
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="skylderNoenMegPenger.label" />}
                        feil={formik.errors.skylderNoenMegPenger}
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
                            className={sharedStyles.marginBottom}
                            id="skylderNoenMegPengerBeløp"
                            name="skylderNoenMegPengerBeløp"
                            label={<FormattedMessage id="skylderNoenMegPenger.beløp" />}
                            value={formik.values.skylderNoenMegPengerBeløp || ''}
                            feil={formik.errors.skylderNoenMegPengerBeløp}
                            onChange={formik.handleChange}
                        />
                    )}

                    <JaNeiSpørsmål
                        id="harKontanter"
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="harKontanter.label" />}
                        feil={formik.errors.harKontanter}
                        state={formik.values.harKontanter}
                        onChange={(e) =>
                            formik.setValues({
                                ...formik.values,
                                harKontanter: e,
                                kontanterBeløp: null,
                            })
                        }
                    />

                    {formik.values.harKontanter && (
                        <Input
                            className={sharedStyles.marginBottom}
                            id="kontanterBeløp"
                            name="kontanterBeløp"
                            label={<FormattedMessage id="harKontanter.beløp" />}
                            value={formik.values.kontanterBeløp || ''}
                            feil={formik.errors.kontanterBeløp}
                            onChange={formik.handleChange}
                        />
                    )}
                </div>
                <Feiloppsummering
                    className={sharedStyles.marginBottom}
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
                    avbryt={{ toRoute: props.avbrytUrl }}
                />
            </form>
        </RawIntlProvider>
    );
};

export default EktefellesFormue;
