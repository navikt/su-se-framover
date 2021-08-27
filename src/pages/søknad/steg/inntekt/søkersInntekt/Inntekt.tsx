import { useFormik } from 'formik';
import { Feiloppsummering, Input } from 'nav-frontend-skjema';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { useI18n } from '~lib/i18n';
import { keyOf } from '~lib/types';
import { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import Bunnknapper from '../../../bunnknapper/Bunnknapper';
import sharedStyles from '../../../steg-shared.module.less';
import sharedI18n from '../../steg-shared-i18n';
import { inntektsValideringSchema } from '../inntektSøknadUtils';
import PensjonsInntekter from '../Pensjonsinntekter';
import TrygdeytelserInputFelter from '../TrygdeytelserInputs/TrygdeytelserInputs';

import messages from './inntekt-nb';

type FormData = SøknadState['inntekt'];

const DinInntekt = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const inntektFraStore = useAppSelector((s) => s.soknad.inntekt);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const formik = useFormik<FormData>({
        initialValues: {
            harForventetInntekt: inntektFraStore.harForventetInntekt,
            forventetInntekt: inntektFraStore.forventetInntekt,
            harMottattSosialstønad: inntektFraStore.harMottattSosialstønad,
            mottarPensjon: inntektFraStore.mottarPensjon,
            pensjonsInntekt: inntektFraStore.pensjonsInntekt,
            andreYtelserINav: inntektFraStore.andreYtelserINav,
            andreYtelserINavYtelse: inntektFraStore.andreYtelserINavYtelse,
            andreYtelserINavBeløp: inntektFraStore.andreYtelserINavBeløp,
            søktAndreYtelserIkkeBehandlet: inntektFraStore.søktAndreYtelserIkkeBehandlet,
            søktAndreYtelserIkkeBehandletBegrunnelse: inntektFraStore.søktAndreYtelserIkkeBehandletBegrunnelse,
            sosialStønadBeløp: inntektFraStore.sosialStønadBeløp,
            harTrygdeytelserIUtlandet: inntektFraStore.harTrygdeytelserIUtlandet,
            trygdeytelserIUtlandet: inntektFraStore.trygdeytelserIUtlandet,
        },
        onSubmit: (values) => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: inntektsValideringSchema('søker'),
        validateOnChange: hasSubmitted,
    });

    const save = (values: FormData) =>
        dispatch(
            søknadSlice.actions.inntektUpdated({
                harForventetInntekt: values.harForventetInntekt,
                forventetInntekt: values.forventetInntekt,
                harMottattSosialstønad: values.harMottattSosialstønad,
                mottarPensjon: values.mottarPensjon,
                pensjonsInntekt: values.pensjonsInntekt,
                andreYtelserINav: values.andreYtelserINav,
                andreYtelserINavYtelse: values.andreYtelserINavYtelse,
                andreYtelserINavBeløp: values.andreYtelserINavBeløp,
                søktAndreYtelserIkkeBehandlet: values.søktAndreYtelserIkkeBehandlet,
                søktAndreYtelserIkkeBehandletBegrunnelse: values.søktAndreYtelserIkkeBehandletBegrunnelse,
                sosialStønadBeløp: values.sosialStønadBeløp,
                harTrygdeytelserIUtlandet: values.harTrygdeytelserIUtlandet,
                trygdeytelserIUtlandet: values.trygdeytelserIUtlandet,
            })
        );

    return (
        <form
            onSubmit={(e) => {
                setHasSubmitted(true);
                formik.handleSubmit(e);
                focusAfterTimeout(feiloppsummeringref)();
            }}
            className={sharedStyles.container}
        >
            <div className={sharedStyles.formContainer}>
                <JaNeiSpørsmål
                    id={keyOf<FormData>('harForventetInntekt')}
                    className={sharedStyles.sporsmal}
                    legend={formatMessage('forventerInntekt.label')}
                    description={formatMessage('forventerInntekt.hjelpetekst')}
                    feil={formik.errors.harForventetInntekt}
                    state={formik.values.harForventetInntekt}
                    onChange={(val) =>
                        formik.setValues((v) => ({
                            ...v,
                            harForventetInntekt: val,
                            forventetInntekt: null,
                        }))
                    }
                />

                {formik.values.harForventetInntekt && (
                    <Input
                        id={keyOf<FormData>('forventetInntekt')}
                        feil={formik.errors.forventetInntekt}
                        bredde="S"
                        className={sharedStyles.marginBottom}
                        value={formik.values.forventetInntekt || ''}
                        label={formatMessage('forventerInntekt.beløp')}
                        onChange={formik.handleChange}
                        autoComplete="off"
                        // Dette elementet vises ikke ved sidelast
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                    />
                )}

                <JaNeiSpørsmål
                    id={keyOf<FormData>('andreYtelserINav')}
                    className={sharedStyles.sporsmal}
                    legend={formatMessage('andreYtelserINAV.label')}
                    feil={formik.errors.andreYtelserINav}
                    state={formik.values.andreYtelserINav}
                    onChange={(val) =>
                        formik.setValues((v) => ({
                            ...v,
                            andreYtelserINav: val,
                            andreYtelserINavYtelse: null,
                            andreYtelserINavBeløp: null,
                        }))
                    }
                />

                {formik.values.andreYtelserINav && (
                    <div className={sharedStyles.inputFelterDiv}>
                        <Input
                            id={keyOf<FormData>('andreYtelserINavYtelse')}
                            name={keyOf<FormData>('andreYtelserINavYtelse')}
                            label={formatMessage('andreYtelserINAV.ytelse')}
                            value={formik.values.andreYtelserINavYtelse || ''}
                            onChange={formik.handleChange}
                            feil={formik.errors.andreYtelserINavYtelse}
                            autoComplete="off"
                            // Dette elementet vises ikke ved sidelast
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                        />
                        <Input
                            id={keyOf<FormData>('andreYtelserINavBeløp')}
                            name={keyOf<FormData>('andreYtelserINavBeløp')}
                            label={formatMessage('andreYtelserINAV.beløp')}
                            value={formik.values.andreYtelserINavBeløp || ''}
                            onChange={formik.handleChange}
                            feil={formik.errors.andreYtelserINavBeløp}
                            autoComplete="off"
                        />
                    </div>
                )}

                <JaNeiSpørsmål
                    id={keyOf<FormData>('søktAndreYtelserIkkeBehandlet')}
                    className={sharedStyles.sporsmal}
                    legend={formatMessage('søktAndreYtelserIkkeBehandlet.label')}
                    feil={formik.errors.søktAndreYtelserIkkeBehandlet}
                    description={formatMessage('søktAndreYtelserIkkeBehandlet.hjelpetekst')}
                    state={formik.values.søktAndreYtelserIkkeBehandlet}
                    onChange={(val) =>
                        formik.setValues((v) => ({
                            ...v,
                            søktAndreYtelserIkkeBehandlet: val,
                            søktAndreYtelserIkkeBehandletBegrunnelse: null,
                        }))
                    }
                />

                {formik.values.søktAndreYtelserIkkeBehandlet && (
                    <Input
                        className={sharedStyles.marginBottom}
                        id={keyOf<FormData>('søktAndreYtelserIkkeBehandletBegrunnelse')}
                        name={keyOf<FormData>('søktAndreYtelserIkkeBehandletBegrunnelse')}
                        bredde="XXL"
                        label={formatMessage('søktAndreYtelserIkkeBehandlet.begrunnelse')}
                        value={formik.values.søktAndreYtelserIkkeBehandletBegrunnelse || ''}
                        onChange={formik.handleChange}
                        feil={formik.errors.søktAndreYtelserIkkeBehandletBegrunnelse}
                        autoComplete="off"
                        // Dette elementet vises ikke ved sidelast
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                    />
                )}

                <JaNeiSpørsmål
                    id={keyOf<FormData>('harMottattSosialstønad')}
                    className={sharedStyles.sporsmal}
                    legend={formatMessage('sosialstønad.label')}
                    feil={formik.errors.harMottattSosialstønad}
                    state={formik.values.harMottattSosialstønad}
                    onChange={(val) =>
                        formik.setValues((v) => ({
                            ...v,
                            harMottattSosialstønad: val,
                            sosialStønadBeløp: null,
                        }))
                    }
                />
                {formik.values.harMottattSosialstønad && (
                    <Input
                        className={sharedStyles.marginBottom}
                        id={keyOf<FormData>('sosialStønadBeløp')}
                        name={keyOf<FormData>('sosialStønadBeløp')}
                        bredde="S"
                        label={formatMessage('sosialstønad.beløp')}
                        value={formik.values.sosialStønadBeløp || ''}
                        onChange={formik.handleChange}
                        feil={formik.errors.sosialStønadBeløp}
                        autoComplete="off"
                        // Dette elementet vises ikke ved sidelast
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                    />
                )}

                <JaNeiSpørsmål
                    id={keyOf<FormData>('harTrygdeytelserIUtlandet')}
                    className={sharedStyles.sporsmal}
                    legend={formatMessage('trygdeytelserIUtlandet.label')}
                    feil={formik.errors.harTrygdeytelserIUtlandet}
                    state={formik.values.harTrygdeytelserIUtlandet}
                    onChange={(val) =>
                        formik.setValues((v) => ({
                            ...v,
                            harTrygdeytelserIUtlandet: val,
                            trygdeytelserIUtlandet: val ? [{ beløp: '', type: '', valuta: '' }] : [],
                        }))
                    }
                />
                {formik.values.harTrygdeytelserIUtlandet && (
                    <TrygdeytelserInputFelter
                        arr={formik.values.trygdeytelserIUtlandet}
                        errors={formik.errors.trygdeytelserIUtlandet}
                        feltnavn={keyOf<FormData>('trygdeytelserIUtlandet')}
                        onLeggTilClick={() => {
                            formik.setValues((v) => ({
                                ...v,
                                trygdeytelserIUtlandet: [
                                    ...formik.values.trygdeytelserIUtlandet,
                                    {
                                        beløp: '',
                                        type: '',
                                        valuta: '',
                                    },
                                ],
                            }));
                        }}
                        onFjernClick={(index) => {
                            formik.setValues((v) => ({
                                ...v,
                                trygdeytelserIUtlandet: formik.values.trygdeytelserIUtlandet.filter(
                                    (_, i) => index !== i
                                ),
                            }));
                        }}
                        onChange={(val) => {
                            formik.setValues((v) => ({
                                ...v,
                                trygdeytelserIUtlandet: formik.values.trygdeytelserIUtlandet.map((input, i) =>
                                    val.index === i
                                        ? {
                                              beløp: val.beløp,
                                              type: val.type,
                                              valuta: val.valuta,
                                          }
                                        : input
                                ),
                            }));
                        }}
                    />
                )}

                <JaNeiSpørsmål
                    id={keyOf<FormData>('mottarPensjon')}
                    className={sharedStyles.sporsmal}
                    legend={formatMessage('mottarPensjon.label')}
                    feil={formik.errors.mottarPensjon}
                    state={formik.values.mottarPensjon}
                    onChange={(val) =>
                        formik.setValues((v) => ({
                            ...v,
                            mottarPensjon: val,
                            pensjonsInntekt: val
                                ? formik.values.pensjonsInntekt.length === 0
                                    ? [{ ordning: '', beløp: '' }]
                                    : formik.values.pensjonsInntekt
                                : [],
                        }))
                    }
                />
                {formik.values.mottarPensjon && (
                    <PensjonsInntekter
                        arr={formik.values.pensjonsInntekt}
                        errors={formik.errors.pensjonsInntekt}
                        onLeggTilClick={() => {
                            formik.setValues((v) => ({
                                ...v,
                                pensjonsInntekt: [
                                    ...formik.values.pensjonsInntekt,
                                    {
                                        beløp: '',
                                        ordning: '',
                                    },
                                ],
                            }));
                        }}
                        onFjernClick={(index) => {
                            formik.setValues((v) => ({
                                ...v,
                                pensjonsInntekt: formik.values.pensjonsInntekt.filter((_, i) => index !== i),
                            }));
                        }}
                        onChange={(val) => {
                            formik.setValues((v) => ({
                                ...v,
                                pensjonsInntekt: formik.values.pensjonsInntekt.map((input, i) =>
                                    val.index === i
                                        ? {
                                              beløp: val.beløp,
                                              ordning: val.ordning,
                                          }
                                        : input
                                ),
                            }));
                        }}
                    />
                )}
            </div>
            <Feiloppsummering
                className={sharedStyles.marginBottom}
                tittel={formatMessage('feiloppsummering.title')}
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
    );
};

export default DinInntekt;
