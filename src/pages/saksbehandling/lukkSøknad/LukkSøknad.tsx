import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeSuksess, AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Fareknapp } from 'nav-frontend-knapper';
import { Select } from 'nav-frontend-skjema';
import React, { useState } from 'react';

import { lukkSøknad } from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Sak } from '~types/Sak';
import { LukkSøknadBegrunnelse } from '~types/Søknad';

import Avvist from './Avvist';
import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';
import {
    lukkSøknadInitialValues,
    LukkSøknadValidationSchema,
    LukkSøknadFormData,
    lukkSøknadBegrunnelseI18nId,
} from './lukkSøknadUtils';
import Trukket from './Trukket';

const LukkSøknad = (props: { sak: Sak }) => {
    const dispatch = useAppDispatch();
    const { søknadLukketStatus, lukketSøknadBrevutkastStatus } = useAppSelector((s) => s.sak);
    const urlParams = Routes.useRouteParams<typeof Routes.avsluttSøknadsbehandling>();
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const søknad = props.sak.søknader.find((s) => s.id === urlParams.soknadId);
    const intl = useI18n({ messages: nb });

    const formik = useFormik<LukkSøknadFormData>({
        initialValues: lukkSøknadInitialValues,
        async onSubmit(values) {
            if (!values.lukkSøknadBegrunnelse) {
                return;
            }
            if (values.lukkSøknadBegrunnelse === LukkSøknadBegrunnelse.Trukket && values.datoSøkerTrakkSøknad) {
                dispatch(
                    lukkSøknad({
                        søknadId: urlParams.soknadId,
                        body: {
                            type: values.lukkSøknadBegrunnelse,
                            datoSøkerTrakkSøknad: values.datoSøkerTrakkSøknad,
                        },
                    })
                );
            } else if (values.lukkSøknadBegrunnelse === LukkSøknadBegrunnelse.Bortfalt) {
                dispatch(
                    lukkSøknad({
                        søknadId: urlParams.soknadId,
                        body: {
                            type: values.lukkSøknadBegrunnelse,
                        },
                    })
                );
            } else if (values.lukkSøknadBegrunnelse === LukkSøknadBegrunnelse.Avvist) {
                dispatch(
                    lukkSøknad({
                        søknadId: urlParams.soknadId,
                        body: {
                            type: values.lukkSøknadBegrunnelse,
                            brevConfig: values.typeBrev
                                ? {
                                      brevtype: values.typeBrev,
                                      fritekst: values.fritekst,
                                  }
                                : null,
                        },
                    })
                );
            }
        },
        validationSchema: LukkSøknadValidationSchema,
        validateOnChange: hasSubmitted,
    });

    if (!søknad) {
        return (
            <div>
                <AlertStripeFeil>
                    {intl.formatMessage({ id: 'display.søknad.fantIkkeSøknad' })} {urlParams.soknadId}
                </AlertStripeFeil>
            </div>
        );
    }

    if (RemoteData.isSuccess(søknadLukketStatus) || søknad.lukket !== null) {
        return (
            <div>
                <AlertStripeSuksess>{intl.formatMessage({ id: 'display.søknad.harBlittLukket' })}</AlertStripeSuksess>
            </div>
        );
    }

    return (
        <form
            onSubmit={(e) => {
                setHasSubmitted(true);
                formik.handleSubmit(e);
            }}
            className={styles.formContainer}
        >
            <div>
                <p>
                    {intl.formatMessage({ id: 'display.saksnummer' })} {props.sak.saksnummer}
                </p>
                <p>
                    {intl.formatMessage({ id: 'display.søknadId' })} {urlParams.soknadId}
                </p>
            </div>
            <div className={styles.selectContainer}>
                <Select
                    label={intl.formatMessage({ id: 'display.begrunnelseForLukking' })}
                    name={'lukkSøknadBegrunnelse'}
                    onChange={(e) => {
                        formik.setValues({
                            ...formik.values,
                            datoSøkerTrakkSøknad: null,
                            sendBrevForAvvist: null,
                            typeBrev: null,
                            fritekst: null,
                        });
                        formik.handleChange(e);
                    }}
                    feil={formik.errors.lukkSøknadBegrunnelse}
                >
                    <option value="velgBegrunnelse">
                        {intl.formatMessage({ id: 'display.selector.velgBegrunnelse' })}
                    </option>
                    {Object.values(LukkSøknadBegrunnelse).map((begrunnelse) => (
                        <option value={begrunnelse} key={begrunnelse}>
                            {intl.formatMessage({ id: lukkSøknadBegrunnelseI18nId(begrunnelse) })}
                        </option>
                    ))}
                </Select>
            </div>

            {formik.values.lukkSøknadBegrunnelse === LukkSøknadBegrunnelse.Trukket && (
                <Trukket
                    datoSøkerTrakkSøknad={formik.values.datoSøkerTrakkSøknad}
                    søknadId={søknad.id}
                    søknadOpprettet={søknad.opprettet}
                    feilmelding={formik.errors.datoSøkerTrakkSøknad}
                    lukkSøknadBegrunnelse={formik.values.lukkSøknadBegrunnelse}
                    lukketSøknadBrevutkastStatus={lukketSøknadBrevutkastStatus}
                    onDatoSøkerTrakkSøknadChange={(val) =>
                        formik.setValues((values) => ({ ...values, datoSøkerTrakkSøknad: val }))
                    }
                    søknadLukketStatus={søknadLukketStatus}
                />
            )}

            {formik.values.lukkSøknadBegrunnelse === LukkSøknadBegrunnelse.Bortfalt && (
                <div className={styles.buttonsContainer}>
                    <Fareknapp spinner={RemoteData.isPending(søknadLukketStatus)}>
                        {intl.formatMessage({ id: 'knapp.lukkSøknad' })}
                    </Fareknapp>
                </div>
            )}

            {formik.values.lukkSøknadBegrunnelse === LukkSøknadBegrunnelse.Avvist && (
                <Avvist
                    søknadId={søknad.id}
                    lukkSøknadBegrunnelse={formik.values.lukkSøknadBegrunnelse}
                    avvistFormData={{
                        sendBrevForAvvist: formik.values.sendBrevForAvvist,
                        typeBrev: formik.values.typeBrev,
                        fritekst: formik.values.fritekst,
                    }}
                    feilmeldinger={{
                        sendBrevForAvvist: formik.errors.sendBrevForAvvist,
                        typeBrev: formik.errors.typeBrev,
                        fritekst: formik.errors.fritekst,
                    }}
                    onValueChange={(val) =>
                        formik.setValues((values) => ({
                            ...values,
                            sendBrevForAvvist: val.sendBrevForAvvist,
                            typeBrev: val.typeBrev,
                            fritekst: val.fritekst,
                        }))
                    }
                    søknadLukketStatus={søknadLukketStatus}
                    lukketSøknadBrevutkastStatus={lukketSøknadBrevutkastStatus}
                />
            )}

            <div>
                {RemoteData.isFailure(lukketSøknadBrevutkastStatus) && (
                    <AlertStripeFeil>{intl.formatMessage({ id: 'display.brev.kunneIkkeViseBrev' })}</AlertStripeFeil>
                )}

                {RemoteData.isFailure(søknadLukketStatus) && (
                    <AlertStripeFeil>
                        {intl.formatMessage({ id: 'display.søknad.KunneIkkeLukkeSøknad' })}
                    </AlertStripeFeil>
                )}
            </div>
        </form>
    );
};

export default LukkSøknad;
