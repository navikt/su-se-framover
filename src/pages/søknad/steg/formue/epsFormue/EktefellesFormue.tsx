import { TextField } from '@navikt/ds-react';
import classNames from 'classnames';
import { useFormik } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { BooleanRadioGroup } from '~/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { focusAfterTimeout } from '~lib/formUtils';
import { useI18n } from '~lib/i18n';
import { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import Bunnknapper from '../../../bunnknapper/Bunnknapper';
import sharedStyles from '../../../steg-shared.module.less';
import sharedI18n from '../../steg-shared-i18n';
import { formueValideringSchema } from '../formueSøknadUtils';
import KjøretøyInputFelter from '../KjøretøyInputFelter';

import messages from './ektefellesformue-nb';

type FormData = SøknadState['formue'];

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
        validationSchema: formueValideringSchema('eps'),
        validateOnChange: hasSubmitted,
    });

    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

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
                <BooleanRadioGroup
                    name="eierBolig"
                    className={sharedStyles.sporsmal}
                    legend={formatMessage('eierBolig.label')}
                    error={formik.errors.eierBolig}
                    value={formik.values.eierBolig}
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
                    <BooleanRadioGroup
                        name="borIBolig"
                        className={sharedStyles.sporsmal}
                        legend={formatMessage('eierBolig.borIBolig')}
                        error={formik.errors.borIBolig}
                        value={formik.values.borIBolig}
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
                        <TextField
                            id="verdiPåBolig"
                            name="verdiPåBolig"
                            label={formatMessage('eierBolig.formuePåBolig')}
                            value={formik.values.verdiPåBolig || ''}
                            error={formik.errors.verdiPåBolig}
                            onChange={formik.handleChange}
                        />
                        <TextField
                            id="boligBrukesTil"
                            name="boligBrukesTil"
                            label={formatMessage('eierBolig.boligBrukesTil')}
                            value={formik.values.boligBrukesTil || ''}
                            error={formik.errors.boligBrukesTil}
                            onChange={formik.handleChange}
                        />
                    </div>
                )}

                {formik.values.eierBolig === false && (
                    <BooleanRadioGroup
                        name="depositumskonto"
                        className={sharedStyles.sporsmal}
                        legend={formatMessage('depositum.label')}
                        error={formik.errors.harDepositumskonto}
                        value={formik.values.harDepositumskonto}
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
                        <TextField
                            id="depositumsBeløp"
                            name="depositumsBeløp"
                            label={formatMessage('depositum.beløp')}
                            value={formik.values.depositumsBeløp || ''}
                            error={formik.errors.depositumsBeløp}
                            onChange={formik.handleChange}
                        />
                        <TextField
                            id="kontonummer"
                            name="kontonummer"
                            label={formatMessage('depositum.kontonummer')}
                            value={formik.values.kontonummer || ''}
                            error={formik.errors.kontonummer}
                            onChange={formik.handleChange}
                        />
                    </div>
                )}

                {formik.values.eierBolig && (
                    <BooleanRadioGroup
                        name="eierMerEnnEnBolig"
                        className={sharedStyles.sporsmal}
                        legend={formatMessage('eiendom.eierAndreEiendommer')}
                        error={formik.errors.eierMerEnnEnBolig}
                        value={formik.values.eierMerEnnEnBolig}
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
                        <TextField
                            id="verdiPåEiendom"
                            name="verdiPåEiendom"
                            label={formatMessage('eiendom.samledeVerdi')}
                            value={formik.values.verdiPåEiendom || ''}
                            error={formik.errors.verdiPåEiendom}
                            onChange={formik.handleChange}
                        />
                        <TextField
                            id="eiendomBrukesTil"
                            name="eiendomBrukesTil"
                            label={formatMessage('eiendom.brukesTil')}
                            value={formik.values.eiendomBrukesTil || ''}
                            error={formik.errors.eiendomBrukesTil}
                            onChange={formik.handleChange}
                        />
                    </div>
                )}

                <BooleanRadioGroup
                    name="eierKjøretøy"
                    className={sharedStyles.sporsmal}
                    legend={formatMessage('kjøretøy.label')}
                    error={formik.errors.eierKjøretøy}
                    value={formik.values.eierKjøretøy}
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

                <BooleanRadioGroup
                    name="harInnskuddPåKonto"
                    className={sharedStyles.sporsmal}
                    legend={
                        formik.values.harDepositumskonto
                            ? formatMessage('innskudd.pengerPåKontoInkludertDepositum')
                            : formatMessage('innskudd.label')
                    }
                    error={formik.errors.harInnskuddPåKonto}
                    value={formik.values.harInnskuddPåKonto}
                    onChange={(e) =>
                        formik.setValues({
                            ...formik.values,
                            harInnskuddPåKonto: e,
                            innskuddsBeløp: null,
                        })
                    }
                />

                {formik.values.harInnskuddPåKonto && (
                    <TextField
                        className={classNames(sharedStyles.marginBottom, sharedStyles.narrow)}
                        id="innskuddsBeløp"
                        name="innskuddsBeløp"
                        label={formatMessage('innskudd.beløp')}
                        value={formik.values.innskuddsBeløp || ''}
                        error={formik.errors.innskuddsBeløp}
                        onChange={formik.handleChange}
                    />
                )}

                <BooleanRadioGroup
                    name="harVerdipapir"
                    className={sharedStyles.sporsmal}
                    legend={formatMessage('verdipapir.label')}
                    error={formik.errors.harVerdipapir}
                    value={formik.values.harVerdipapir}
                    onChange={(e) =>
                        formik.setValues({
                            ...formik.values,
                            harVerdipapir: e,
                            verdipapirBeløp: null,
                        })
                    }
                />

                {formik.values.harVerdipapir && (
                    <TextField
                        className={classNames(sharedStyles.marginBottom, sharedStyles.narrow)}
                        id="verdipapirBeløp"
                        name="verdipapirBeløp"
                        label={formatMessage('verdipapir.beløp')}
                        value={formik.values.verdipapirBeløp || ''}
                        error={formik.errors.verdipapirBeløp}
                        onChange={formik.handleChange}
                    />
                )}

                <BooleanRadioGroup
                    name="skylderNoenMegPenger"
                    className={sharedStyles.sporsmal}
                    legend={formatMessage('skylderNoenMegPenger.label')}
                    error={formik.errors.skylderNoenMegPenger}
                    value={formik.values.skylderNoenMegPenger}
                    onChange={(e) =>
                        formik.setValues({
                            ...formik.values,
                            skylderNoenMegPenger: e,
                            skylderNoenMegPengerBeløp: null,
                        })
                    }
                />

                {formik.values.skylderNoenMegPenger && (
                    <TextField
                        className={classNames(sharedStyles.marginBottom, sharedStyles.narrow)}
                        id="skylderNoenMegPengerBeløp"
                        name="skylderNoenMegPengerBeløp"
                        label={formatMessage('skylderNoenMegPenger.beløp')}
                        value={formik.values.skylderNoenMegPengerBeløp || ''}
                        error={formik.errors.skylderNoenMegPengerBeløp}
                        onChange={formik.handleChange}
                    />
                )}

                <BooleanRadioGroup
                    name="harKontanter"
                    className={sharedStyles.sporsmal}
                    legend={formatMessage('harKontanter.label')}
                    error={formik.errors.harKontanter}
                    value={formik.values.harKontanter}
                    onChange={(e) =>
                        formik.setValues({
                            ...formik.values,
                            harKontanter: e,
                            kontanterBeløp: null,
                        })
                    }
                />

                {formik.values.harKontanter && (
                    <TextField
                        className={classNames(sharedStyles.marginBottom, sharedStyles.narrow)}
                        id="kontanterBeløp"
                        name="kontanterBeløp"
                        label={formatMessage('harKontanter.beløp')}
                        value={formik.values.kontanterBeløp || ''}
                        error={formik.errors.kontanterBeløp}
                        onChange={formik.handleChange}
                    />
                )}
            </div>
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
                        history.push(props.forrigeUrl);
                    },
                }}
                avbryt={{ toRoute: props.avbrytUrl }}
            />
        </form>
    );
};

export default EktefellesFormue;
