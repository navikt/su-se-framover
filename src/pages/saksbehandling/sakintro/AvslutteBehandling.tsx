import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeSuksess, AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Fareknapp } from 'nav-frontend-knapper';
import { Select } from 'nav-frontend-skjema';
import React, { useState } from 'react';

import { avsluttSøknadsBehandling } from '~features/søknad/søknad.slice';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

export enum AvsluttSøknadsBehandlingBegrunnelse {
    Trukket = 'Trukket',
    Bortfalt = 'Bortfalt',
    AvvistSøktForTidlig = 'AvvistSøktForTidlig',
}

interface FormData {
    avsluttSøknadsBehandlingBegrunnelse: AvsluttSøknadsBehandlingBegrunnelse | null;
}

const validationSchema = yup.object<FormData>({
    avsluttSøknadsBehandlingBegrunnelse: yup
        .mixed()
        .oneOf([
            AvsluttSøknadsBehandlingBegrunnelse.Trukket,
            AvsluttSøknadsBehandlingBegrunnelse.Bortfalt,
            AvsluttSøknadsBehandlingBegrunnelse.AvvistSøktForTidlig,
        ])
        .required(),
});

const AvslutteBehandling = () => {
    const dispatch = useAppDispatch();
    const behandlingSlettet = useAppSelector((s) => s.soknad.avsluttetSøknadsBehandling);

    const urlParams = Routes.useRouteParams<typeof Routes.saksoversiktAvsluttBehandling>();

    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

    if (!urlParams) {
        return <div>404</div>;
    }

    const formik = useFormik<FormData>({
        initialValues: {
            avsluttSøknadsBehandlingBegrunnelse: null,
        },
        async onSubmit(values) {
            if (!values.avsluttSøknadsBehandlingBegrunnelse) {
                return;
            }

            dispatch(
                avsluttSøknadsBehandling({
                    sakId: urlParams.sakId,
                    søknadId: urlParams.soknadId,
                    avsluttSøknadsBehandlingBegrunnelse: values.avsluttSøknadsBehandlingBegrunnelse,
                })
            );
        },
        validationSchema: validationSchema,
        validateOnChange: hasSubmitted,
    });

    if (RemoteData.isSuccess(behandlingSlettet)) {
        return (
            <div>
                <AlertStripeSuksess>Behandlingen har blitt avsluttet</AlertStripeSuksess>
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
                    label={'Begrunnelse for å avslutte behandling'}
                    name={'avsluttSøknadsBehandlingBegrunnelse'}
                    onChange={formik.handleChange}
                    feil={formik.errors.avsluttSøknadsBehandlingBegrunnelse}
                >
                    <option value="velgBegrunnelse">Velg begrunnelse</option>
                    {Object.values(AvsluttSøknadsBehandlingBegrunnelse).map((begrunnelse, index) => (
                        <option value={begrunnelse} key={index}>
                            {begrunnelse}
                        </option>
                    ))}
                </Select>
            </div>
            <Fareknapp>Avslutt behandling</Fareknapp>

            {RemoteData.isFailure(behandlingSlettet) && (
                <AlertStripeFeil>Kunne ikke slette søknadsbehandling</AlertStripeFeil>
            )}
        </form>
    );
};

export default AvslutteBehandling;
