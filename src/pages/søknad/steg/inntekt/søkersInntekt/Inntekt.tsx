import { TextField } from '@navikt/ds-react';
import { useFormik } from 'formik';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~src/features/søknad/søknad.slice';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useI18n } from '~src/lib/i18n';
import { keyOf } from '~src/lib/types';
import { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~src/lib/validering';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';

import Bunnknapper from '../../../bunnknapper/Bunnknapper';
import * as sharedStyles from '../../../steg-shared.module.less';
import sharedI18n from '../../steg-shared-i18n';
import { inntektsValideringSchema } from '../inntektSøknadUtils';
import PensjonsInntekter from '../pensonsinntekter/Pensjonsinntekter';
import TrygdeytelserInputFelter from '../TrygdeytelserInputs/TrygdeytelserInputs';

import messages from './inntekt-nb';

type FormData = SøknadState['inntekt'];

const DinInntekt = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const inntektFraStore = useAppSelector((s) => s.soknad.inntekt);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const formik = useFormik<FormData>({
        initialValues: {
            harForventetInntekt: inntektFraStore.harForventetInntekt,
            forventetInntekt: inntektFraStore.forventetInntekt,
            mottarPensjon: inntektFraStore.mottarPensjon,
            pensjonsInntekt: inntektFraStore.pensjonsInntekt,
            andreYtelserINav: inntektFraStore.andreYtelserINav,
            andreYtelserINavYtelse: inntektFraStore.andreYtelserINavYtelse,
            andreYtelserINavBeløp: inntektFraStore.andreYtelserINavBeløp,
            søktAndreYtelserIkkeBehandlet: inntektFraStore.søktAndreYtelserIkkeBehandlet,
            søktAndreYtelserIkkeBehandletBegrunnelse: inntektFraStore.søktAndreYtelserIkkeBehandletBegrunnelse,
            harTrygdeytelserIUtlandet: inntektFraStore.harTrygdeytelserIUtlandet,
            trygdeytelserIUtlandet: inntektFraStore.trygdeytelserIUtlandet,
        },
        onSubmit: (values) => {
            save(values);
            navigate(props.nesteUrl);
        },
        validationSchema: inntektsValideringSchema('søker'),
        validateOnChange: hasSubmitted,
    });

    const save = (values: FormData) =>
        dispatch(
            søknadSlice.actions.inntektUpdated({
                harForventetInntekt: values.harForventetInntekt,
                forventetInntekt: values.forventetInntekt,
                mottarPensjon: values.mottarPensjon,
                pensjonsInntekt: values.pensjonsInntekt,
                andreYtelserINav: values.andreYtelserINav,
                andreYtelserINavYtelse: values.andreYtelserINavYtelse,
                andreYtelserINavBeløp: values.andreYtelserINavBeløp,
                søktAndreYtelserIkkeBehandlet: values.søktAndreYtelserIkkeBehandlet,
                søktAndreYtelserIkkeBehandletBegrunnelse: values.søktAndreYtelserIkkeBehandletBegrunnelse,
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
            <SøknadSpørsmålsgruppe legend={formatMessage('legend.fremtidigInntekt')}>
                <BooleanRadioGroup
                    name={keyOf<FormData>('harForventetInntekt')}
                    legend={formatMessage('forventerInntekt.label')}
                    description={formatMessage('forventerInntekt.hjelpetekst')}
                    error={formik.errors.harForventetInntekt}
                    value={formik.values.harForventetInntekt}
                    onChange={(val) =>
                        formik.setValues((v) => ({
                            ...v,
                            harForventetInntekt: val,
                            forventetInntekt: null,
                        }))
                    }
                />

                {formik.values.harForventetInntekt && (
                    <TextField
                        id={keyOf<FormData>('forventetInntekt')}
                        error={formik.errors.forventetInntekt}
                        className={sharedStyles.narrow}
                        value={formik.values.forventetInntekt || ''}
                        label={formatMessage('forventerInntekt.beløp')}
                        onChange={formik.handleChange}
                        autoComplete="off"
                        // Dette elementet vises ikke ved sidelast
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                    />
                )}
            </SøknadSpørsmålsgruppe>

            <SøknadSpørsmålsgruppe legend={formatMessage('legend.andreUtbetalingerFraNav')}>
                <BooleanRadioGroup
                    name={keyOf<FormData>('andreYtelserINav')}
                    legend={formatMessage('andreYtelserINAV.label')}
                    error={formik.errors.andreYtelserINav}
                    value={formik.values.andreYtelserINav}
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
                    <>
                        <TextField
                            id={keyOf<FormData>('andreYtelserINavYtelse')}
                            name={keyOf<FormData>('andreYtelserINavYtelse')}
                            className={sharedStyles.narrow}
                            label={formatMessage('andreYtelserINAV.ytelse')}
                            value={formik.values.andreYtelserINavYtelse || ''}
                            onChange={formik.handleChange}
                            error={formik.errors.andreYtelserINavYtelse}
                            autoComplete="off"
                            // Dette elementet vises ikke ved sidelast
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                        />
                        <TextField
                            id={keyOf<FormData>('andreYtelserINavBeløp')}
                            name={keyOf<FormData>('andreYtelserINavBeløp')}
                            className={sharedStyles.narrow}
                            label={formatMessage('andreYtelserINAV.beløp')}
                            value={formik.values.andreYtelserINavBeløp || ''}
                            onChange={formik.handleChange}
                            error={formik.errors.andreYtelserINavBeløp}
                            autoComplete="off"
                        />
                    </>
                )}

                <BooleanRadioGroup
                    name={keyOf<FormData>('søktAndreYtelserIkkeBehandlet')}
                    legend={formatMessage('søktAndreYtelserIkkeBehandlet.label')}
                    error={formik.errors.søktAndreYtelserIkkeBehandlet}
                    description={formatMessage('søktAndreYtelserIkkeBehandlet.hjelpetekst')}
                    value={formik.values.søktAndreYtelserIkkeBehandlet}
                    onChange={(val) =>
                        formik.setValues((v) => ({
                            ...v,
                            søktAndreYtelserIkkeBehandlet: val,
                            søktAndreYtelserIkkeBehandletBegrunnelse: null,
                        }))
                    }
                />

                {formik.values.søktAndreYtelserIkkeBehandlet && (
                    <TextField
                        className={sharedStyles.narrow}
                        id={keyOf<FormData>('søktAndreYtelserIkkeBehandletBegrunnelse')}
                        name={keyOf<FormData>('søktAndreYtelserIkkeBehandletBegrunnelse')}
                        label={formatMessage('søktAndreYtelserIkkeBehandlet.begrunnelse')}
                        value={formik.values.søktAndreYtelserIkkeBehandletBegrunnelse || ''}
                        onChange={formik.handleChange}
                        error={formik.errors.søktAndreYtelserIkkeBehandletBegrunnelse}
                        autoComplete="off"
                        // Dette elementet vises ikke ved sidelast
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                    />
                )}
            </SøknadSpørsmålsgruppe>
            <SøknadSpørsmålsgruppe legend={formatMessage('legend.andreUtbetalinger')}>
                <BooleanRadioGroup
                    name={keyOf<FormData>('harTrygdeytelserIUtlandet')}
                    legend={formatMessage('trygdeytelserIUtlandet.label')}
                    error={formik.errors.harTrygdeytelserIUtlandet}
                    value={formik.values.harTrygdeytelserIUtlandet}
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

                <BooleanRadioGroup
                    name={keyOf<FormData>('mottarPensjon')}
                    legend={formatMessage('mottarPensjon.label')}
                    error={formik.errors.mottarPensjon}
                    value={formik.values.mottarPensjon}
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
            </SøknadSpørsmålsgruppe>
            <Feiloppsummering
                className={sharedStyles.marginBottom}
                tittel={formatMessage('feiloppsummering.title')}
                feil={formikErrorsTilFeiloppsummering(formik.errors)}
                hidden={!formikErrorsHarFeil(formik.errors)}
                ref={feiloppsummeringref}
            />

            <Bunnknapper
                previous={{
                    onClick: () => {
                        save(formik.values);
                        navigate(props.forrigeUrl);
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
