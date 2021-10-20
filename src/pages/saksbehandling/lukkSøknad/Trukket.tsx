import * as RemoteData from '@devexperts/remote-data-ts';
import { Datepicker } from '@navikt/ds-datepicker';
import { Button, Label, Loader, Tag } from '@navikt/ds-react';
import React, { useCallback, useState } from 'react';

import { ApiError } from '~api/apiClient';
import { hentLukketSøknadBrevutkast } from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/i18n';
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
                <Label as="label" htmlFor={'datoSøkerTrakkSøknad'}>
                    {intl.formatMessage({ id: 'display.trekking.datoSøkerTrakkSøknad' })}
                </Label>
                <Datepicker
                    inputProps={{
                        name: 'datoSøkerTrakkSøknad',
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
                {props.feilmelding && <Tag variant="error">{props.feilmelding}</Tag>}
                {clickedViewLetter && props.datoSøkerTrakkSøknad === null && (
                    <Tag variant="error">{intl.formatMessage({ id: 'display.feil.feltMåFyllesUt' })}</Tag>
                )}
            </div>
            <div className={styles.buttonsContainer}>
                <Button
                    variant="secondary"
                    className={styles.seBrevKnapp}
                    type="button"
                    onClick={() => {
                        setClickedViewLetter(true);
                        onSeBrevClick();
                    }}
                >
                    {intl.formatMessage({ id: 'knapp.seBrev' })}
                    {RemoteData.isPending(props.lukketSøknadBrevutkastStatus) && <Loader />}
                </Button>
                <Button variant="danger">
                    {intl.formatMessage({ id: 'knapp.lukkSøknad' })}
                    {RemoteData.isPending(props.søknadLukketStatus) && <Loader />}
                </Button>
            </div>
        </div>
    );
};

export default Trukket;
