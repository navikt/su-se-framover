import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { Datovelger } from 'nav-datovelger';
import { AlertStripeSuksess, AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Fareknapp, Knapp } from 'nav-frontend-knapper';
import { Label, Select } from 'nav-frontend-skjema';
import { Feilmelding } from 'nav-frontend-typografi';
import React, { useState, useCallback } from 'react';

import { lukkSøknad, hentLukketSøknadBrevutkast } from '~features/saksoversikt/sak.slice';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Sak } from '~types/Sak';
import { LukkSøknadType } from '~types/Søknad';

import styles from './avsluttBehandling.module.less';

interface FormData {
    lukkSøknadType: Nullable<LukkSøknadType>;
    datoSøkerTrakkSøknad: Nullable<string>;
}

const validationSchema = yup.object<FormData>({
    lukkSøknadType: yup.mixed().oneOf([LukkSøknadType.Trukket]).required(),
    datoSøkerTrakkSøknad: yup.string().nullable().defined().when('lukkSøknadType', {
        is: LukkSøknadType.Trukket,
        then: yup.string().required(),
        otherwise: yup.string().nullable().defined(),
    }),
});

const AvsluttBehandling = (props: { sak: Sak }) => {
    const dispatch = useAppDispatch();
    const { søknadsbehandlingAvsluttetStatus, lukketSøknadBrevutkastStatus } = useAppSelector((s) => s.sak);
    const urlParams = Routes.useRouteParams<typeof Routes.avsluttSøknadsbehandling>();
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const [clickedViewLetter, setClickedViewLetter] = useState<boolean>(false);

    const formik = useFormik<FormData>({
        initialValues: {
            lukkSøknadType: null,
            datoSøkerTrakkSøknad: null,
        },
        async onSubmit(values) {
            if (!values.lukkSøknadType || !values.datoSøkerTrakkSøknad) {
                return;
            }
            dispatch(
                lukkSøknad({
                    søknadId: urlParams.soknadId,
                    lukketSøknadType: values.lukkSøknadType,
                    datoSøkerTrakkSøknad: new Date(values.datoSøkerTrakkSøknad),
                })
            );
        },
        validationSchema: validationSchema,
        validateOnChange: hasSubmitted,
    });

    const lukketSøknadBrev = useCallback(() => {
        if (
            RemoteData.isPending(lukketSøknadBrevutkastStatus) ||
            !formik.values.lukkSøknadType ||
            !formik.values.datoSøkerTrakkSøknad
        ) {
            return;
        }
        dispatch(
            hentLukketSøknadBrevutkast({
                søknadId: urlParams.soknadId,
                lukketSøknadType: formik.values.lukkSøknadType,
                datoSøkerTrakkSøknad: new Date(formik.values.datoSøkerTrakkSøknad),
            })
        ).then((action) => {
            if (hentLukketSøknadBrevutkast.fulfilled.match(action)) {
                window.open(action.payload.objectUrl);
            }
        });
    }, [formik.values]);

    const søknad = props.sak.søknader.find((s) => s.id === urlParams.soknadId);

    if (RemoteData.isSuccess(søknadsbehandlingAvsluttetStatus) || søknad?.lukket !== null) {
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
            <div className={styles.selectContainer}>
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
            {formik.values.lukkSøknadType == LukkSøknadType.Trukket && (
                <div>
                    <div className={styles.datoContainer}>
                        <Label htmlFor={'datoSøkerTrakkSøknad'}>Dato søker trakk søknad</Label>
                        <Datovelger
                            input={{
                                name: 'datoSøkerTrakkSøknad',
                                placeholder: 'dd.mm.åååå',
                                id: 'datoSøkerTrakkSøknad',
                            }}
                            id={'datoSøkerTrakkSøknad'}
                            valgtDato={formik.values.datoSøkerTrakkSøknad?.toString()}
                            onChange={(value) => {
                                if (!value) {
                                    return;
                                }
                                formik.setValues({
                                    ...formik.values,
                                    datoSøkerTrakkSøknad: value,
                                });
                            }}
                        />
                        <Feilmelding>{formik.errors.datoSøkerTrakkSøknad ?? ''}</Feilmelding>
                        {clickedViewLetter && formik.values.datoSøkerTrakkSøknad === null && (
                            <Feilmelding>Feltet må fylles ut</Feilmelding>
                        )}
                    </div>
                    <div className={styles.buttonsContainer}>
                        <Knapp
                            className={styles.seBrevKnapp}
                            htmlType="button"
                            onClick={() => {
                                setClickedViewLetter(true);
                                lukketSøknadBrev();
                            }}
                            spinner={RemoteData.isPending(lukketSøknadBrevutkastStatus)}
                        >
                            Se brev
                        </Knapp>
                        <Fareknapp spinner={RemoteData.isPending(lukketSøknadBrevutkastStatus)}>Lukk søknad</Fareknapp>
                    </div>
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
