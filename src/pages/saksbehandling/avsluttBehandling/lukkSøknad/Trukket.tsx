import * as RemoteData from '@devexperts/remote-data-ts';
import { Datepicker } from '@navikt/ds-datepicker';
import { Button, Label, Loader } from '@navikt/ds-react';
import React from 'react';

import * as søknadApi from '~api/søknadApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import SkjemaelementFeilmelding from '~components/formElements/SkjemaelementFeilmelding';
import { useBrevForhåndsvisning } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { LukkSøknadBegrunnelse } from '~types/Søknad';

import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';

interface TrukketProps {
    søknadOpprettet: string;
    søknadId: string;
    datoSøkerTrakkSøknad: string | null;
    onDatoSøkerTrakkSøknadChange: (dato: string) => void;
    feilmelding: string | undefined;
    onRequestValidate(onSuccess: () => void): void;
}

const Trukket = (props: TrukketProps) => {
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
                        'aria-invalid': props.feilmelding ? true : false,
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
                {props.feilmelding && (
                    <SkjemaelementFeilmelding>
                        {props.feilmelding ?? formatMessage('feil.feltMåFyllesUt')}
                    </SkjemaelementFeilmelding>
                )}
            </div>
            <Button
                variant="secondary"
                className={styles.seBrevKnapp}
                type="button"
                onClick={() => {
                    props.onRequestValidate(() => {
                        hentBrev({
                            søknadId: props.søknadId,
                            body: {
                                type: LukkSøknadBegrunnelse.Trukket,
                                datoSøkerTrakkSøknad: props.datoSøkerTrakkSøknad ?? '',
                            },
                        });
                    });
                }}
            >
                {formatMessage('knapp.seBrev')}
                {RemoteData.isPending(brevStatus) && <Loader />}
            </Button>
            <div>{RemoteData.isFailure(brevStatus) && <ApiErrorAlert error={brevStatus.error} />}</div>
        </div>
    );
};

export default Trukket;
