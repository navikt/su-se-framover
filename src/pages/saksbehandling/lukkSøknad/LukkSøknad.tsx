import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeSuksess, AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Fareknapp } from 'nav-frontend-knapper';
import { Select } from 'nav-frontend-skjema';
import React, { useState } from 'react';

import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppSelector } from '~redux/Store';
import { Sak } from '~types/Sak';
import { LukkSøknadType } from '~types/Søknad';

import Avvist from './Avvist';
import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';
import {
    lukkSøknadInitialValues,
    LukkSøknadValidationSchema,
    dispatchLukkSøknad,
    LukkSøknadFormData,
} from './lukkSøknadUtils';
import Trukket from './Trukket';

const LukkSøknad = (props: { sak: Sak }) => {
    const { søknadLukketStatus, lukketSøknadBrevutkastStatus } = useAppSelector((s) => s.sak);
    const urlParams = Routes.useRouteParams<typeof Routes.avsluttSøknadsbehandling>();
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const søknad = props.sak.søknader.find((s) => s.id === urlParams.soknadId);
    const intl = useI18n({ messages: nb });

    const formik = useFormik<LukkSøknadFormData>({
        initialValues: lukkSøknadInitialValues,
        async onSubmit(values) {
            if (!values.lukkSøknadType) {
                return;
            }
            dispatchLukkSøknad(values, urlParams.soknadId);
        },
        validationSchema: LukkSøknadValidationSchema,
        validateOnChange: hasSubmitted,
    });

    if (RemoteData.isSuccess(søknadLukketStatus) || søknad?.lukket !== null) {
        return (
            <div>
                <AlertStripeSuksess>Søknaden har blitt lukket</AlertStripeSuksess>
            </div>
        );
    }

    return (
        <form
            onSubmit={(e) => {
                setHasSubmitted(true);
                formik.handleSubmit(e);
            }}
        >
            <div>
                <p>
                    {intl.formatMessage({ id: 'display.sakId' })} {urlParams.sakId}
                </p>
                <p>
                    {intl.formatMessage({ id: 'display.søknadId' })} {urlParams.soknadId}
                </p>
            </div>
            <div className={styles.selectContainer}>
                <Select
                    label={intl.formatMessage({ id: 'display.begrunnelseForLukking' })}
                    name={'lukkSøknadType'}
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
                    feil={formik.errors.lukkSøknadType}
                >
                    <option value="velgBegrunnelse">
                        {intl.formatMessage({ id: 'display.selector.velgBegrunnelse' })}
                    </option>
                    {Object.values(LukkSøknadType).map((begrunnelse) => (
                        <option value={begrunnelse} key={begrunnelse}>
                            {begrunnelse}
                        </option>
                    ))}
                </Select>
            </div>

            {formik.values.lukkSøknadType === LukkSøknadType.Trukket && (
                <Trukket
                    søknad={søknad}
                    values={formik.values}
                    errors={formik.errors}
                    handleChange={formik.handleChange}
                    setValues={formik.setValues}
                />
            )}

            {formik.values.lukkSøknadType === LukkSøknadType.Bortfalt && (
                <div className={styles.buttonsContainer}>
                    <Fareknapp spinner={RemoteData.isPending(lukketSøknadBrevutkastStatus)}>
                        {intl.formatMessage({ id: 'knapp.lukkSøknad' })}
                    </Fareknapp>
                </div>
            )}

            {formik.values.lukkSøknadType === LukkSøknadType.Avvist && (
                <Avvist
                    values={formik.values}
                    errors={formik.errors}
                    handleChange={formik.handleChange}
                    setValues={formik.setValues}
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
