import { TextField } from '@navikt/ds-react';
import { useFormik } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { BooleanRadioGroup } from '~/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import SøknadSpørsmålsgruppe from '~features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { focusAfterTimeout } from '~lib/formUtils';
import { useI18n } from '~lib/i18n';
import { keyOf } from '~lib/types';
import { formikErrorsTilFeiloppsummering, formikErrorsHarFeil } from '~lib/validering';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import Bunnknapper from '../../../bunnknapper/Bunnknapper';
import sharedStyles from '../../../steg-shared.module.less';
import sharedI18n from '../../steg-shared-i18n';
import { formueValideringSchema } from '../formueSøknadUtils';
import KjøretøyInputFelter from '../KjøretøyInputFelter';

import messages from './dinformue-nb';

type FormData = SøknadState['formue'];

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
        validationSchema: formueValideringSchema('søker'),
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
            <SøknadSpørsmålsgruppe legend={formatMessage('legend.eiendom')}>
                <BooleanRadioGroup
                    name={keyOf<FormData>('eierBolig')}
                    legend={formatMessage('eierBolig.label')}
                    error={formik.errors.eierBolig}
                    value={formik.values.eierBolig}
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
                    <BooleanRadioGroup
                        name={keyOf<FormData>('borIBolig')}
                        legend={formatMessage('eierBolig.borIBolig')}
                        error={formik.errors.borIBolig}
                        value={formik.values.borIBolig}
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
                    <>
                        <TextField
                            id={keyOf<FormData>('verdiPåBolig')}
                            name={keyOf<FormData>('verdiPåBolig')}
                            className={sharedStyles.narrow}
                            label={formatMessage('eierBolig.formuePåBolig')}
                            value={formik.values.verdiPåBolig || ''}
                            error={formik.errors.verdiPåBolig}
                            onChange={formik.handleChange}
                            autoComplete="off"
                            // Dette elementet vises ikke ved sidelast
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                        />
                        <TextField
                            id={keyOf<FormData>('boligBrukesTil')}
                            name={keyOf<FormData>('boligBrukesTil')}
                            className={sharedStyles.narrow}
                            label={formatMessage('eierBolig.boligBrukesTil')}
                            value={formik.values.boligBrukesTil || ''}
                            error={formik.errors.boligBrukesTil}
                            onChange={formik.handleChange}
                            autoComplete="off"
                        />
                    </>
                )}

                {formik.values.eierBolig === false && (
                    <BooleanRadioGroup
                        name={keyOf<FormData>('harDepositumskonto')}
                        legend={formatMessage('depositum.label')}
                        error={formik.errors.harDepositumskonto}
                        value={formik.values.harDepositumskonto}
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
                    <>
                        <TextField
                            id={keyOf<FormData>('depositumsBeløp')}
                            name="depositumsBeløp"
                            className={sharedStyles.narrow}
                            label={formatMessage('depositum.beløp')}
                            value={formik.values.depositumsBeløp || ''}
                            error={formik.errors.depositumsBeløp}
                            onChange={formik.handleChange}
                            autoComplete="off"
                            // Dette elementet vises ikke ved sidelast
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                        />
                        <TextField
                            id={keyOf<FormData>('kontonummer')}
                            name={keyOf<FormData>('kontonummer')}
                            className={sharedStyles.narrow}
                            label={formatMessage('depositum.kontonummer')}
                            value={formik.values.kontonummer || ''}
                            error={formik.errors.kontonummer}
                            onChange={formik.handleChange}
                            autoComplete="off"
                        />
                    </>
                )}

                {formik.values.eierBolig && (
                    <BooleanRadioGroup
                        name={keyOf<FormData>('eierMerEnnEnBolig')}
                        legend={formatMessage('eiendom.eierAndreEiendommer')}
                        error={formik.errors.eierMerEnnEnBolig}
                        value={formik.values.eierMerEnnEnBolig}
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
                    <>
                        <TextField
                            id={keyOf<FormData>('verdiPåEiendom')}
                            name={keyOf<FormData>('verdiPåEiendom')}
                            className={sharedStyles.narrow}
                            label={formatMessage('eiendom.samledeVerdi')}
                            value={formik.values.verdiPåEiendom || ''}
                            error={formik.errors.verdiPåEiendom}
                            onChange={formik.handleChange}
                            autoComplete="off"
                            // Dette elementet vises ikke ved sidelast
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                        />
                        <TextField
                            id={keyOf<FormData>('eiendomBrukesTil')}
                            name={keyOf<FormData>('eiendomBrukesTil')}
                            className={sharedStyles.narrow}
                            label={formatMessage('eiendom.brukesTil')}
                            value={formik.values.eiendomBrukesTil || ''}
                            error={formik.errors.eiendomBrukesTil}
                            onChange={formik.handleChange}
                            autoComplete="off"
                        />
                    </>
                )}
            </SøknadSpørsmålsgruppe>
            <SøknadSpørsmålsgruppe legend={formatMessage('legend.kjøretøy')}>
                <BooleanRadioGroup
                    name={keyOf<FormData>('eierKjøretøy')}
                    legend={formatMessage('kjøretøy.label')}
                    error={formik.errors.eierKjøretøy}
                    value={formik.values.eierKjøretøy}
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
            </SøknadSpørsmålsgruppe>
            <SøknadSpørsmålsgruppe legend={formatMessage('legend.verdi')}>
                <BooleanRadioGroup
                    name={keyOf<FormData>('harInnskuddPåKonto')}
                    legend={
                        formik.values.harDepositumskonto
                            ? formatMessage('innskudd.pengerPåKontoInkludertDepositum')
                            : formatMessage('innskudd.label')
                    }
                    error={formik.errors.harInnskuddPåKonto}
                    value={formik.values.harInnskuddPåKonto}
                    onChange={(e) =>
                        formik.setValues((v) => ({
                            ...v,
                            harInnskuddPåKonto: e,
                            innskuddsBeløp: null,
                        }))
                    }
                />

                {formik.values.harInnskuddPåKonto && (
                    <TextField
                        className={sharedStyles.narrow}
                        id={keyOf<FormData>('innskuddsBeløp')}
                        name={keyOf<FormData>('innskuddsBeløp')}
                        label={formatMessage('innskudd.beløp')}
                        error={formik.errors.innskuddsBeløp}
                        value={formik.values.innskuddsBeløp || ''}
                        onChange={formik.handleChange}
                        // Dette elementet vises ikke ved sidelast
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                    />
                )}

                <BooleanRadioGroup
                    name={keyOf<FormData>('harVerdipapir')}
                    legend={formatMessage('verdipapir.label')}
                    error={formik.errors.harVerdipapir}
                    value={formik.values.harVerdipapir}
                    onChange={(e) =>
                        formik.setValues((v) => ({
                            ...v,
                            harVerdipapir: e,
                            verdipapirBeløp: null,
                        }))
                    }
                />

                {formik.values.harVerdipapir && (
                    <TextField
                        className={sharedStyles.narrow}
                        id={keyOf<FormData>('verdipapirBeløp')}
                        name={keyOf<FormData>('verdipapirBeløp')}
                        label={formatMessage('verdipapir.beløp')}
                        value={formik.values.verdipapirBeløp || ''}
                        error={formik.errors.verdipapirBeløp}
                        onChange={formik.handleChange}
                        autoComplete="off"
                        // Dette elementet vises ikke ved sidelast
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                    />
                )}

                <BooleanRadioGroup
                    name={keyOf<FormData>('skylderNoenMegPenger')}
                    legend={formatMessage('skylderNoenMegPenger.label')}
                    error={formik.errors.skylderNoenMegPenger}
                    value={formik.values.skylderNoenMegPenger}
                    onChange={(e) =>
                        formik.setValues((v) => ({
                            ...v,
                            skylderNoenMegPenger: e,
                            skylderNoenMegPengerBeløp: null,
                        }))
                    }
                />

                {formik.values.skylderNoenMegPenger && (
                    <TextField
                        className={sharedStyles.narrow}
                        id={keyOf<FormData>('skylderNoenMegPengerBeløp')}
                        name={keyOf<FormData>('skylderNoenMegPengerBeløp')}
                        label={formatMessage('skylderNoenMegPenger.beløp')}
                        value={formik.values.skylderNoenMegPengerBeløp || ''}
                        error={formik.errors.skylderNoenMegPengerBeløp}
                        onChange={formik.handleChange}
                        autoComplete="off"
                        // Dette elementet vises ikke ved sidelast
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                    />
                )}

                <BooleanRadioGroup
                    name={keyOf<FormData>('harKontanter')}
                    legend={formatMessage('harKontanter.label')}
                    error={formik.errors.harKontanter}
                    value={formik.values.harKontanter}
                    onChange={(e) =>
                        formik.setValues((v) => ({
                            ...v,
                            harKontanter: e,
                            kontanterBeløp: null,
                        }))
                    }
                />

                {formik.values.harKontanter && (
                    <TextField
                        className={sharedStyles.narrow}
                        id={keyOf<FormData>('kontanterBeløp')}
                        name={keyOf<FormData>('kontanterBeløp')}
                        label={formatMessage('harKontanter.beløp')}
                        value={formik.values.kontanterBeløp || ''}
                        error={formik.errors.kontanterBeløp}
                        onChange={formik.handleChange}
                        autoComplete="off"
                        // Dette elementet vises ikke ved sidelast
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
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

export default DinFormue;
