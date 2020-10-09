import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeSuksess, AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Fareknapp } from 'nav-frontend-knapper';
import { Select } from 'nav-frontend-skjema';
import React, { useState } from 'react';

import { trekkSøknad } from '~features/søknad/søknad.slice';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

export enum trekkSøknadEnum {
    Trukket = 'Trukket',
}

interface FormData {
    trekkSøknad: trekkSøknadEnum | null;
}

const validationSchema = yup.object<FormData>({
    trekkSøknad: yup.mixed().oneOf([trekkSøknadEnum.Trukket]).required(),
});

const AvslutteBehandling = () => {
    const dispatch = useAppDispatch();
    const behandlingSlettet = useAppSelector((s) => s.soknad.søknadHarBlittTrukket);

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
                    søknadTrukket: values.trekkSøknad == trekkSøknadEnum.Trukket,
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
                    {Object.values(trekkSøknadEnum).map((begrunnelse, index) => (
                        <option value={begrunnelse} key={index}>
                            {begrunnelse}
                        </option>
                    ))}
                </Select>
            </div>
            <Fareknapp>Søknad er trukket</Fareknapp>

            {RemoteData.isFailure(behandlingSlettet) && <AlertStripeFeil>Kunne ikke trekke søknad</AlertStripeFeil>}
        </form>
    );
};

export default AvslutteBehandling;
