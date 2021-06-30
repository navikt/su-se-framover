import { useFormik, FormikErrors } from 'formik';
import { Knapp } from 'nav-frontend-knapper';
import { Feiloppsummering, Input } from 'nav-frontend-skjema';
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

type FormData = SøknadState['inntekt'];

const trygdeytelserIUtlandetSchema = yup.object({
    beløp: yup
        .number()
        .typeError('Den lokale valutaen må være et tall')
        .positive()
        .label('Beløp')
        .required('Fyll ut hvor mye du får i lokal valuta') as yup.Schema<unknown> as yup.Schema<string>,
    type: yup.string().required('Fyll ut hvilken type ytelsen er'),
    valuta: yup.string().required('Fyll ut valutaen for ytelsen'),
});

const schema = yup.object<FormData>({
    harForventetInntekt: yup
        .boolean()
        .nullable()
        .required('Fyll ut om ektefelle/partner/samboer forventer arbeidsinntekt'),
    forventetInntekt: yup
        .number()
        .nullable()
        .defined()
        .when('harForventetInntekt', {
            is: true,
            then: yup
                .number()
                .typeError('Forventet inntekt etter uførhet må være et tall')
                .label('Forventet inntekt etter uførhet')
                .nullable(false)
                .positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    harMottattSosialstønad: yup
        .boolean()
        .nullable()
        .required('Fyll ut om ektefelle/partner/samboer har mottatt sosialstønad siste 3 måneder'),
    sosialStønadBeløp: yup
        .number()
        .nullable()
        .when('harMottattSosialstønad', {
            is: true,
            then: yup
                .number()
                .typeError('Beløp på sosialstønad må være et tall')
                .label('Beløp på sosialstønad')
                .nullable()
                .positive(),
            otherwise: yup.number(),
        }) as yup.Schema<Nullable<string>>,
    mottarPensjon: yup.boolean().nullable().required('Fyll ut om ektefelle/partner/samboer mottar pensjon'),
    pensjonsInntekt: yup
        .array(
            yup
                .object({
                    ordning: yup.string().required('Fyll ut hvem ektefelle/partner/samboer mottar pensjon fra'),
                    beløp: yup
                        .number()
                        .defined()
                        .label('Pensjonsinntekt')
                        .typeError('Pensjonsinntekt må et være tall')
                        .positive()
                        .required() as unknown as yup.Schema<string>,
                })
                .required()
        )
        .defined()
        .when('mottarPensjon', {
            is: true,
            then: yup.array().min(1).required(),
            otherwise: yup.array().max(0),
        }),
    andreYtelserINav: yup.boolean().nullable().required('Fyll ut ektefelle/partner/samboer om har andre ytelser i NAV'),
    andreYtelserINavYtelse: yup
        .string()
        .nullable()
        .defined()
        .when('andreYtelserINav', {
            is: true,
            then: yup.string().nullable().min(1).required('Fyll ut hvilken ytelse det er'),
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
    søktAndreYtelserIkkeBehandlet: yup
        .boolean()
        .nullable()
        .required('Fyll ut om ektefelle/partner/samboer har søkt på andre trygdeytelser som dem ikke har fått svar på'),
    søktAndreYtelserIkkeBehandletBegrunnelse: yup
        .string()
        .nullable()
        .defined()
        .when('søktAndreYtelserIkkeBehandlet', {
            is: true,
            then: yup.string().nullable().min(1).required('Fyll ut hvilke andre ytelser du ikke har fått svar på'),
        }),
    harTrygdeytelserIUtlandet: yup
        .boolean()
        .nullable()
        .required('Fyll ut om ektefelle/partner/samboer har trygdeytelser i utlandet'),
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
        <ul>
            {props.arr.map((input, idx) => {
                const errorForLinje = Array.isArray(props.errors) ? props.errors[idx] : null;
                const beløpId = `${props.feltnavn}[${idx}].beløp`;
                const typeId = `${props.feltnavn}[${idx}].type`;
                const valutaId = `${props.feltnavn}[${idx}].valuta`;

                return (
                    <li className={styles.trygdeytelserContainer} key={idx}>
                        <div className={styles.trippleFelter}>
                            <Input
                                id={`${beløpId}`}
                                name={`${beløpId}`}
                                label={<FormattedMessage id="trygdeytelserIUtlandet.beløp" />}
                                value={input.beløp}
                                feil={errorForLinje && typeof errorForLinje === 'object' && errorForLinje.beløp}
                                onChange={(e) => {
                                    props.onChange({
                                        index: idx,
                                        beløp: e.target.value,
                                        type: input.type,
                                        valuta: input.valuta,
                                    });
                                }}
                            />

                            <Input
                                id={`${valutaId}`}
                                name={`${valutaId}`}
                                label={<FormattedMessage id="trygdeytelserIUtlandet.valuta" />}
                                value={input.valuta}
                                feil={errorForLinje && typeof errorForLinje === 'object' && errorForLinje.valuta}
                                onChange={(e) => {
                                    props.onChange({
                                        index: idx,
                                        beløp: input.beløp,
                                        type: input.type,
                                        valuta: e.target.value,
                                    });
                                }}
                            />
                            <Input
                                id={`${typeId}`}
                                name={`${typeId}`}
                                label={<FormattedMessage id="trygdeytelserIUtlandet.ytelse" />}
                                feil={errorForLinje && typeof errorForLinje === 'object' && errorForLinje.type}
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
                    </li>
                );
            })}
            <div className={sharedStyles.leggTilFeltKnapp}>
                <Knapp onClick={() => props.onLeggTilClick()} htmlType="button">
                    <FormattedMessage id="button.leggTil.trygdeytelse" />
                </Knapp>
            </div>
        </ul>
    );
};

const EktefellesInntekt = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
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
                {formik.values.pensjonsInntekt.map((item: { ordning: string; beløp: string }, index: number) => {
                    const feltId = (key: keyof typeof item) => `pensjonsInntekt[${index}].${key}`;
                    const errorForLinje = Array.isArray(formik.errors.pensjonsInntekt)
                        ? formik.errors.pensjonsInntekt[index]
                        : null;
                    return (
                        <div className={sharedStyles.inputFelterDiv} key={index}>
                            <Input
                                id={feltId('ordning')}
                                className={sharedStyles.inputFelt}
                                label={<FormattedMessage id="mottarPensjon.fra" />}
                                value={item.ordning}
                                feil={errorForLinje && typeof errorForLinje === 'object' && errorForLinje.ordning}
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
                                id={feltId('beløp')}
                                className={sharedStyles.inputFelt}
                                label={<FormattedMessage id="mottarPensjon.beløp" />}
                                value={item.beløp}
                                feil={errorForLinje && typeof errorForLinje === 'object' && errorForLinje.beløp}
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
                                <Knapp
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
                                    {intl.formatMessage({ id: 'button.fjernRad.label' })}
                                </Knapp>
                            )}
                        </div>
                    );
                })}
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
                        <FormattedMessage id="button.leggTil.pensjonsgiver" />
                    </Knapp>
                </div>
            </div>
        );
    };

    const { intl } = useI18n({ messages: { ...sharedI18n, ...messages } });
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
                        <JaNeiSpørsmål
                            id="harForventetInntekt"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="forventerInntekt.label" />}
                            feil={formik.errors.harForventetInntekt}
                            state={formik.values.harForventetInntekt}
                            description={intl.formatMessage({ id: 'forventerInntekt.hjelpetekst' })}
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
                                label={<FormattedMessage id="forventerInntekt.beløp" />}
                                onChange={formik.handleChange}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="andreYtelserINAV"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="andreYtelserINAV.label" />}
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

                        {formik.values.andreYtelserINav && (
                            <div className={sharedStyles.inputFelterDiv}>
                                <Input
                                    id="andreYtelserINavYtelse"
                                    name="andreYtelserINavYtelse"
                                    label={<FormattedMessage id="andreYtelserINAV.ytelse" />}
                                    value={formik.values.andreYtelserINavYtelse || ''}
                                    onChange={formik.handleChange}
                                    feil={formik.errors.andreYtelserINavYtelse}
                                />
                                <Input
                                    id="andreYtelserINavBeløp"
                                    name="andreYtelserINavBeløp"
                                    label={<FormattedMessage id="andreYtelserINAV.beløp" />}
                                    value={formik.values.andreYtelserINavBeløp || ''}
                                    onChange={formik.handleChange}
                                    feil={formik.errors.andreYtelserINavBeløp}
                                />
                            </div>
                        )}

                        <JaNeiSpørsmål
                            id="søktAndreYtelserIkkeBehandlet"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="søktAndreYtelserIkkeBehandlet.label" />}
                            description={intl.formatMessage({ id: 'søktAndreYtelserIkkeBehandlet.hjelpetekst' })}
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
                                label={<FormattedMessage id="søktAndreYtelserIkkeBehandlet.begrunnelse" />}
                                value={formik.values.søktAndreYtelserIkkeBehandletBegrunnelse || ''}
                                onChange={formik.handleChange}
                                feil={formik.errors.søktAndreYtelserIkkeBehandletBegrunnelse}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="harMottattSosialstønad"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="sosialStønad.label" />}
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
                                label={<FormattedMessage id="sosialStønad.beløp" />}
                                value={formik.values.sosialStønadBeløp || ''}
                                onChange={formik.handleChange}
                                feil={formik.errors.sosialStønadBeløp}
                            />
                        )}

                        <JaNeiSpørsmål
                            id="trygdeytelserIUtlandet"
                            className={sharedStyles.sporsmal}
                            legend={<FormattedMessage id="trygdeytelserIUtlandet.label" />}
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
                            legend={<FormattedMessage id="mottarPensjon.label" />}
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
                        avbryt={{ toRoute: props.avbrytUrl }}
                    />
                </form>
            </div>
        </RawIntlProvider>
    );
};

export default EktefellesInntekt;
