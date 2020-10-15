import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeSuksess, AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Fareknapp } from 'nav-frontend-knapper';
import { Select } from 'nav-frontend-skjema';
import React, { useState } from 'react';

import { lukkSøknad } from '~features/saksoversikt/sak.slice';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Sak } from '~types/Sak';

enum AvsluttSøknadsbehandling {
    Trukket = 'Trukket',
}

interface FormData {
    avsluttSøknadsbehandling: AvsluttSøknadsbehandling | null;
}

const validationSchema = yup.object<FormData>({
    avsluttSøknadsbehandling: yup.mixed().oneOf([AvsluttSøknadsbehandling.Trukket]).required(),
});

const AvsluttBehandling = (props: { sak: Sak }) => {
    const dispatch = useAppDispatch();
    const søknadsbehandlingAvsluttet = useAppSelector((s) => s.sak.søknadsbehandlingAvsluttetStatus);
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
                lukkSøknad({
                    sakId: urlParams.sakId,
                    søknadId: urlParams.soknadId,
                })
            );
        },
        validationSchema: validationSchema,
        validateOnChange: hasSubmitted,
    });

    const søknad = props.sak.søknader.find((s) => s.id === urlParams.soknadId);

    if (RemoteData.isSuccess(søknadsbehandlingAvsluttet) || (søknad && søknad.lukket !== null)) {
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
            <Fareknapp>Lukk søknad</Fareknapp>

            {RemoteData.isFailure(søknadsbehandlingAvsluttet) && (
                <AlertStripeFeil>Kunne ikke lukke søknad</AlertStripeFeil>
            )}
        </form>
    );
};

export default AvsluttBehandling;
