import * as RemoteData from '@devexperts/remote-data-ts';
import classNames from 'classnames';
import { useFormik } from 'formik';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Fareknapp } from 'nav-frontend-knapper';
import Lenke from 'nav-frontend-lenker';
import { Select } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { LukkSøknadBodyTypes } from '~api/søknadApi';
import { lukkSøknad } from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Sak } from '~types/Sak';
import { LukkSøknadBegrunnelse, Søknad, Søknadstype } from '~types/Søknad';

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
    const history = useHistory();

    const formik = useFormik<LukkSøknadFormData>({
        initialValues: lukkSøknadInitialValues,
        async onSubmit(values) {
            if (!values.lukkSøknadBegrunnelse) {
                return;
            }
            const response = await dispatch(
                lukkSøknad({
                    søknadId: urlParams.soknadId,
                    body: lagBody(values),
                })
            );

            if (lukkSøknad.fulfilled.match(response)) {
                const message = intl.formatMessage({ id: 'display.søknad.harBlittLukket' });
                history.push(Routes.createSakIntroLocation(message, props.sak.id));
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
                    søknadOpprettet={hentOpprettetDatoFraSøknad(søknad)}
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
                <div className={classNames(styles.bortfaltContainer, styles.buttonsContainer)}>
                    <Fareknapp spinner={RemoteData.isPending(søknadLukketStatus)}>
                        {intl.formatMessage({ id: 'knapp.lukkSøknad' })}
                    </Fareknapp>
                </div>
            )}

            {formik.values.lukkSøknadBegrunnelse === LukkSøknadBegrunnelse.Avvist && (
                <Avvist
                    søknadId={søknad.id}
                    validateForm={() => formik.validateForm()}
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
            <div className={styles.tilbakeKnappContainer}>
                <Lenke href={Routes.saksoversiktValgtSak.createURL({ sakId: urlParams.sakId })} className="knapp">
                    {intl.formatMessage({ id: 'knapp.tilbake' })}
                </Lenke>
            </div>

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

function lagBody(values: LukkSøknadFormData): LukkSøknadBodyTypes {
    switch (values.lukkSøknadBegrunnelse) {
        case LukkSøknadBegrunnelse.Trukket:
            return {
                type: values.lukkSøknadBegrunnelse,
                //Denne har validering
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                datoSøkerTrakkSøknad: values.datoSøkerTrakkSøknad!,
            };

        case LukkSøknadBegrunnelse.Bortfalt:
            return {
                type: values.lukkSøknadBegrunnelse,
            };
        case LukkSøknadBegrunnelse.Avvist:
            return {
                type: values.lukkSøknadBegrunnelse,
                brevConfig: values.typeBrev
                    ? {
                          brevtype: values.typeBrev,
                          fritekst: values.fritekst,
                      }
                    : null,
            };
        default:
            throw new Error('LukkSøknadBegrunnelse har ugyldig verdi');
    }
}

function hentOpprettetDatoFraSøknad(søknad: Søknad) {
    if (søknad.søknadInnhold.forNav.type === Søknadstype.Papirsøknad) {
        return søknad.søknadInnhold.forNav.mottaksdatoForSøknad;
    }
    return søknad.opprettet;
}

export default LukkSøknad;
