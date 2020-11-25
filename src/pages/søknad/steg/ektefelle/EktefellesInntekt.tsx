import { useFormik, FormikErrors } from 'formik';
import { Knapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import { Feiloppsummering, Input, SkjemaelementFeilmelding } from 'nav-frontend-skjema';
import * as React from 'react';
import { FormattedMessage, RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import { useI18n } from '../../../../lib/hooks';
import { Nullable } from '../../../../lib/types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import styles from '../inntekt/inntekt.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './inntekt-nb';

/* TODO AI: Make inntekt a more general component and use it */

type FormData = SøknadState['inntekt'];

const trygdeytelserIUtlandetSchema = yup.object({
    beløp: (yup
        .number()
        .typeError('Beløp må være et tall')
        .positive()
        .label('Beløp')
        .required() as yup.Schema<unknown>) as yup.Schema<string>,
    type: yup.string().required(),
    valuta: yup.string().required(),
});

const schema = yup.object<FormData>({
    harForventetInntekt: yup.boolean().nullable().required(),
    forventetInntekt: yup
        .number()
        .nullable()
        .defined()
        .when('harForventetInntekt', {
            is: true,
            then: yup
                .number()
                .typeError('Forventet inntekt må være et tall')
                .label('Forventet inntekt')
                .nullable(false)
                .positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
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
                        .required() as unknown) as yup.Schema<string>,
                })
                .required()
        )
        .defined()
        .when('mottarPensjon', {
            is: true,
            then: yup.array().min(1).required(),
            otherwise: yup.array().max(0),
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
    harTrygdeytelserIUtlandet: yup.boolean().nullable().required(),
    trygdeytelserIUtlandet: yup
        .array(trygdeytelserIUtlandetSchema.required())
        .defined()
        .when('harTrygdeytelserIUtlandet', {
            is: true,
            then: yup.array().min(1).required(),
            otherwise: yup.array().max(0),
        }),
});

const TrygdeytelserInputFelter = (props: {
    arr: Array<{ beløp: string; type: string; valuta: string }>;
    errors: string | string[] | Array<FormikErrors<{ beløp: string; type: string; valuta: string }>> | undefined;
    feltnavn: string;
    onChange: (element: { index: number; beløp: string; type: string; valuta: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    return (
        <div>
            {props.arr.map((input, idx) => {
                const errorForLinje = Array.isArray(props.errors) ? props.errors[idx] : null;
                const beløpId = `${props.feltnavn}[${idx}].beløp`;
                const typeId = `${props.feltnavn}[${idx}].type`;
                const valutaId = `${props.feltnavn}[${idx}].valuta`;

                return (
                    <div className={styles.trygdeytelserContainer} key={idx}>
                        <div className={styles.trippleFelter}>
                            <div>
                                <Input
                                    id={`${beløpId}`}
                                    name={`${beløpId}`}
                                    label={<FormattedMessage id="input.trygdeytelserIUtlandetBeløp.label" />}
                                    value={input.beløp}
                                    onChange={(e) => {
                                        props.onChange({
                                            index: idx,
                                            beløp: e.target.value,
                                            type: input.type,
                                            valuta: input.valuta,
                                        });
                                    }}
                                />
                                {errorForLinje && typeof errorForLinje === 'object' && (
                                    <SkjemaelementFeilmelding>{errorForLinje.beløp}</SkjemaelementFeilmelding>
                                )}
                            </div>
                            <div>
                                <Input
                                    id={`${valutaId}`}
                                    name={`${valutaId}`}
                                    label={<FormattedMessage id="input.trygdeytelserIUtlandetValuta.label" />}
                                    value={input.valuta}
                                    onChange={(e) => {
                                        props.onChange({
                                            index: idx,
                                            beløp: input.beløp,
                                            type: input.type,
                                            valuta: e.target.value,
                                        });
                                    }}
                                />
                                {errorForLinje && typeof errorForLinje === 'object' && (
                                    <SkjemaelementFeilmelding>{errorForLinje.valuta}</SkjemaelementFeilmelding>
                                )}
                            </div>
                            <div>
                                <Input
                                    id={`${typeId}`}
                                    name={`${typeId}`}
                                    label={<FormattedMessage id="input.trygdeytelserIUtlandetType.label" />}
                                    value={input.type}
                                    onChange={(e) => {
                                        props.onChange({
                                            index: idx,
                                            beløp: input.beløp,
                                            type: e.target.value,
                                            valuta: input.valuta,
                                        });
                                    }}
                                />
                                {errorForLinje && typeof errorForLinje === 'object' && (
                                    <SkjemaelementFeilmelding>{errorForLinje.type}</SkjemaelementFeilmelding>
                                )}
                            </div>
                        </div>
                        {props.arr.length > 1 && (
                            <Knapp
                                className={styles.fjernFeltButton}
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

const EktefellesInntekt = (props: { forrigeUrl: string; nesteUrl: string }) => {
    const ektefelle = useAppSelector((s) => s.soknad.ektefelle);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const formik = useFormik<FormData>({
        initialValues: ektefelle.inntekt,
        onSubmit: (values) => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const save = (values: FormData) =>
        dispatch(søknadSlice.actions.ektefelleUpdated({ ...ektefelle, inntekt: values }));

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
                    className={sharedStyles.marginBottomContainer}
                    onSubmit={(e) => {
                        setHasSubmitted(true);
                        formik.handleSubmit(e);
                    }}
                >
                    <div className={sharedStyles.formContainer}>
                        <JaNeiSpørsmål
                            id="harForventetInntekt"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.harForventetInntekt.label" />}
                            feil={formik.errors.harForventetInntekt}
                            state={formik.values.harForventetInntekt}
                            description={intl.formatMessage({ id: 'hjelpetekst.harForventetInntekt.body' })}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    harForventetInntekt: val,
                                    forventetInntekt: null,
                                })
                            }
                        />

                        {formik.values.harForventetInntekt && (
                            <Input
                                id="forventetInntekt"
                                feil={formik.errors.forventetInntekt}
                                className={sharedStyles.marginBottom}
                                value={formik.values.forventetInntekt || ''}
                                label={<FormattedMessage id="input.forventetInntekt.label" />}
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
                                    andreYtelserINavYtelse: null,
                                    andreYtelserINavBeløp: null,
                                })
                            }
                        />

                        {/*Flere inputs? */}
                        {formik.values.andreYtelserINav && (
                            <div className={sharedStyles.inputFelterDiv}>
                                <Input
                                    id="andreYtelserINavYtelse"
                                    name="andreYtelserINavYtelse"
                                    label={<FormattedMessage id="input.andreYtelserINavYtelse.label" />}
                                    value={formik.values.andreYtelserINavYtelse || ''}
                                    onChange={formik.handleChange}
                                    feil={formik.errors.andreYtelserINavYtelse}
                                />
                                <Input
                                    id="andreYtelserINavBeløp"
                                    name="andreYtelserINavBeløp"
                                    label={<FormattedMessage id="input.andreYtelserINavBeløp.label" />}
                                    value={formik.values.andreYtelserINavBeløp || ''}
                                    onChange={formik.handleChange}
                                    feil={formik.errors.andreYtelserINavBeløp}
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
                                    søktAndreYtelserIkkeBehandletBegrunnelse: null,
                                })
                            }
                        />

                        {formik.values.søktAndreYtelserIkkeBehandlet && (
                            <Input
                                className={sharedStyles.marginBottom}
                                id="søktAndreYtelserIkkeBehandletBegrunnelse"
                                name="søktAndreYtelserIkkeBehandletBegrunnelse"
                                label={<FormattedMessage id="input.søktAndreYtelserIkkeBehandletBegrunnelse.label" />}
                                value={formik.values.søktAndreYtelserIkkeBehandletBegrunnelse || ''}
                                onChange={formik.handleChange}
                                feil={formik.errors.søktAndreYtelserIkkeBehandletBegrunnelse}
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
                                    sosialStønadBeløp: null,
                                })
                            }
                        />
                        {formik.values.harMottattSosialstønad && (
                            <Input
                                className={sharedStyles.marginBottom}
                                id="sosialStønadBeløp"
                                name="sosialStønadBeløp"
                                label={<FormattedMessage id="input.sosialStønadBeløp.label" />}
                                value={formik.values.sosialStønadBeløp || ''}
                                onChange={formik.handleChange}
                                feil={formik.errors.sosialStønadBeløp}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="trygdeytelserIUtlandet"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="input.trygdeytelserIUtlandet.label" />}
                            feil={formik.errors.harTrygdeytelserIUtlandet}
                            state={formik.values.harTrygdeytelserIUtlandet}
                            onChange={(val) =>
                                formik.setValues({
                                    ...formik.values,
                                    harTrygdeytelserIUtlandet: val,
                                    trygdeytelserIUtlandet: val ? [{ beløp: '', type: '', valuta: '' }] : [],
                                })
                            }
                        />
                        {formik.values.harTrygdeytelserIUtlandet && (
                            <TrygdeytelserInputFelter
                                arr={formik.values.trygdeytelserIUtlandet}
                                errors={formik.errors.trygdeytelserIUtlandet}
                                feltnavn="trygdeytelserIUtlandet"
                                onLeggTilClick={() => {
                                    formik.setValues({
                                        ...formik.values,
                                        trygdeytelserIUtlandet: [
                                            ...formik.values.trygdeytelserIUtlandet,
                                            {
                                                beløp: '',
                                                type: '',
                                                valuta: '',
                                            },
                                        ],
                                    });
                                }}
                                onFjernClick={(index) => {
                                    formik.setValues({
                                        ...formik.values,
                                        trygdeytelserIUtlandet: formik.values.trygdeytelserIUtlandet.filter(
                                            (_, i) => index !== i
                                        ),
                                    });
                                }}
                                onChange={(val) => {
                                    formik.setValues({
                                        ...formik.values,
                                        trygdeytelserIUtlandet: formik.values.trygdeytelserIUtlandet.map((input, i) =>
                                            val.index === i
                                                ? {
                                                      beløp: val.beløp,
                                                      type: val.type,
                                                      valuta: val.valuta,
                                                  }
                                                : input
                                        ),
                                    });
                                }}
                            />
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
                        className={sharedStyles.marginBottom}
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

export default EktefellesInntekt;
