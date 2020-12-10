import { useFormik, FormikErrors } from 'formik';
import { Knapp } from 'nav-frontend-knapper';
import { Input, SkjemaelementFeilmelding, Feiloppsummering } from 'nav-frontend-skjema';
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

import messages from './dinformue-nb';

type FormData = SøknadState['formue'];

const kjøretøySchema = yup.object({
    verdiPåKjøretøy: (yup
        .number()
        .typeError('Verdi på kjøretøy må være et tall')
        .positive()
        .label('Verdi på kjøretøy')
        .required() as yup.Schema<unknown>) as yup.Schema<string>,
    kjøretøyDeEier: yup.string().required(),
});

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
    kjøretøy: yup
        .array(kjøretøySchema.required())
        .defined()
        .when('eierKjøretøy', {
            is: true,
            then: yup.array().min(1).required(),
            otherwise: yup.array().max(0),
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
    harKontanter: yup.boolean().nullable().required(),
    kontanterBeløp: yup
        .number()
        .nullable()
        .defined()
        .when('harKontanter', {
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

const KjøretøyInputFelter = (props: {
    arr: Array<{ verdiPåKjøretøy: string; kjøretøyDeEier: string }>;
    errors: string | string[] | Array<FormikErrors<{ verdiPåKjøretøy: string; kjøretøyDeEier: string }>> | undefined;
    feltnavn: string;
    onChange: (element: { index: number; verdiPåKjøretøy: string; kjøretøyDeEier: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    return (
        <div>
            {props.arr.map((input, idx) => {
                const errorForLinje = Array.isArray(props.errors) ? props.errors[idx] : null;
                const idLink = (key: keyof typeof input) => `${props.feltnavn}[${idx}].${key}`;
                const kjøretøyId = idLink('kjøretøyDeEier');
                const kjøretøyVerdiId = idLink('verdiPåKjøretøy');

                return (
                    <div className={sharedStyles.inputFelterDiv} key={idx}>
                        <div>
                            <Input
                                id={kjøretøyId}
                                name={kjøretøyId}
                                label={<FormattedMessage id="input.kjøretøyDeEier.label" />}
                                value={input.kjøretøyDeEier}
                                onChange={(e) =>
                                    props.onChange({
                                        index: idx,
                                        kjøretøyDeEier: e.target.value,
                                        verdiPåKjøretøy: input.verdiPåKjøretøy,
                                    })
                                }
                                autoComplete="off"
                            />
                            {errorForLinje && typeof errorForLinje === 'object' && (
                                <SkjemaelementFeilmelding>{errorForLinje.kjøretøyDeEier}</SkjemaelementFeilmelding>
                            )}
                        </div>
                        <div>
                            <Input
                                id={kjøretøyVerdiId}
                                name={kjøretøyVerdiId}
                                label={<FormattedMessage id="input.verdiPåKjøretøyTotal.label" />}
                                value={input.verdiPåKjøretøy}
                                onChange={(e) => {
                                    props.onChange({
                                        index: idx,
                                        kjøretøyDeEier: input.kjøretøyDeEier,
                                        verdiPåKjøretøy: e.target.value,
                                    });
                                }}
                                autoComplete="off"
                            />
                            {errorForLinje && typeof errorForLinje === 'object' && (
                                <SkjemaelementFeilmelding>{errorForLinje.verdiPåKjøretøy}</SkjemaelementFeilmelding>
                            )}
                        </div>
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
                    </div>
                );
            })}
            <div className={sharedStyles.leggTilFeltKnapp}>
                <Knapp onClick={() => props.onLeggTilClick()} htmlType="button">
                    <FormattedMessage id="button.leggTil.label" />
                </Knapp>
            </div>
        </div>
    );
};

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
                kjøretøy: values.kjøretøy,
                harInnskuddPåKonto: values.harInnskuddPåKonto,
                innskuddsBeløp: values.innskuddsBeløp,
                harVerdipapir: values.harVerdipapir,
                verdipapirBeløp: values.verdipapirBeløp,
                skylderNoenMegPenger: values.skylderNoenMegPenger,
                skylderNoenMegPengerBeløp: values.skylderNoenMegPengerBeløp,
                harKontanter: values.harKontanter,
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
            kjøretøy: formueFraStore.kjøretøy,
            harInnskuddPåKonto: formueFraStore.harInnskuddPåKonto,
            innskuddsBeløp: formueFraStore.innskuddsBeløp,
            harVerdipapir: formueFraStore.harVerdipapir,
            verdipapirBeløp: formueFraStore.verdipapirBeløp,
            skylderNoenMegPenger: formueFraStore.skylderNoenMegPenger,
            skylderNoenMegPengerBeløp: formueFraStore.skylderNoenMegPengerBeløp,
            harKontanter: formueFraStore.harKontanter,
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
                            feil={formik.errors.eierBolig}
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
                                    label={<FormattedMessage id="input.verdiPåBolig.label" />}
                                    value={formik.values.verdiPåBolig || ''}
                                    onChange={formik.handleChange}
                                    autoComplete="off"
                                />
                                <Input
                                    id="boligBrukesTil"
                                    name="boligBrukesTil"
                                    label={<FormattedMessage id="input.boligBrukesTil.label" />}
                                    value={formik.values.boligBrukesTil || ''}
                                    onChange={formik.handleChange}
                                    autoComplete="off"
                                />
                            </div>
                        )}

                        {formik.values.eierBolig === false && (
                            <JaNeiSpørsmål
                                id="depositumskonto"
                                className={sharedStyles.sporsmal}
                                legend={<FormattedMessage id="input.depositumskonto.label" />}
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
                                    label={<FormattedMessage id="input.depositumsBeløp.label" />}
                                    value={formik.values.depositumsBeløp || ''}
                                    onChange={formik.handleChange}
                                    autoComplete="off"
                                />
                                <Input
                                    id="kontonummer"
                                    name="kontonummer"
                                    label={<FormattedMessage id="input.kontonummer.label" />}
                                    value={formik.values.kontonummer || ''}
                                    onChange={formik.handleChange}
                                    autoComplete="off"
                                />
                            </div>
                        )}

                        {formik.values.eierBolig && (
                            <JaNeiSpørsmål
                                id="eierMerEnnEnBolig"
                                className={sharedStyles.sporsmal}
                                legend={<FormattedMessage id="input.eierMerEnnEnBolig.label" />}
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
                                    label={<FormattedMessage id="input.verdiPåEiendom.label" />}
                                    value={formik.values.verdiPåEiendom || ''}
                                    onChange={formik.handleChange}
                                    autoComplete="off"
                                />
                                <Input
                                    id="eiendomBrukesTil"
                                    name="eiendomBrukesTil"
                                    label={<FormattedMessage id="input.eiendomBrukesTil.label" />}
                                    value={formik.values.eiendomBrukesTil || ''}
                                    onChange={formik.handleChange}
                                    autoComplete="off"
                                />
                            </div>
                        )}

                        <JaNeiSpørsmål
                            id="eierKjøretøy"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.eierKjøretøy.label" />}
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
                            legend={<FormattedMessage id="input.harInnskuddPåKonto.label" />}
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
                                bredde="S"
                                label={<FormattedMessage id="input.innskuddsBeløp.label" />}
                                value={formik.values.innskuddsBeløp || ''}
                                onChange={formik.handleChange}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="harVerdipapir"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harVerdipapir.label" />}
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
                                bredde="S"
                                label={<FormattedMessage id="input.verdipapirBeløp.label" />}
                                value={formik.values.verdipapirBeløp || ''}
                                onChange={formik.handleChange}
                                autoComplete="off"
                            />
                        )}

                        <JaNeiSpørsmål
                            id="skylderNoenMegPenger"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.skylderNoenMegPenger.label" />}
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
                                bredde="S"
                                label={<FormattedMessage id="input.skylderNoenMegPengerBeløp.label" />}
                                value={formik.values.skylderNoenMegPengerBeløp || ''}
                                onChange={formik.handleChange}
                                autoComplete="off"
                            />
                        )}

                        <JaNeiSpørsmål
                            id="harKontanter"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harKontanter.label" />}
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
                                bredde="S"
                                label={<FormattedMessage id="input.kontanterBeløp.label" />}
                                value={formik.values.kontanterBeløp || ''}
                                onChange={formik.handleChange}
                                autoComplete="off"
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
                    />
                </form>
            </RawIntlProvider>
        </div>
    );
};

export default DinFormue;
