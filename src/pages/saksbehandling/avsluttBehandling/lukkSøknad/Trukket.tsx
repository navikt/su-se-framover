import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Loader } from '@navikt/ds-react';

import * as søknadApi from '~src/api/søknadApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import { useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { LukkSøknadBegrunnelse } from '~src/types/Søknad';
import { toDateOrNull, toIsoDateOnlyString } from '~src/utils/date/dateUtils';
import styles from './lukkSøknad.module.less';
import nb from './lukkSøknad-nb';

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
                <DatePicker
                    label={formatMessage('trekking.datoSøkerTrakkSøknad')}
                    value={toDateOrNull(props.datoSøkerTrakkSøknad)}
                    fromDate={toDateOrNull(props.søknadOpprettet)}
                    toDate={new Date()}
                    onChange={(value) => value && props.onDatoSøkerTrakkSøknadChange(toIsoDateOnlyString(value))}
                    error={props.feilmelding}
                />
            </div>
            <Button
                variant="secondary"
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
