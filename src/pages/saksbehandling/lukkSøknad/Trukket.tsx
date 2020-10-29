import * as RemoteData from '@devexperts/remote-data-ts';
import { FormikErrors } from 'formik';
import { Datovelger } from 'nav-datovelger';
import { Fareknapp, Knapp } from 'nav-frontend-knapper';
import { Label } from 'nav-frontend-skjema';
import { Feilmelding } from 'nav-frontend-typografi';
import React, { SetStateAction, SyntheticEvent, useCallback, useState } from 'react';

import { hentLukketSøknadBrevutkast } from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { LukkSøknadType } from '~types/Søknad';

import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';
import { LukkSøknadFormData } from './lukkSøknadUtils';

const Trukket = (props: {
    values: LukkSøknadFormData;
    errors: FormikErrors<LukkSøknadFormData>;
    setValues: (values: SetStateAction<LukkSøknadFormData>, shouldValidate?: boolean | undefined) => unknown;
    handleChange: (event: React.ChangeEvent<HTMLTextAreaElement> | SyntheticEvent<EventTarget, Event>) => void;
}) => {
    const dispatch = useAppDispatch();
    const urlParams = Routes.useRouteParams<typeof Routes.avsluttSøknadsbehandling>();
    const { lukketSøknadBrevutkastStatus } = useAppSelector((s) => s.sak);
    const [clickedViewLetter, setClickedViewLetter] = useState<boolean>(false);
    const intl = useI18n({ messages: nb });

    const trukketSøknadBrev = useCallback(() => {
        if (RemoteData.isPending(lukketSøknadBrevutkastStatus)) {
            return;
        }

        if (props.values.lukkSøknadType === LukkSøknadType.Trukket && props.values.datoSøkerTrakkSøknad) {
            dispatch(
                hentLukketSøknadBrevutkast({
                    søknadId: urlParams.soknadId,
                    lukketSøknadType: props.values.lukkSøknadType,
                    body: {
                        type: props.values.lukkSøknadType.toUpperCase(),
                        datoSøkerTrakkSøknad: props.values.datoSøkerTrakkSøknad,
                    },
                })
            ).then((action) => {
                if (hentLukketSøknadBrevutkast.fulfilled.match(action)) {
                    window.open(action.payload.objectUrl);
                }
            });
        }
    }, [props.values]);

    return (
        <div className={styles.trukketContainer}>
            <div className={styles.datoContainer}>
                <Label htmlFor={'datoSøkerTrakkSøknad'}>
                    {intl.formatMessage({ id: 'display.trekking.datoSøkerTrakkSøknad' })}
                </Label>
                <Datovelger
                    input={{
                        name: 'datoSøkerTrakkSøknad',
                        placeholder: 'dd.mm.åååå',
                        id: 'datoSøkerTrakkSøknad',
                    }}
                    id={'datoSøkerTrakkSøknad'}
                    valgtDato={props.values.datoSøkerTrakkSøknad?.toString()}
                    onChange={(value) => {
                        if (!value) {
                            return;
                        }
                        props.setValues({
                            ...props.values,
                            datoSøkerTrakkSøknad: value,
                        });
                    }}
                />
                <Feilmelding>{props.errors.datoSøkerTrakkSøknad ?? ''}</Feilmelding>
                {clickedViewLetter && props.values.datoSøkerTrakkSøknad === null && (
                    <Feilmelding>{intl.formatMessage({ id: 'display.feil.feltMåFyllesUt' })}</Feilmelding>
                )}
            </div>
            <div className={styles.buttonsContainer}>
                <Knapp
                    className={styles.seBrevKnapp}
                    htmlType="button"
                    onClick={() => {
                        setClickedViewLetter(true);
                        trukketSøknadBrev();
                    }}
                    spinner={RemoteData.isPending(lukketSøknadBrevutkastStatus)}
                >
                    {intl.formatMessage({ id: 'knapp.seBrev' })}
                </Knapp>
                <Fareknapp spinner={RemoteData.isPending(lukketSøknadBrevutkastStatus)}>
                    {intl.formatMessage({ id: 'knapp.lukkSøknad' })}
                </Fareknapp>
            </div>
        </div>
    );
};

export default Trukket;
