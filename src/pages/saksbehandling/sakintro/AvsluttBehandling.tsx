import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeSuksess, AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Fareknapp, Knapp } from 'nav-frontend-knapper';
import { Select } from 'nav-frontend-skjema';
import React, { useState, useCallback } from 'react';

import { lukkSøknad, hentLukketSøknadBrevutkast } from '~features/saksoversikt/sak.slice';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Sak } from '~types/Sak';

export enum LukkSøknadType {
    Trukket = 'Trukket',
}

interface FormData {
    lukkSøknadType: LukkSøknadType | null;
}

const validationSchema = yup.object<FormData>({
    lukkSøknadType: yup.mixed().oneOf([LukkSøknadType.Trukket]).required(),
});

const AvsluttBehandling = (props: { sak: Sak }) => {
    const dispatch = useAppDispatch();
    const { søknadsbehandlingAvsluttetStatus, lukketSøknadBrevutkastStatus } = useAppSelector((s) => s.sak);
    const urlParams = Routes.useRouteParams<typeof Routes.avsluttSøknadsbehandling>();

    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

    const formik = useFormik<FormData>({
        initialValues: {
            lukkSøknadType: null,
        },
        async onSubmit(values) {
            if (!values.lukkSøknadType) {
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

    const lukketSøknadBrev = useCallback(() => {
        if (RemoteData.isPending(lukketSøknadBrevutkastStatus) || !formik.values.lukkSøknadType) {
            return;
        }
        dispatch(
            hentLukketSøknadBrevutkast({
                søknadId: urlParams.soknadId,
                lukketSøknadType: formik.values.lukkSøknadType,
            })
        ).then((action) => {
            if (hentLukketSøknadBrevutkast.fulfilled.match(action)) {
                window.open(action.payload.objectUrl);
            }
        });
    }, [formik.values.lukkSøknadType]);

    const søknad = props.sak.søknader.find((s) => s.id === urlParams.soknadId);

    if (RemoteData.isSuccess(søknadsbehandlingAvsluttetStatus) || (søknad && søknad.lukket !== null)) {
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
                    name={'lukkSøknadType'}
                    onChange={formik.handleChange}
                    feil={formik.errors.lukkSøknadType}
                >
                    <option value="velgBegrunnelse">Velg begrunnelse</option>
                    {Object.values(LukkSøknadType).map((begrunnelse) => (
                        <option value={begrunnelse} key={begrunnelse}>
                            {begrunnelse}
                        </option>
                    ))}
                </Select>
            </div>
            {formik.values.lukkSøknadType != null && (
                <div>
                    <Knapp
                        htmlType="button"
                        onClick={lukketSøknadBrev}
                        spinner={RemoteData.isPending(lukketSøknadBrevutkastStatus)}
                    >
                        Se brev
                    </Knapp>
                    <Fareknapp spinner={RemoteData.isPending(lukketSøknadBrevutkastStatus)}>Lukk søknad</Fareknapp>
                </div>
            )}

            {RemoteData.isFailure(lukketSøknadBrevutkastStatus) && (
                <AlertStripeFeil>Kunne ikke vise brev</AlertStripeFeil>
            )}

            {RemoteData.isFailure(søknadsbehandlingAvsluttetStatus) && (
                <AlertStripeFeil>Kunne ikke lukke søknad</AlertStripeFeil>
            )}
        </form>
    );
};

export default AvsluttBehandling;
