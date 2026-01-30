import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Modal } from '@navikt/ds-react';
import { useState } from 'react';
import { sakStatistikk } from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import { toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import sharedStyles from '../index.module.less';

const SakStatistikk = () => {
    const [vilResendeStatistikk, setVilResendeStatistikk] = useState<boolean>(false);

    return (
        <div>
            <Button
                className={sharedStyles.knapp}
                variant="secondary"
                type="button"
                onClick={() => setVilResendeStatistikk(true)}
            >
                Saksstatistikk
            </Button>
            {vilResendeStatistikk && (
                <SakStatistikkModal open={vilResendeStatistikk} onClose={() => setVilResendeStatistikk(false)} />
            )}
        </div>
    );
};

const SakStatistikkModal = (props: { open: boolean; onClose: () => void }) => {
    const [sakStatistikkStatus, sakStatistikkRequest] = useApiCall(sakStatistikk);

    const [fraOgMed, setFraOgMed] = useState<Nullable<Date>>(null);
    const [tilOgMed, setTilOgMed] = useState<Nullable<Date>>(null);

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            aria-label={'Statistikk'}
            header={{ heading: 'Sakstatistikk' }}
        >
            <Modal.Body>
                <div>
                    <DatePicker
                        label="Fra og med"
                        value={fraOgMed}
                        onChange={(date) => {
                            setFraOgMed(date);
                        }}
                    />
                    <DatePicker
                        label="Til og med"
                        value={tilOgMed}
                        onChange={(date) => {
                            setTilOgMed(date);
                        }}
                    />

                    <Button
                        onClick={() =>
                            sakStatistikkRequest({
                                fraOgMed: toIsoDateOnlyString(fraOgMed!),
                                tilOgMed: toIsoDateOnlyString(tilOgMed!),
                            })
                        }
                    >
                        Send statistikk
                    </Button>

                    {RemoteData.isSuccess(sakStatistikkStatus) && <p>Nice 👍🤌</p>}

                    {RemoteData.isFailure(sakStatistikkStatus) && <ApiErrorAlert error={sakStatistikkStatus.error} />}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default SakStatistikk;
