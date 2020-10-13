import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeSuksess, AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Fareknapp } from 'nav-frontend-knapper';
import { Select } from 'nav-frontend-skjema';
import React, { useState } from 'react';

import { useUserContext } from '~context/userContext';
import { avsluttSøknadsbehandling } from '~features/søknad/søknad.slice';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

enum AvsluttSøknadsbehandling {
    Trukket = 'Trukket',
}

interface FormData {
    avsluttSøknadsbehandling: AvsluttSøknadsbehandling | null;
}

const validationSchema = yup.object<FormData>({
    avsluttSøknadsbehandling: yup.mixed().oneOf([AvsluttSøknadsbehandling.Trukket]).required(),
});

const AvsluttBehandling = () => {
    const dispatch = useAppDispatch();
    const søknadsbehandlingAvsluttet = useAppSelector((s) => s.soknad.søknadsbehandlingAvsluttetStatus);
    const user = useUserContext();

    const urlParams = Routes.useRouteParams<typeof Routes.avsluttSøknadsbehandling>();

    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

    const formik = useFormik<FormData>({
        initialValues: {
            avsluttSøknadsbehandling: null,
        },
        async onSubmit(values) {
            if (!values.avsluttSøknadsbehandling) {
                return;
            }
            dispatch(
                avsluttSøknadsbehandling({
                    sakId: urlParams.sakId,
                    søknadId: urlParams.soknadId,
                    navIdent: user.navIdent,
                })
            );
        },
        validationSchema: validationSchema,
        validateOnChange: hasSubmitted,
    });

    if (RemoteData.isSuccess(søknadsbehandlingAvsluttet)) {
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
                    name={'avsluttSøknadsbehandling'}
                    onChange={formik.handleChange}
                    feil={formik.errors.avsluttSøknadsbehandling}
                >
                    <option value="velgBegrunnelse">Velg begrunnelse</option>
                    {Object.values(AvsluttSøknadsbehandling).map((begrunnelse) => (
                        <option value={begrunnelse} key={begrunnelse}>
                            {begrunnelse}
                        </option>
                    ))}
                </Select>
            </div>
            <Fareknapp>Avslutt søknadsbehandlingen</Fareknapp>

            {RemoteData.isFailure(søknadsbehandlingAvsluttet) && (
                <AlertStripeFeil>Kunne ikke trekke søknad</AlertStripeFeil>
            )}
        </form>
    );
};

export default AvsluttBehandling;
