import { useFormik, FormikErrors } from 'formik';
import { Knapp } from 'nav-frontend-knapper';
import { Input, Feiloppsummering } from 'nav-frontend-skjema';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import { useI18n } from '~lib/hooks';
import { keyOf, Nullable } from '~lib/types';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './dinformue-nb';

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
    eierBolig: yup.boolean().nullable().required('Fyll ut om du eier bolig'),
    borIBolig: yup
        .boolean()
        .nullable()
        .defined()
        .when('eierBolig', {
            is: true,
            then: yup.boolean().nullable().required('Fyll ut om du bor i boligen'),
        }),
    verdiPåBolig: yup
        .number()
        .nullable()
        .defined()
        .when(keyOf<FormData>('borIBolig'), {
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
        .when(keyOf<FormData>('borIBolig'), {
            is: false,
            then: yup.string().nullable().min(1).required('Fyll ut hva boligen brukes til'),
        }),
    eierMerEnnEnBolig: yup
        .boolean()
        .nullable()
        .defined()
        .when(keyOf<FormData>('eierBolig'), {
            is: true,
            then: yup.boolean().nullable().required('Fyll ut om du eier mer enn én bolig'),
        }),
    harDepositumskonto: yup
        .boolean()
        .nullable()
        .defined()
        .when(keyOf<FormData>('eierBolig'), {
            is: false,
            then: yup.boolean().nullable().required('Fyll ut om du har depositumskonto'),
        }),
    depositumsBeløp: yup
        .number()
        .nullable()
        .defined()
        .when(keyOf<FormData>('harDepositumskonto'), {
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
        .when(keyOf<FormData>('harDepositumskonto'), {
            is: true,
            then: yup.number().typeError('Kontonummer må være et tall').label('kontonummer').nullable(false).positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    verdiPåEiendom: yup
        .number()
        .nullable()
        .defined()
        .when(keyOf<FormData>('eierMerEnnEnBolig'), {
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
        .when(keyOf<FormData>('eierMerEnnEnBolig'), {
            is: true,
            then: yup.string().nullable().min(1).required('Fyll ut hva eiendommen brukes til'),
        }),
    eierKjøretøy: yup.boolean().nullable().required('Fyll ut om du eier kjøretøy'),
    kjøretøy: yup
        .array(kjøretøySchema.required())
        .defined()
        .when(keyOf<FormData>('eierKjøretøy'), {
            is: true,
            then: yup.array().min(1).required(),
            otherwise: yup.array().max(0),
        }),
    harInnskuddPåKonto: yup.boolean().nullable().required('Fyll ut om du har penger på konto'),
    innskuddsBeløp: yup
        .number()
        .nullable()
        .label('Beløp på innskuddet')
        .defined()
        .when(keyOf<FormData>('harInnskuddPåKonto'), {
            is: true,
            then: yup.number().typeError('Beløp på innskuddet må være et tall').nullable(false).positive().required(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    harVerdipapir: yup.boolean().nullable().required('Fyll ut om du har verdipapir'),
    verdipapirBeløp: yup
        .number()
        .nullable()
        .defined()
        .label('Beløp på verdipapir')
        .when(keyOf<FormData>('harVerdipapir'), {
            is: true,
            then: yup.number().typeError('Beløp på verdipapir må være et tall').nullable(false).positive(),
        }) as yup.Schema<Nullable<string>>,
    skylderNoenMegPenger: yup.boolean().nullable().required('Fyll ut om noen skylder deg penger'),
    skylderNoenMegPengerBeløp: yup
        .number()
        .nullable()
        .label('Hvor mye penger skylder de deg beløpet')
        .defined()
        .when(keyOf<FormData>('skylderNoenMegPenger'), {
            is: true,
            then: yup.number().typeError('Beløpet må være et tall').nullable(false).positive(),
        }) as yup.Schema<Nullable<string>>,
    harKontanter: yup.boolean().nullable().required('Fyll ut om du har kontanter'),
    kontanterBeløp: yup
        .number()
        .nullable()
        .defined()
        .when(keyOf<FormData>('harKontanter'), {
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
                                label={<FormattedMessage id="kjøretøy.regNr" />}
                                value={input.kjøretøyDeEier}
                                feil={
                                    errorForLinje && typeof errorForLinje === 'object' && errorForLinje.kjøretøyDeEier
                                }
                                onChange={(e) =>
                                    props.onChange({
                                        index: idx,
                                        kjøretøyDeEier: e.target.value,
                                        verdiPåKjøretøy: input.verdiPåKjøretøy,
                                    })
                                }
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                        </div>
                        <div>
                            <Input
                                id={kjøretøyVerdiId}
                                name={kjøretøyVerdiId}
                                label={<FormattedMessage id="kjøretøy.verdi" />}
                                value={input.verdiPåKjøretøy}
                                feil={
                                    errorForLinje && typeof errorForLinje === 'object' && errorForLinje.verdiPåKjøretøy
                                }
                                onChange={(e) => {
                                    props.onChange({
                                        index: idx,
                                        kjøretøyDeEier: input.kjøretøyDeEier,
                                        verdiPåKjøretøy: e.target.value,
                                    });
                                }}
                                autoComplete="off"
                            />
                        </div>
                        {props.arr.length > 1 && (
                            <Knapp
                                className={sharedStyles.fjernFeltLink}
                                onClick={() => props.onFjernClick(idx)}
                                htmlType="button"
                            >
                                <FormattedMessage id="button.fjernRad" />
                            </Knapp>
                        )}
                        {errorForLinje && typeof errorForLinje === 'string' && errorForLinje}
                    </div>
                );
            })}
            <div className={sharedStyles.leggTilFeltKnapp}>
                <Knapp onClick={() => props.onLeggTilClick()} htmlType="button">
                    <FormattedMessage id="button.leggTil" />
                </Knapp>
            </div>
        </div>
    );
};

const DinFormue = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
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
                        id={keyOf<FormData>('eierBolig')}
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="eierBolig.label" />}
                        feil={formik.errors.eierBolig}
                        state={formik.values.eierBolig}
                        onChange={(e) =>
                            formik.setValues((v) => ({
                                ...v,
                                eierBolig: e,
                                borIBolig: null,
                                verdiPåBolig: null,
                                boligBrukesTil: null,
                                eierMerEnnEnBolig: null,
                                harDepositumskonto: null,
                                depositumsBeløp: null,
                                kontonummer: null,
                            }))
                        }
                    />
                    {formik.values.eierBolig && (
                        <JaNeiSpørsmål
                            id={keyOf<FormData>('borIBolig')}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="eierBolig.borIBolig" />}
                            feil={formik.errors.borIBolig}
                            state={formik.values.borIBolig}
                            onChange={(e) =>
                                formik.setValues((v) => ({
                                    ...v,
                                    borIBolig: e,
                                    verdiPåBolig: null,
                                    boligBrukesTil: null,
                                }))
                            }
                        />
                    )}

                    {formik.values.borIBolig === false && (
                        <div className={sharedStyles.inputFelterDiv}>
                            <Input
                                id={keyOf<FormData>('verdiPåBolig')}
                                name={keyOf<FormData>('verdiPåBolig')}
                                label={<FormattedMessage id="eierBolig.formuePåBolig" />}
                                value={formik.values.verdiPåBolig || ''}
                                feil={formik.errors.verdiPåBolig}
                                onChange={formik.handleChange}
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                            <Input
                                id={keyOf<FormData>('boligBrukesTil')}
                                name={keyOf<FormData>('boligBrukesTil')}
                                label={<FormattedMessage id="eierBolig.boligBrukesTil" />}
                                value={formik.values.boligBrukesTil || ''}
                                feil={formik.errors.boligBrukesTil}
                                onChange={formik.handleChange}
                                autoComplete="off"
                            />
                        </div>
                    )}

                    {formik.values.eierBolig === false && (
                        <JaNeiSpørsmål
                            id={keyOf<FormData>('harDepositumskonto')}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="depositum.label" />}
                            feil={formik.errors.harDepositumskonto}
                            state={formik.values.harDepositumskonto}
                            onChange={(e) =>
                                formik.setValues((v) => ({
                                    ...v,
                                    harDepositumskonto: e,
                                    depositumsBeløp: null,
                                    kontonummer: null,
                                }))
                            }
                        />
                    )}

                    {formik.values.harDepositumskonto && (
                        <div className={sharedStyles.inputFelterDiv}>
                            <Input
                                id={keyOf<FormData>('depositumsBeløp')}
                                name="depositumsBeløp"
                                label={<FormattedMessage id="depositum.beløp" />}
                                value={formik.values.depositumsBeløp || ''}
                                feil={formik.errors.depositumsBeløp}
                                onChange={formik.handleChange}
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                            <Input
                                id={keyOf<FormData>('kontonummer')}
                                name={keyOf<FormData>('kontonummer')}
                                label={<FormattedMessage id="depositum.kontonummer" />}
                                value={formik.values.kontonummer || ''}
                                feil={formik.errors.kontonummer}
                                onChange={formik.handleChange}
                                autoComplete="off"
                            />
                        </div>
                    )}

                    {formik.values.eierBolig && (
                        <JaNeiSpørsmål
                            id={keyOf<FormData>('eierMerEnnEnBolig')}
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="eiendom.eierAndreEiendommer" />}
                            feil={formik.errors.eierMerEnnEnBolig}
                            state={formik.values.eierMerEnnEnBolig}
                            onChange={(e) =>
                                formik.setValues((v) => ({
                                    ...v,
                                    eierMerEnnEnBolig: e,
                                    verdiPåEiendom: null,
                                    eiendomBrukesTil: null,
                                }))
                            }
                        />
                    )}

                    {formik.values.eierBolig && formik.values.eierMerEnnEnBolig && (
                        <div className={sharedStyles.inputFelterDiv}>
                            <Input
                                id={keyOf<FormData>('verdiPåEiendom')}
                                name={keyOf<FormData>('verdiPåEiendom')}
                                label={<FormattedMessage id="eiendom.samledeVerdi" />}
                                value={formik.values.verdiPåEiendom || ''}
                                feil={formik.errors.verdiPåEiendom}
                                onChange={formik.handleChange}
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                            <Input
                                id={keyOf<FormData>('eiendomBrukesTil')}
                                name={keyOf<FormData>('eiendomBrukesTil')}
                                label={<FormattedMessage id="eiendom.brukesTil" />}
                                value={formik.values.eiendomBrukesTil || ''}
                                feil={formik.errors.eiendomBrukesTil}
                                onChange={formik.handleChange}
                                autoComplete="off"
                            />
                        </div>
                    )}

                    <JaNeiSpørsmål
                        id={keyOf<FormData>('eierKjøretøy')}
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="kjøretøy.label" />}
                        feil={formik.errors.eierKjøretøy}
                        state={formik.values.eierKjøretøy}
                        onChange={(e) =>
                            formik.setValues((v) => ({
                                ...v,
                                eierKjøretøy: e,
                                kjøretøy: e ? [{ verdiPåKjøretøy: '', kjøretøyDeEier: '' }] : [],
                            }))
                        }
                    />

                    {formik.values.eierKjøretøy && (
                        <KjøretøyInputFelter
                            arr={formik.values.kjøretøy}
                            errors={formik.errors.kjøretøy}
                            feltnavn={keyOf<FormData>('kjøretøy')}
                            onLeggTilClick={() => {
                                formik.setValues((v) => ({
                                    ...v,
                                    kjøretøy: [
                                        ...formik.values.kjøretøy,
                                        {
                                            verdiPåKjøretøy: '',
                                            kjøretøyDeEier: '',
                                        },
                                    ],
                                }));
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
                        id={keyOf<FormData>('harInnskuddPåKonto')}
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
                            formik.setValues((v) => ({
                                ...v,
                                harInnskuddPåKonto: e,
                                innskuddsBeløp: null,
                            }))
                        }
                    />

                    {formik.values.harInnskuddPåKonto && (
                        <Input
                            className={sharedStyles.marginBottom}
                            id={keyOf<FormData>('innskuddsBeløp')}
                            name={keyOf<FormData>('innskuddsBeløp')}
                            bredde="S"
                            label={<FormattedMessage id="innskudd.beløp" />}
                            feil={formik.errors.innskuddsBeløp}
                            value={formik.values.innskuddsBeløp || ''}
                            onChange={formik.handleChange}
                            // Dette elementet vises ikke ved sidelast
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                        />
                    )}

                    <JaNeiSpørsmål
                        id={keyOf<FormData>('harVerdipapir')}
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="verdiPapir.label" />}
                        feil={formik.errors.harVerdipapir}
                        state={formik.values.harVerdipapir}
                        onChange={(e) =>
                            formik.setValues((v) => ({
                                ...v,
                                harVerdipapir: e,
                                verdipapirBeløp: null,
                            }))
                        }
                    />

                    {formik.values.harVerdipapir && (
                        <Input
                            className={sharedStyles.marginBottom}
                            id={keyOf<FormData>('verdipapirBeløp')}
                            name={keyOf<FormData>('verdipapirBeløp')}
                            bredde="S"
                            label={<FormattedMessage id="verdiPapir.beløp" />}
                            value={formik.values.verdipapirBeløp || ''}
                            feil={formik.errors.verdipapirBeløp}
                            onChange={formik.handleChange}
                            autoComplete="off"
                            // Dette elementet vises ikke ved sidelast
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                        />
                    )}

                    <JaNeiSpørsmål
                        id={keyOf<FormData>('skylderNoenMegPenger')}
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="skylderNoenMegPenger.label" />}
                        feil={formik.errors.skylderNoenMegPenger}
                        state={formik.values.skylderNoenMegPenger}
                        onChange={(e) =>
                            formik.setValues((v) => ({
                                ...v,
                                skylderNoenMegPenger: e,
                                skylderNoenMegPengerBeløp: null,
                            }))
                        }
                    />

                    {formik.values.skylderNoenMegPenger && (
                        <Input
                            className={sharedStyles.marginBottom}
                            id={keyOf<FormData>('skylderNoenMegPengerBeløp')}
                            name={keyOf<FormData>('skylderNoenMegPengerBeløp')}
                            bredde="S"
                            label={<FormattedMessage id="skylderNoenMegPenger.beløp" />}
                            value={formik.values.skylderNoenMegPengerBeløp || ''}
                            feil={formik.errors.skylderNoenMegPengerBeløp}
                            onChange={formik.handleChange}
                            autoComplete="off"
                            // Dette elementet vises ikke ved sidelast
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                        />
                    )}

                    <JaNeiSpørsmål
                        id={keyOf<FormData>('harKontanter')}
                        className={sharedStyles.sporsmal}
                        legend={<FormattedMessage id="harKontanter.label" />}
                        feil={formik.errors.harKontanter}
                        state={formik.values.harKontanter}
                        onChange={(e) =>
                            formik.setValues((v) => ({
                                ...v,
                                harKontanter: e,
                                kontanterBeløp: null,
                            }))
                        }
                    />

                    {formik.values.harKontanter && (
                        <Input
                            className={sharedStyles.marginBottom}
                            id={keyOf<FormData>('kontanterBeløp')}
                            name={keyOf<FormData>('kontanterBeløp')}
                            bredde="S"
                            label={<FormattedMessage id="harKontanter.beløp" />}
                            value={formik.values.kontanterBeløp || ''}
                            feil={formik.errors.kontanterBeløp}
                            onChange={formik.handleChange}
                            autoComplete="off"
                            // Dette elementet vises ikke ved sidelast
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
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
                    avbryt={{
                        toRoute: props.avbrytUrl,
                    }}
                />
            </form>
        </RawIntlProvider>
    );
};

export default DinFormue;
