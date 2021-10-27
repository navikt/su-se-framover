import * as RemoteData from '@devexperts/remote-data-ts';
import { Datepicker } from '@navikt/ds-datepicker';
import { Button, Label, Loader, Tag } from '@navikt/ds-react';
import React, { useState } from 'react';

import * as søknadApi from '~api/søknadApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { ApiResult, useBrevForhåndsvisning } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Sak } from '~types/Sak';
import { LukkSøknadBegrunnelse } from '~types/Søknad';

import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';

interface TrukketProps {
    søknadOpprettet: string;
    søknadId: string;
    datoSøkerTrakkSøknad: string | null;
    onDatoSøkerTrakkSøknadChange: (dato: string) => void;
    feilmelding: string | undefined;
    søknadLukketStatus: ApiResult<Sak, string>;
}

const Trukket = (props: TrukketProps) => {
    const [clickedViewLetter, setClickedViewLetter] = useState<boolean>(false);
    const { formatMessage } = useI18n({ messages: nb });

    const [brevStatus, hentBrev] = useBrevForhåndsvisning(søknadApi.hentLukketSøknadsBrevutkast);

    return (
        <div className={styles.trukketContainer}>
            <div className={styles.datoContainer}>
                <Label as="label" htmlFor={'datoSøkerTrakkSøknad'}>
                    {formatMessage('trekking.datoSøkerTrakkSøknad')}
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
                    <Tag variant="error">{formatMessage('feil.feltMåFyllesUt')}</Tag>
                )}
            </div>
            <div className={styles.buttonsContainer}>
                <Button
                    variant="secondary"
                    className={styles.seBrevKnapp}
                    type="button"
                    onClick={() => {
                        setClickedViewLetter(true);
                        hentBrev({
                            søknadId: props.søknadId,
                            body: {
                                type: LukkSøknadBegrunnelse.Trukket,
                                //Vi har en use-state som sjekker at verdi ikke er null
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                datoSøkerTrakkSøknad: props.datoSøkerTrakkSøknad!,
                            },
                        });
                    }}
                >
                    {formatMessage('knapp.seBrev')}
                    {RemoteData.isPending(brevStatus) && <Loader />}
                </Button>
                <Button variant="danger">
                    {formatMessage('knapp.lukkSøknad')}
                    {RemoteData.isPending(props.søknadLukketStatus) && <Loader />}
                </Button>
            </div>
            <div>{RemoteData.isFailure(brevStatus) && <ApiErrorAlert error={brevStatus.error} />}</div>
        </div>
    );
};

export default Trukket;
