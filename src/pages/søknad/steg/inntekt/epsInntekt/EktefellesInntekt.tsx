import { TextField } from '@navikt/ds-react';
import { useFormik } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~src/features/søknad/søknad.slice';
import SøknadSpørsmålsgruppe from '~src/features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { useI18n } from '~src/lib/i18n';
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

const EktefellesInntekt = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const ektefelle = useAppSelector((s) => s.soknad.ektefelle);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const formik = useFormik<FormData>({
        initialValues: ektefelle.inntekt,
        onSubmit: (values) => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: inntektsValideringSchema('eps'),
        validateOnChange: hasSubmitted,
    });

    const save = (values: FormData) =>
        dispatch(søknadSlice.actions.ektefelleUpdated({ ...ektefelle, inntekt: values }));

    return (
        <div className={sharedStyles.container}>
            <form
                onSubmit={(e) => {
                    setHasSubmitted(true);
                    formik.handleSubmit(e);
                }}
            >
                <SøknadSpørsmålsgruppe legend={formatMessage('legend.fremtidigInntekt')}>
                    <BooleanRadioGroup
                        name="harForventetInntekt"
                        legend={formatMessage('forventerInntekt.label')}
                        error={formik.errors.harForventetInntekt}
                        value={formik.values.harForventetInntekt}
                        description={formatMessage('forventerInntekt.hjelpetekst')}
                        onChange={(val) =>
                            formik.setValues({
                                ...formik.values,
                                harForventetInntekt: val,
                                forventetInntekt: null,
                            })
                        }
                    />

                    {formik.values.harForventetInntekt && (
                        <TextField
                            id="forventetInntekt"
                            error={formik.errors.forventetInntekt}
                            className={sharedStyles.narrow}
                            value={formik.values.forventetInntekt || ''}
                            label={formatMessage('forventerInntekt.beløp')}
                            onChange={formik.handleChange}
                        />
                    )}
                </SøknadSpørsmålsgruppe>

                <SøknadSpørsmålsgruppe legend={formatMessage('legend.andreUtbetalingerFraNav')}>
                    <BooleanRadioGroup
                        name="andreYtelserINAV"
                        legend={formatMessage('andreYtelserINAV.label')}
                        error={formik.errors.andreYtelserINav}
                        value={formik.values.andreYtelserINav}
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
                        <>
                            <TextField
                                id="andreYtelserINavYtelse"
                                name="andreYtelserINavYtelse"
                                className={sharedStyles.narrow}
                                label={formatMessage('andreYtelserINAV.ytelse')}
                                value={formik.values.andreYtelserINavYtelse || ''}
                                onChange={formik.handleChange}
                                error={formik.errors.andreYtelserINavYtelse}
                            />
                            <TextField
                                id="andreYtelserINavBeløp"
                                name="andreYtelserINavBeløp"
                                className={sharedStyles.narrow}
                                label={formatMessage('andreYtelserINAV.beløp')}
                                value={formik.values.andreYtelserINavBeløp || ''}
                                onChange={formik.handleChange}
                                error={formik.errors.andreYtelserINavBeløp}
                            />
                        </>
                    )}

                    <BooleanRadioGroup
                        name="søktAndreYtelserIkkeBehandlet"
                        legend={formatMessage('søktAndreYtelserIkkeBehandlet.label')}
                        description={formatMessage('søktAndreYtelserIkkeBehandlet.hjelpetekst')}
                        error={formik.errors.søktAndreYtelserIkkeBehandlet}
                        value={formik.values.søktAndreYtelserIkkeBehandlet}
                        onChange={(val) =>
                            formik.setValues({
                                ...formik.values,
                                søktAndreYtelserIkkeBehandlet: val,
                                søktAndreYtelserIkkeBehandletBegrunnelse: null,
                            })
                        }
                    />

                    {formik.values.søktAndreYtelserIkkeBehandlet && (
                        <TextField
                            className={sharedStyles.narrow}
                            id="søktAndreYtelserIkkeBehandletBegrunnelse"
                            name="søktAndreYtelserIkkeBehandletBegrunnelse"
                            label={formatMessage('søktAndreYtelserIkkeBehandlet.begrunnelse')}
                            value={formik.values.søktAndreYtelserIkkeBehandletBegrunnelse || ''}
                            onChange={formik.handleChange}
                            error={formik.errors.søktAndreYtelserIkkeBehandletBegrunnelse}
                        />
                    )}
                </SøknadSpørsmålsgruppe>
                <SøknadSpørsmålsgruppe legend={formatMessage('legend.andreUtbetalinger')}>
                    <BooleanRadioGroup
                        name="trygdeytelserIUtlandet"
                        legend={formatMessage('trygdeytelserIUtlandet.label')}
                        error={formik.errors.harTrygdeytelserIUtlandet}
                        value={formik.values.harTrygdeytelserIUtlandet}
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

                    <BooleanRadioGroup
                        name="mottarPensjon"
                        legend={formatMessage('mottarPensjon.label')}
                        error={formik.errors.mottarPensjon}
                        value={formik.values.mottarPensjon}
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
    );
};

export default EktefellesInntekt;
