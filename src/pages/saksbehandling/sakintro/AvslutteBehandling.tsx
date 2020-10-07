import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { Fareknapp } from 'nav-frontend-knapper';
import { Select } from 'nav-frontend-skjema';
import React, { useState } from 'react';

import { avsluttSøknadsBehandling } from '~features/søknad/søknad.slice';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

export enum AvsluttetBegrunnelse {
    VelgBegrunnelse = 'Velg begrunnelse',
    Trukket = 'Trukket',
    Bortfalt = 'Bortfalt',
    AvvistSøktForTidlig = 'AvvistSøktForTidlig',
}

interface FormData {
    avsluttetBegrunnelse: AvsluttetBegrunnelse;
}

const validationSchema = yup.object<FormData>({
    avsluttetBegrunnelse: yup
        .mixed()
        .oneOf([AvsluttetBegrunnelse.Trukket, AvsluttetBegrunnelse.Bortfalt, AvsluttetBegrunnelse.AvvistSøktForTidlig])
        .required(),
});

const AvslutteBehandling = () => {
    const dispatch = useAppDispatch();
    const behandlingSlettet = useAppSelector((s) => s.soknad.avsluttetBehandling);

    const urlParams = Routes.useRouteParams<typeof Routes.saksoversiktAvsluttBehandling>();

    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

    if (!urlParams) {
        return <div>404</div>;
    }

    const formik = useFormik<FormData>({
        initialValues: {
            avsluttetBegrunnelse: AvsluttetBegrunnelse.VelgBegrunnelse,
        },
        async onSubmit(values) {
            if (values.avsluttetBegrunnelse === AvsluttetBegrunnelse.VelgBegrunnelse) {
                return;
            }

            dispatch(
                avsluttSøknadsBehandling({
                    sakId: urlParams.sakId,
                    søknadId: urlParams.soknadId,
                    avsluttetBegrunnelse: values.avsluttetBegrunnelse,
                })
            );
        },
        validationSchema: validationSchema,
        validateOnChange: hasSubmitted,
    });

    if (RemoteData.isSuccess(behandlingSlettet)) {
        return (
            <div>
                <AlertStripeSuksess>Behandling har blitt slettet</AlertStripeSuksess>
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
                    name={'avsluttetBegrunnelse'}
                    onChange={formik.handleChange}
                    feil={formik.errors.avsluttetBegrunnelse}
                >
                    {Object.values(AvsluttetBegrunnelse).map((begrunnelse, index) => (
                        <option value={begrunnelse} key={index}>
                            {begrunnelse}
                        </option>
                    ))}
                </Select>
            </div>
            <Fareknapp>Avslutt behandling</Fareknapp>
        </form>
    );
};

export default AvslutteBehandling;
