import * as RemoteData from '@devexperts/remote-data-ts';
import { Datepicker } from 'nav-datovelger';
import { Fareknapp, Knapp } from 'nav-frontend-knapper';
import { Label } from 'nav-frontend-skjema';
import { Feilmelding } from 'nav-frontend-typografi';
import React, { useCallback, useState } from 'react';

import { ApiError } from '~api/apiClient';
import { hentLukketSøknadBrevutkast } from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/hooks';
import { useAppDispatch } from '~redux/Store';
import { LukkSøknadBegrunnelse } from '~types/Søknad';

import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';

interface TrukketProps {
    lukkSøknadBegrunnelse: LukkSøknadBegrunnelse;
    søknadOpprettet: string;
    søknadId: string;
    datoSøkerTrakkSøknad: string | null;
    onDatoSøkerTrakkSøknadChange: (dato: string) => void;
    feilmelding: string | undefined;
    lukketSøknadBrevutkastStatus: RemoteData.RemoteData<ApiError, null>;
    søknadLukketStatus: RemoteData.RemoteData<ApiError, null>;
}

const Trukket = (props: TrukketProps) => {
    const dispatch = useAppDispatch();
    const [clickedViewLetter, setClickedViewLetter] = useState<boolean>(false);
    const { intl } = useI18n({ messages: nb });

    const onSeBrevClick = useCallback(() => {
        if (RemoteData.isPending(props.lukketSøknadBrevutkastStatus)) {
            return;
        }

        if (props.lukkSøknadBegrunnelse === LukkSøknadBegrunnelse.Trukket && props.datoSøkerTrakkSøknad) {
            dispatch(
                hentLukketSøknadBrevutkast({
                    søknadId: props.søknadId,
                    body: {
                        type: props.lukkSøknadBegrunnelse,
                        datoSøkerTrakkSøknad: props.datoSøkerTrakkSøknad,
                    },
                })
            ).then((action) => {
                if (hentLukketSøknadBrevutkast.fulfilled.match(action)) {
                    window.open(action.payload.objectUrl);
                }
            });
        }
    }, [props]);

    return (
        <div className={styles.trukketContainer}>
            <div className={styles.datoContainer}>
                <Label htmlFor={'datoSøkerTrakkSøknad'}>
                    {intl.formatMessage({ id: 'display.trekking.datoSøkerTrakkSøknad' })}
                </Label>
                <Datepicker
                    inputProps={{
                        name: 'datoSøkerTrakkSøknad',
                        placeholder: 'dd.mm.åååå',
                        'aria-invalid':
                            props.feilmelding || (clickedViewLetter && props.datoSøkerTrakkSøknad === null)
                                ? true
                                : false,
                    }}
                    inputId={'datoSøkerTrakkSøknad'}
                    value={props.datoSøkerTrakkSøknad?.toString()}
                    limitations={{ minDate: props.søknadOpprettet, maxDate: new Date().toISOString() }}
                    onChange={(value) => {
                        if (!value) {
                            return;
                        }
                        props.onDatoSøkerTrakkSøknadChange(value);
                    }}
                />
                <Feilmelding>{props.feilmelding ?? ''}</Feilmelding>
                {clickedViewLetter && props.datoSøkerTrakkSøknad === null && (
                    <Feilmelding>{intl.formatMessage({ id: 'display.feil.feltMåFyllesUt' })}</Feilmelding>
                )}
            </div>
            <div className={styles.buttonsContainer}>
                <Knapp
                    className={styles.seBrevKnapp}
                    htmlType="button"
                    onClick={() => {
                        setClickedViewLetter(true);
                        onSeBrevClick();
                    }}
                    spinner={RemoteData.isPending(props.lukketSøknadBrevutkastStatus)}
                >
                    {intl.formatMessage({ id: 'knapp.seBrev' })}
                </Knapp>
                <Fareknapp spinner={RemoteData.isPending(props.søknadLukketStatus)}>
                    {intl.formatMessage({ id: 'knapp.lukkSøknad' })}
                </Fareknapp>
            </div>
        </div>
    );
};

export default Trukket;
