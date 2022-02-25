import { yupResolver } from '@hookform/resolvers/yup';
import { TextField } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { BooleanRadioGroup } from '~/components/formElements/FormElements';
import søknadSlice, { Kjøretøy, SøknadState } from '~/features/søknad/søknad.slice';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import SøknadSpørsmålsgruppe from '~features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { focusAfterTimeout } from '~lib/formUtils';
import { useI18n } from '~lib/i18n';
import { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import Bunnknapper from '../../../bunnknapper/Bunnknapper';
import sharedStyles from '../../../steg-shared.module.less';
import sharedI18n from '../../steg-shared-i18n';
import { formueValideringSchema } from '../formueSøknadUtils';
import KjøretøyInputFelter from '../kjøretøyInputfelter/KjøretøyInputFelter';

import messages from './dinformue-nb';

type FormData = SøknadState['formue'];

const DinFormue = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const formueFraStore = useAppSelector((s) => s.soknad.formue);
    const dispatch = useAppDispatch();
    const history = useHistory();

    const form = useForm<FormData>({
        defaultValues: formueFraStore,
        resolver: yupResolver(formueValideringSchema('søker')),
    });

    const [
        eierBolig,
        borIBolig,
        harDepositumskonto,
        eierMerEnnEnBolig,
        harInnskuddPåKonto,
        harVerdipapir,
        skylderNoenMegPenger,
        harKontanter,
        eierKjøretøy,
    ] = form.watch([
        'eierBolig',
        'borIBolig',
        'harDepositumskonto',
        'eierMerEnnEnBolig',
        'harInnskuddPåKonto',
        'harVerdipapir',
        'skylderNoenMegPenger',
        'harKontanter',
        'eierKjøretøy',
    ]);

    const setFieldsToNull = (keys: Array<keyof FormData>) => keys.map((key) => form.setValue(key, null));

    useEffect(() => {
        setFieldsToNull([
            'borIBolig',
            'verdiPåBolig',
            'boligBrukesTil',
            'harDepositumskonto',
            'depositumsBeløp',
            'kontonummer',
        ]);
    }, [eierBolig]);

    useEffect(() => {
        setFieldsToNull(['verdiPåBolig', 'boligBrukesTil']);
    }, [borIBolig]);

    useEffect(() => {
        setFieldsToNull(['depositumsBeløp', 'kontonummer']);
    }, [harDepositumskonto]);

    useEffect(() => {
        setFieldsToNull(['verdiPåEiendom', 'eiendomBrukesTil']);
    }, [eierMerEnnEnBolig]);

    useEffect(() => {
        setFieldsToNull(['innskuddsBeløp']);
    }, [harInnskuddPåKonto]);

    useEffect(() => {
        setFieldsToNull(['verdipapirBeløp']);
    }, [harVerdipapir]);

    useEffect(() => {
        setFieldsToNull(['skylderNoenMegPengerBeløp']);
    }, [skylderNoenMegPenger]);

    useEffect(() => {
        setFieldsToNull(['kontanterBeløp']);
    }, [harKontanter]);

    useEffect(() => {
        form.setValue('kjøretøy', eierKjøretøy ? [{ verdiPåKjøretøy: '', kjøretøyDeEier: '' }] : []);
    }, [eierKjøretøy]);

    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    return (
        <form
            onSubmit={() => {
                form.handleSubmit((values) => {
                    dispatch(søknadSlice.actions.formueUpdated(values));
                    history.push(props.nesteUrl);
                });
                focusAfterTimeout(feiloppsummeringref)();
            }}
            className={sharedStyles.container}
        >
            <SøknadSpørsmålsgruppe legend={formatMessage('legend.eiendom')}>
                <Controller
                    control={form.control}
                    name={'eierBolig'}
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('eierBolig.label')}
                            error={fieldState.error}
                            {...field}
                        />
                    )}
                />

                {eierBolig && (
                    <Controller
                        control={form.control}
                        name={'borIBolig'}
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                legend={formatMessage('eierBolig.borIBolig')}
                                error={fieldState.error}
                                {...field}
                            />
                        )}
                    />
                )}

                {borIBolig === false && (
                    <>
                        <Controller
                            control={form.control}
                            name={'verdiPåBolig'}
                            render={({ field, fieldState }) => (
                                <TextField
                                    id="verdiPåBolig"
                                    className={sharedStyles.narrow}
                                    label={formatMessage('eierBolig.formuePåBolig')}
                                    error={fieldState.error}
                                    {...field}
                                    value={field.value ?? ''}
                                    autoComplete="off"
                                    // Dette elementet vises ikke ved sidelast
                                    // eslint-disable-next-line jsx-a11y/no-autofocus
                                    autoFocus
                                />
                            )}
                        />
                        <Controller
                            control={form.control}
                            name={'boligBrukesTil'}
                            render={({ field, fieldState }) => (
                                <TextField
                                    id="boligBrukesTil"
                                    className={sharedStyles.narrow}
                                    label={formatMessage('eierBolig.boligBrukesTil')}
                                    autoComplete="off"
                                    error={fieldState.error}
                                    {...field}
                                    value={field.value ?? ''}
                                />
                            )}
                        />
                    </>
                )}

                {eierBolig === false && (
                    <Controller
                        control={form.control}
                        name={'harDepositumskonto'}
                        render={({ field, fieldState }) => (
                            <BooleanRadioGroup
                                legend={formatMessage('depositum.label')}
                                error={fieldState.error}
                                {...field}
                            />
                        )}
                    />
                )}

                {harDepositumskonto && (
                    <>
                        <Controller
                            control={form.control}
                            name="depositumsBeløp"
                            render={({ field, fieldState }) => (
                                <TextField
                                    id="depositumsBeløp"
                                    className={sharedStyles.narrow}
                                    label={formatMessage('depositum.beløp')}
                                    error={fieldState.error}
                                    {...field}
                                    value={field.value ?? ''}
                                    autoComplete="off"
                                    // Dette elementet vises ikke ved sidelast
                                    // eslint-disable-next-line jsx-a11y/no-autofocus
                                    autoFocus
                                />
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="kontonummer"
                            render={({ field, fieldState }) => (
                                <TextField
                                    id="kontonummer"
                                    className={sharedStyles.narrow}
                                    label={formatMessage('depositum.kontonummer')}
                                    {...field}
                                    value={field.value ?? ''}
                                    error={fieldState.error}
                                    autoComplete="off"
                                />
                            )}
                        />
                    </>
                )}

                <Controller
                    control={form.control}
                    name="eierMerEnnEnBolig"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('eiendom.eierAndreEiendommer')}
                            error={fieldState.error}
                            {...field}
                        />
                    )}
                />

                {eierMerEnnEnBolig && (
                    <>
                        <Controller
                            control={form.control}
                            name="verdiPåEiendom"
                            render={({ field, fieldState }) => (
                                <TextField
                                    id="verdiPåEiendom"
                                    className={sharedStyles.narrow}
                                    label={formatMessage('eiendom.samledeVerdi')}
                                    error={fieldState.error}
                                    autoComplete="off"
                                    {...field}
                                    value={field.value ?? ''}
                                    // Dette elementet vises ikke ved sidelast
                                    // eslint-disable-next-line jsx-a11y/no-autofocus
                                    autoFocus
                                />
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="eiendomBrukesTil"
                            render={({ field, fieldState }) => (
                                <TextField
                                    id="eiendomBrukesTil"
                                    className={sharedStyles.narrow}
                                    label={formatMessage('eiendom.brukesTil')}
                                    error={fieldState.error}
                                    autoComplete="off"
                                    {...field}
                                    value={field.value ?? ''}
                                />
                            )}
                        />
                    </>
                )}
            </SøknadSpørsmålsgruppe>
            <SøknadSpørsmålsgruppe legend={formatMessage('legend.kjøretøy')}>
                <Controller
                    control={form.control}
                    name="eierKjøretøy"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('kjøretøy.label')}
                            error={fieldState.error}
                            {...field}
                        />
                    )}
                />

                {eierKjøretøy && (
                    <Controller
                        control={form.control}
                        name={'kjøretøy'}
                        render={({ field, fieldState }) => (
                            <KjøretøyInputFelter
                                arr={field.value}
                                errors={fieldState.error}
                                feltnavn={field.name}
                                onLeggTilClick={() =>
                                    field.onChange([
                                        ...field.value,
                                        {
                                            verdiPåKjøretøy: '',
                                            kjøretøyDeEier: '',
                                        },
                                    ])
                                }
                                onFjernClick={(index) =>
                                    field.onChange(field.value.filter((_: Kjøretøy, i: number) => index !== i))
                                }
                                onChange={(val) =>
                                    field.onChange(
                                        field.value.map((input: Kjøretøy, i: number) =>
                                            val.index === i
                                                ? {
                                                      verdiPåKjøretøy: val.verdiPåKjøretøy,
                                                      kjøretøyDeEier: val.kjøretøyDeEier,
                                                  }
                                                : input
                                        )
                                    )
                                }
                            />
                        )}
                    />
                )}
            </SøknadSpørsmålsgruppe>
            <SøknadSpørsmålsgruppe legend={formatMessage('legend.verdi')}>
                <Controller
                    control={form.control}
                    name="harInnskuddPåKonto"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={
                                harDepositumskonto
                                    ? formatMessage('innskudd.pengerPåKontoInkludertDepositum')
                                    : formatMessage('innskudd.label')
                            }
                            error={fieldState.error}
                            {...field}
                        />
                    )}
                />

                {harInnskuddPåKonto && (
                    <Controller
                        control={form.control}
                        name="innskuddsBeløp"
                        render={({ field, fieldState }) => (
                            <TextField
                                className={sharedStyles.narrow}
                                id="innskuddsBeløp"
                                label={formatMessage('innskudd.beløp')}
                                error={fieldState.error}
                                {...field}
                                value={field.value ?? ''}
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                        )}
                    />
                )}

                <Controller
                    control={form.control}
                    name="harVerdipapir"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('verdipapir.label')}
                            error={fieldState.error}
                            {...field}
                        />
                    )}
                />

                {harVerdipapir && (
                    <Controller
                        control={form.control}
                        name="verdipapirBeløp"
                        render={({ field, fieldState }) => (
                            <TextField
                                className={sharedStyles.narrow}
                                id="verdipapirBeløp"
                                label={formatMessage('verdipapir.beløp')}
                                error={fieldState.error}
                                {...field}
                                value={field.value ?? ''}
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                        )}
                    />
                )}

                <Controller
                    control={form.control}
                    name="skylderNoenMegPenger"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('skylderNoenMegPenger.label')}
                            error={fieldState.error}
                            {...field}
                        />
                    )}
                />

                {skylderNoenMegPenger && (
                    <Controller
                        control={form.control}
                        name="skylderNoenMegPengerBeløp"
                        render={({ field, fieldState }) => (
                            <TextField
                                className={sharedStyles.narrow}
                                id="skylderNoenMegPengerBeløp"
                                label={formatMessage('skylderNoenMegPenger.beløp')}
                                {...field}
                                value={field.value ?? ''}
                                error={fieldState.error}
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                        )}
                    />
                )}

                <Controller
                    control={form.control}
                    name="harKontanter"
                    render={({ field, fieldState }) => (
                        <BooleanRadioGroup
                            legend={formatMessage('harKontanter.label')}
                            error={fieldState.error}
                            {...field}
                        />
                    )}
                />

                {harKontanter && (
                    <Controller
                        control={form.control}
                        name="kontanterBeløp"
                        render={({ field, fieldState }) => (
                            <TextField
                                className={sharedStyles.narrow}
                                label={formatMessage('harKontanter.beløp')}
                                error={fieldState.error}
                                {...field}
                                value={field.value ?? ''}
                                autoComplete="off"
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                        )}
                    />
                )}
            </SøknadSpørsmålsgruppe>
            <Feiloppsummering
                className={sharedStyles.marginBottom}
                tittel={formatMessage('feiloppsummering.title')}
                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                ref={feiloppsummeringref}
            />
            <Bunnknapper
                previous={{
                    onClick: () => {
                        dispatch(søknadSlice.actions.formueUpdated(form.getValues()));
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
