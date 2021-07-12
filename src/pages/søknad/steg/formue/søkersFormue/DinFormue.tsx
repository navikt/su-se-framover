import { useFormik } from 'formik';
import { Input, Feiloppsummering } from 'nav-frontend-skjema';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { JaNeiSpørsmål } from '~/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import { useI18n } from '~lib/hooks';
import { keyOf } from '~lib/types';
import { formikErrorsTilFeiloppsummering, formikErrorsHarFeil, formueValideringSchema } from '~lib/validering';
import { useAppSelector, useAppDispatch } from '~redux/Store';

import Bunnknapper from '../../../bunnknapper/Bunnknapper';
import sharedStyles from '../../../steg-shared.module.less';
import sharedI18n from '../../steg-shared-i18n';
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
                    legend={formatMessage('eierBolig.label')}
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
                        legend={formatMessage('eierBolig.borIBolig')}
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
                            label={formatMessage('eierBolig.formuePåBolig')}
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
                            label={formatMessage('eierBolig.boligBrukesTil')}
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
                        legend={formatMessage('depositum.label')}
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
                            label={formatMessage('depositum.beløp')}
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
                            label={formatMessage('depositum.kontonummer')}
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
                        legend={formatMessage('eiendom.eierAndreEiendommer')}
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
                            label={formatMessage('eiendom.samledeVerdi')}
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
                            label={formatMessage('eiendom.brukesTil')}
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
                    legend={formatMessage('kjøretøy.label')}
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
                        formik.values.harDepositumskonto
                            ? formatMessage('innskudd.pengerPåKontoInkludertDepositum')
                            : formatMessage('innskudd.label')
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
                        label={formatMessage('innskudd.beløp')}
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
                    legend={formatMessage('verdipapir.label')}
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
                        label={formatMessage('verdipapir.beløp')}
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
                    legend={formatMessage('skylderNoenMegPenger.label')}
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
                        label={formatMessage('skylderNoenMegPenger.beløp')}
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
                    legend={formatMessage('harKontanter.label')}
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
                        label={formatMessage('harKontanter.beløp')}
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

export default DinFormue;
