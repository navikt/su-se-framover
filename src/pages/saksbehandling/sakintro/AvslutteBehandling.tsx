import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeSuksess, AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Fareknapp } from 'nav-frontend-knapper';
import { Select } from 'nav-frontend-skjema';
import React, { useState } from 'react';

import { useUserContext } from '~context/userContext';
import { trekkSøknad } from '~features/søknad/søknad.slice';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

export enum TrekkSøknadEnum {
    Trukket = 'Trukket',
}

interface FormData {
    trekkSøknad: TrekkSøknadEnum | null;
}

const validationSchema = yup.object<FormData>({
    trekkSøknad: yup.mixed().oneOf([TrekkSøknadEnum.Trukket]).required(),
});

const AvslutteBehandling = () => {
    const dispatch = useAppDispatch();
    const behandlingSlettet = useAppSelector((s) => s.soknad.søknadHarBlittTrukket);
    const user = useUserContext();

    const urlParams = Routes.useRouteParams<typeof Routes.trekkSøknad>();

    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

    if (!urlParams) {
        return <div>404</div>;
    }

    const formik = useFormik<FormData>({
        initialValues: {
            trekkSøknad: null,
        },
        async onSubmit(values) {
            if (!values.trekkSøknad) {
                return;
            }

            dispatch(
                trekkSøknad({
                    sakId: urlParams.sakId,
                    søknadId: urlParams.soknadId,
                    navIdent: user.navIdent,
                })
            );
        },
        validationSchema: validationSchema,
        validateOnChange: hasSubmitted,
    });

    if (RemoteData.isSuccess(behandlingSlettet)) {
        return (
            <div>
                <AlertStripeSuksess>Søknaden har blitt trukket</AlertStripeSuksess>
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
                <p>Sak id: {urlParams.sakId}</p>
                <p>søknad id: {urlParams.soknadId}</p>
            </div>
            <div>
                <Select
                    label={'Begrunnelse for å trekke søknad'}
                    name={'trekkSøknad'}
                    onChange={formik.handleChange}
                    feil={formik.errors.trekkSøknad}
                >
                    <option value="velgBegrunnelse">Velg begrunnelse</option>
                    {Object.values(TrekkSøknadEnum).map((begrunnelse, index) => (
                        <option value={begrunnelse} key={index}>
                            {begrunnelse}
                        </option>
                    ))}
                </Select>
            </div>
            <Fareknapp>Avslutt søknadsbehandlingen</Fareknapp>

            {RemoteData.isFailure(behandlingSlettet) && <AlertStripeFeil>Kunne ikke trekke søknad</AlertStripeFeil>}
        </form>
    );
};

export default AvslutteBehandling;
