import { useFormik } from 'formik';
import { Feiloppsummering, Input } from 'nav-frontend-skjema';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import { useI18n } from '~lib/i18n';
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
                <div className={sharedStyles.formContainer}>
                    <JaNeiSpørsmål
                        id="harForventetInntekt"
                        className={sharedStyles.sporsmal}
                        legend={formatMessage('forventerInntekt.label')}
                        feil={formik.errors.harForventetInntekt}
                        state={formik.values.harForventetInntekt}
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
                        <Input
                            id="forventetInntekt"
                            feil={formik.errors.forventetInntekt}
                            bredde="S"
                            className={sharedStyles.marginBottom}
                            value={formik.values.forventetInntekt || ''}
                            label={formatMessage('forventerInntekt.beløp')}
                            onChange={formik.handleChange}
                        />
                    )}

                    <JaNeiSpørsmål
                        id="andreYtelserINAV"
                        className={sharedStyles.sporsmal}
                        legend={formatMessage('andreYtelserINAV.label')}
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
                                label={formatMessage('andreYtelserINAV.ytelse')}
                                value={formik.values.andreYtelserINavYtelse || ''}
                                onChange={formik.handleChange}
                                feil={formik.errors.andreYtelserINavYtelse}
                            />
                            <Input
                                id="andreYtelserINavBeløp"
                                name="andreYtelserINavBeløp"
                                label={formatMessage('andreYtelserINAV.beløp')}
                                value={formik.values.andreYtelserINavBeløp || ''}
                                onChange={formik.handleChange}
                                feil={formik.errors.andreYtelserINavBeløp}
                            />
                        </div>
                    )}

                    <JaNeiSpørsmål
                        id="søktAndreYtelserIkkeBehandlet"
                        className={sharedStyles.sporsmal}
                        legend={formatMessage('søktAndreYtelserIkkeBehandlet.label')}
                        description={formatMessage('søktAndreYtelserIkkeBehandlet.hjelpetekst')}
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
                            label={formatMessage('søktAndreYtelserIkkeBehandlet.begrunnelse')}
                            value={formik.values.søktAndreYtelserIkkeBehandletBegrunnelse || ''}
                            onChange={formik.handleChange}
                            feil={formik.errors.søktAndreYtelserIkkeBehandletBegrunnelse}
                        />
                    )}

                    <JaNeiSpørsmål
                        id="harMottattSosialstønad"
                        className={sharedStyles.sporsmal}
                        legend={formatMessage('sosialstønad.label')}
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
                        id="trygdeytelserIUtlandet"
                        className={sharedStyles.sporsmal}
                        legend={formatMessage('trygdeytelserIUtlandet.label')}
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
                        legend={formatMessage('mottarPensjon.label')}
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
