import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Modal } from '@navikt/ds-react';
import { useState } from 'react';
import { lagStønadStatistikk, sendStønadStatistikk } from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { MonthPicker } from '~src/components/inputs/datePicker/DatePicker';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import { toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import sharedStyles from '../index.module.less';

const StønadStatistikk = () => {
    const [vilResendeStatistikk, setVilResendeStatistikk] = useState<boolean>(false);

    return (
        <div>
            <Button
                className={sharedStyles.knapp}
                variant="secondary"
                type="button"
                onClick={() => setVilResendeStatistikk(true)}
            >
                Stønadstatistikk
            </Button>
            {vilResendeStatistikk && (
                <StønadStatistikkModal open={vilResendeStatistikk} onClose={() => setVilResendeStatistikk(false)} />
            )}
        </div>
    );
};

const StønadStatistikkModal = (props: { open: boolean; onClose: () => void }) => {
    const [lagStønadstatistikkStatus, lagStønadstatistikkReq] = useApiCall(lagStønadStatistikk);
    const [sendStønadstatistikkStatus, sendStønadstatistikkReq] = useApiCall(sendStønadStatistikk);

    const [fraOgMed, setFraOgMed] = useState<Nullable<Date>>(null);
    const [tilOgMed, setTilOgMed] = useState<Nullable<Date>>(null);

    return (
        <Modal open={props.open} onClose={props.onClose} aria-label={'Statistikk'}>
            <Modal.Body>
                <div>
                    <Heading size="medium" spacing>
                        Lag stønadstatistikk
                    </Heading>
                    <MonthPicker
                        label="Fra og med"
                        value={fraOgMed}
                        onChange={(date) => {
                            setFraOgMed(date);
                        }}
                    />
                    <MonthPicker
                        label="Til og med"
                        value={tilOgMed}
                        onChange={(date) => {
                            setTilOgMed(date);
                        }}
                    />

                    <Button
                        onClick={() =>
                            lagStønadstatistikkReq({
                                fraOgMed: toIsoDateOnlyString(fraOgMed!),
                                tilOgMed: toIsoDateOnlyString(tilOgMed!),
                            })
                        }
                    >
                        Lag
                    </Button>
                    {RemoteData.isPending(lagStønadstatistikkStatus) && (
                        <p> Ber om opprettelse av stønadstatistikk... </p>
                    )}
                    {RemoteData.isSuccess(lagStønadstatistikkStatus) && (
                        <p> Generering er påbegynt. Følg med i logger. </p>
                    )}
                    {RemoteData.isFailure(lagStønadstatistikkStatus) && (
                        <ApiErrorAlert error={lagStønadstatistikkStatus.error} />
                    )}
                </div>
                <div>
                    <Heading size="medium" spacing>
                        Send til BigQuery
                    </Heading>
                    <MonthPicker
                        label="Fra og med"
                        value={fraOgMed}
                        onChange={(date) => {
                            setFraOgMed(date);
                        }}
                    />
                    <MonthPicker
                        label="Til og med"
                        value={tilOgMed}
                        onChange={(date) => {
                            setTilOgMed(date);
                        }}
                    />

                    <Button
                        onClick={() =>
                            sendStønadstatistikkReq({
                                fraOgMed: toIsoDateOnlyString(fraOgMed!),
                                tilOgMed: toIsoDateOnlyString(tilOgMed!),
                            })
                        }
                    >
                        Send
                    </Button>
                    {RemoteData.isPending(sendStønadstatistikkStatus) && <p> Sender stønadstatistikk... </p>}
                    {RemoteData.isSuccess(sendStønadstatistikkStatus) && <p> Nice 👍🤌</p>}
                    {RemoteData.isFailure(sendStønadstatistikkStatus) && (
                        <ApiErrorAlert error={sendStønadstatistikkStatus.error} />
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default StønadStatistikk;
