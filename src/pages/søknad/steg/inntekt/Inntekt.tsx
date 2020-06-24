import * as React from 'react';
import { Input } from 'nav-frontend-skjema';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useFormik } from 'formik';
import { useHistory } from 'react-router-dom';
import { JaNeiSpørsmål } from '~/components/FormElements';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import søknadSlice from '~/features/søknad/søknad.slice';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import { Nullable } from '../../../../lib/types';
import messages from './inntekt-nb';
import { Feiloppsummering } from 'nav-frontend-skjema';
import yup, { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import sharedI18n from '../steg-shared-i18n';
import { useI18n } from '../../../../lib/hooks';
import { Knapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';

interface FormData {
    //harInntekt: Nullable<boolean>;
    forventetInntekt: Nullable<string>;
    harMottattSosialstønad: Nullable<boolean>;
    mottarPensjon: Nullable<boolean>;
    pensjonsInntekt: Array<{ ordning: string; beløp: string }>;
    tjenerPengerIUtlandet: Nullable<boolean>;
    tjenerPengerIUtlandetBeløp: Nullable<string>;
    andreYtelserINav: Nullable<boolean>;
    andreYtelserINavYtelse: Nullable<string>;
    andreYtelserINavBeløp: Nullable<string>;
    søktAndreYtelserIkkeBehandlet: Nullable<boolean>;
    søktAndreYtelserIkkeBehandletBegrunnelse: Nullable<string>;
    sosialStønadBeløp: Nullable<string>;
    trygdeytelserIUtlandet: Nullable<boolean>;
    trygdeytelserIUtlandetBeløp: Nullable<string>;
    trygdeytelserIUtlandetType: Nullable<string>;
    trygdeytelserIUtlandetFraHvem: Nullable<string>;
}

const schema = yup.object<FormData>({
    /* harInntekt: yup.boolean().nullable().required(), */
    forventetInntekt: yup.number().nullable().defined().min(0).label('Inntekt') as yup.Schema<Nullable<string>>, //TODO add required
    harMottattSosialstønad: yup.boolean().nullable().required(),
    sosialStønadBeløp: yup
        .number()
        .nullable()
        .defined()
        .when('harMottattSosialstønad', {
            is: true,
            then: yup
                .number()
                .typeError('Beløp på andre ytelser må være et tall')
                .label('Beløp på andre ytelser')
                .nullable(false)
                .positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    mottarPensjon: yup.boolean().nullable().required(),
    pensjonsInntekt: yup
        .array(
            yup
                .object({
                    ordning: yup.string().required(),
                    beløp: (yup
                        .number()
                        .defined()
                        .label('Pensjonsinntekt')
                        .typeError('Pensjonsinntekt må et være tall')
                        .positive()
                        .required()
                        .moreThan(0) as unknown) as yup.Schema<string>,
                })
                .required()
        )
        .defined()
        .when('mottarPensjon', {
            is: true,
            then: yup.array().min(0).required(),
            otherwise: yup.array().max(0),
        }),
    tjenerPengerIUtlandet: yup.boolean().nullable().required(),
    tjenerPengerIUtlandetBeløp: yup
        .string()
        .nullable()
        .defined()
        .when('tjenerPengerIUtlandet', {
            is: true,
            then: yup.string().nullable().min(1).required(),
        }),
    andreYtelserINav: yup.boolean().nullable().required(),
    andreYtelserINavYtelse: yup
        .string()
        .nullable()
        .defined()
        .when('andreYtelserINav', {
            is: true,
            then: yup.string().nullable().min(1).required(),
        }),
    andreYtelserINavBeløp: yup
        .number()
        .nullable()
        .defined()
        .when('andreYtelserINav', {
            is: true,
            then: yup
                .number()
                .typeError('Beløp på andre ytelser må være et tall')
                .label('Beløp på andre ytelser')
                .nullable(false)
                .positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    søktAndreYtelserIkkeBehandlet: yup.boolean().nullable().required(),
    søktAndreYtelserIkkeBehandletBegrunnelse: yup
        .string()
        .nullable()
        .defined()
        .when('søktAndreYtelserIkkeBehandlet', {
            is: true,
            then: yup.string().nullable().min(1).required(),
        }),
    trygdeytelserIUtlandet: yup.boolean().nullable().required(),
    trygdeytelserIUtlandetBeløp: yup
        .number()
        .nullable()
        .defined()
        .when('trygdeytelserIUtlandet', {
            is: true,
            then: yup
                .number()
                .typeError('trygdeytelser i utlandet beløpet må være et tall')
                .label('trygdeytelser i utlandet')
                .nullable(false)
                .positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    trygdeytelserIUtlandetType: yup
        .string()
        .nullable()
        .defined()
        .when('trygdeytelserIUtlandet', {
            is: true,
            then: yup.string().nullable().min(1).required(),
        }),
    trygdeytelserIUtlandetFraHvem: yup
        .string()
        .nullable()
        .defined()
        .when('trygdeytelserIUtlandet', {
            is: true,
            then: yup.string().nullable().min(1).required(),
        }),
});

const DinInntekt = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const inntektFraStore = useAppSelector((s) => s.soknad.inntekt);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const formik = useFormik<FormData>({
        initialValues: {
            //harInntekt: inntektFraStore.harInntekt,
            forventetInntekt: inntektFraStore.forventetInntekt,
            harMottattSosialstønad: inntektFraStore.harMottattSosialstønad,
            mottarPensjon: inntektFraStore.mottarPensjon,
            pensjonsInntekt: inntektFraStore.pensjonsInntekt,
            tjenerPengerIUtlandet: inntektFraStore.tjenerPengerIUtlandet,
            tjenerPengerIUtlandetBeløp: inntektFraStore.tjenerPengerIUtlandetBeløp,
            andreYtelserINav: inntektFraStore.andreYtelserINav,
            andreYtelserINavYtelse: inntektFraStore.andreYtelserINavYtelse,
            andreYtelserINavBeløp: inntektFraStore.andreYtelserINavBeløp,
            søktAndreYtelserIkkeBehandlet: inntektFraStore.søktAndreYtelserIkkeBehandlet,
            søktAndreYtelserIkkeBehandletBegrunnelse: inntektFraStore.søktAndreYtelserIkkeBehandletBegrunnelse,
            sosialStønadBeløp: inntektFraStore.sosialStønadBeløp,
            trygdeytelserIUtlandet: inntektFraStore.trygdeytelserIUtlandet,
            trygdeytelserIUtlandetBeløp: inntektFraStore.trygdeytelserIUtlandetBeløp,
            trygdeytelserIUtlandetType: inntektFraStore.trygdeytelserIUtlandetType,
            trygdeytelserIUtlandetFraHvem: inntektFraStore.trygdeytelserIUtlandetFraHvem,
        },
        onSubmit: (values) => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const save = (values: FormData) =>
        dispatch(
            søknadSlice.actions.inntektUpdated({
                //harInntekt: values.harInntekt,
                forventetInntekt: values.forventetInntekt,
                harMottattSosialstønad: values.harMottattSosialstønad,
                mottarPensjon: values.mottarPensjon,
                pensjonsInntekt: values.pensjonsInntekt,
                tjenerPengerIUtlandet: values.tjenerPengerIUtlandet,
                tjenerPengerIUtlandetBeløp: values.tjenerPengerIUtlandetBeløp,
                andreYtelserINav: values.andreYtelserINav,
                andreYtelserINavYtelse: values.andreYtelserINavYtelse,
                andreYtelserINavBeløp: values.andreYtelserINavBeløp,
                søktAndreYtelserIkkeBehandlet: values.søktAndreYtelserIkkeBehandlet,
                søktAndreYtelserIkkeBehandletBegrunnelse: values.søktAndreYtelserIkkeBehandletBegrunnelse,
                sosialStønadBeløp: values.sosialStønadBeløp,
                trygdeytelserIUtlandet: values.trygdeytelserIUtlandet,
                trygdeytelserIUtlandetBeløp: values.trygdeytelserIUtlandetBeløp,
                trygdeytelserIUtlandetType: values.trygdeytelserIUtlandetType,
                trygdeytelserIUtlandetFraHvem: values.trygdeytelserIUtlandetFraHvem,
            })
        );

    const pensjonsInntekter = () => {
        return (
            <div>
                {formik.values.pensjonsInntekt.map((item: { ordning: string; beløp: string }, index: number) => (
                    <div className={sharedStyles.inputFelterDiv} key={index}>
                        <Input
                            className={sharedStyles.inputFelt}
                            label={<FormattedMessage id="input.pensjonsOrdning.label" />}
                            value={item.ordning}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    pensjonsInntekt: formik.values.pensjonsInntekt.map((i, idx) =>
                                        idx === index ? { ordning: e.target.value, beløp: item.beløp } : i
                                    ),
                                })
                            }
                        />
                        <Input
                            className={sharedStyles.inputFelt}
                            label={<FormattedMessage id="input.pensjonsBeløp.label" />}
                            value={item.beløp}
                            onChange={(e) =>
                                formik.setValues({
                                    ...formik.values,
                                    pensjonsInntekt: formik.values.pensjonsInntekt.map((i, idx) =>
                                        idx === index ? { ordning: item.ordning, beløp: e.target.value } : i
                                    ),
                                })
                            }
                        />
                        {formik.values.pensjonsInntekt.length > 1 && (
                            <Lenke
                                href="#"
                                className={sharedStyles.fjernFeltLink}
                                onClick={(e) => {
                                    e.preventDefault();
                                    formik.setValues({
                                        ...formik.values,
                                        pensjonsInntekt: [
                                            ...formik.values.pensjonsInntekt.slice(0, index),
                                            ...formik.values.pensjonsInntekt.slice(index + 1),
                                        ],
                                    });
                                }}
                            >
                                Fjern felt
                            </Lenke>
                        )}
                    </div>
                ))}
                <div className={sharedStyles.leggTilFeltKnapp}>
                    <Knapp
                        onClick={(e) => {
                            e.preventDefault();
                            formik.setValues({
                                ...formik.values,
                                pensjonsInntekt: [...formik.values.pensjonsInntekt, { ordning: '', beløp: '' }],
                            });
                        }}
                    >
                        Legg til felt
                    </Knapp>
                </div>
            </div>
        );
    };

    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    return (
        <RawIntlProvider value={intl}>
            <div className={sharedStyles.container}>
                <form
                    onSubmit={(e) => {
                        setHasSubmitted(true);
                        formik.handleSubmit(e);
                    }}
                >
                    <div className={sharedStyles.formContainer}>
                        {/* <JaNeiSpørsmål
                            id="harInntekt"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harInntekt.label" />}
                            feil={formik.errors.harInntekt}
                            state={formik.values.harInntekt}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    harInntekt: val,
                                })
                            }
                        />*/}

                        <Input
                            id="forventetInntekt"
                            feil={formik.errors.forventetInntekt}
                            className={sharedStyles.sporsmal}
                            value={formik.values.forventetInntekt || ''}
                            label={<FormattedMessage id="input.inntekt.forventetInntekt" />}
                            onChange={formik.handleChange}
                        />

                        <JaNeiSpørsmål
                            id="tjenerPengerIUtlandet"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.tjenerPengerIUtlandet.label" />}
                            feil={formik.errors.tjenerPengerIUtlandet}
                            state={formik.values.tjenerPengerIUtlandet}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    tjenerPengerIUtlandet: val,
                                })
                            }
                        />

                        {formik.values.tjenerPengerIUtlandet && (
                            <Input
                                id="tjenerPengerIUtlandetBeløp"
                                name="tjenerPengerIUtlandetBeløp"
                                label={<FormattedMessage id="input.tjenerPengerIUtlandetBeløp.label" />}
                                value={formik.values.tjenerPengerIUtlandetBeløp || ''}
                                onChange={formik.handleChange}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="andreYtelserINAV"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.andreYtelserINAV.label" />}
                            feil={formik.errors.andreYtelserINav}
                            state={formik.values.andreYtelserINav}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    andreYtelserINav: val,
                                })
                            }
                        />

                        {/*Flere inputs? */}
                        {formik.values.andreYtelserINav && (
                            <div>
                                <Input
                                    id="andreYtelserINavYtelse"
                                    name="andreYtelserINavYtelse"
                                    label={<FormattedMessage id="input.andreYtelserINavYtelse.label" />}
                                    value={formik.values.andreYtelserINavYtelse || ''}
                                    onChange={formik.handleChange}
                                />
                                <Input
                                    id="andreYtelserINavBeløp"
                                    name="andreYtelserINavBeløp"
                                    label={<FormattedMessage id="input.andreYtelserINavBeløp.label" />}
                                    value={formik.values.andreYtelserINavBeløp || ''}
                                    onChange={formik.handleChange}
                                />
                            </div>
                        )}

                        <JaNeiSpørsmål
                            id="søktAndreYtelserIkkeBehandlet"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.søktAndreYtelserIkkeBehandlet.label" />}
                            feil={formik.errors.søktAndreYtelserIkkeBehandlet}
                            state={formik.values.søktAndreYtelserIkkeBehandlet}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    søktAndreYtelserIkkeBehandlet: val,
                                })
                            }
                        />

                        {formik.values.søktAndreYtelserIkkeBehandlet && (
                            <Input
                                id="søktAndreYtelserIkkeBehandletBegrunnelse"
                                name="søktAndreYtelserIkkeBehandletBegrunnelse"
                                label={<FormattedMessage id="input.søktAndreYtelserIkkeBehandletBegrunnelse.label" />}
                                value={formik.values.søktAndreYtelserIkkeBehandletBegrunnelse || ''}
                                onChange={formik.handleChange}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="harMottattSosialstønad"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harMottattSosialstønad.label" />}
                            feil={formik.errors.harMottattSosialstønad}
                            state={formik.values.harMottattSosialstønad}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    harMottattSosialstønad: val,
                                })
                            }
                        />
                        {formik.values.harMottattSosialstønad && (
                            <Input
                                id="sosialStønadBeløp"
                                name="sosialStønadBeløp"
                                label={<FormattedMessage id="input.sosialStønadBeløp.label" />}
                                value={formik.values.sosialStønadBeløp || ''}
                                onChange={formik.handleChange}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="trygdeytelserIUtlandet"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.trygdeytelserIUtlandet.label" />}
                            feil={formik.errors.trygdeytelserIUtlandet}
                            state={formik.values.trygdeytelserIUtlandet}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    trygdeytelserIUtlandet: val,
                                })
                            }
                        />

                        {/*Flere inputs? */}
                        {formik.values.trygdeytelserIUtlandet && (
                            <div>
                                <Input
                                    id="trygdeytelserIUtlandetBeløp"
                                    name="trygdeytelserIUtlandetBeløp"
                                    label={<FormattedMessage id="input.trygdeytelserIUtlandetBeløp.label" />}
                                    value={formik.values.trygdeytelserIUtlandetBeløp || ''}
                                    onChange={formik.handleChange}
                                />
                                <Input
                                    id="trygdeytelserIUtlandetType"
                                    name="trygdeytelserIUtlandetType"
                                    label={<FormattedMessage id="input.trygdeytelserIUtlandetType.label" />}
                                    value={formik.values.trygdeytelserIUtlandetType || ''}
                                    onChange={formik.handleChange}
                                />

                                <Input
                                    id="trygdeytelserIUtlandetFraHvem"
                                    name="trygdeytelserIUtlandetFraHvem"
                                    label={<FormattedMessage id="input.trygdeytelserIUtlandetFraHvem.label" />}
                                    value={formik.values.trygdeytelserIUtlandetFraHvem || ''}
                                    onChange={formik.handleChange}
                                />
                            </div>
                        )}

                        <JaNeiSpørsmål
                            id="mottarPensjon"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.mottarPensjon.label" />}
                            feil={formik.errors.mottarPensjon}
                            state={formik.values.mottarPensjon}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    mottarPensjon: val,
                                    pensjonsInntekt: val
                                        ? formik.values.pensjonsInntekt.length === 0
                                            ? [{ ordning: '', beløp: '' }]
                                            : formik.values.pensjonsInntekt
                                        : [],
                                })
                            }
                        />
                        {formik.values.mottarPensjon && pensjonsInntekter()}
                    </div>
                    <Feiloppsummering
                        className={sharedStyles.feiloppsummering}
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                        hidden={!formikErrorsHarFeil(formik.errors)}
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
            </div>
        </RawIntlProvider>
    );
};

export default DinInntekt;
