import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Heading, Modal, Textarea } from '@navikt/ds-react';
import { useState } from 'react';

import { resendSpesifikkVedtakstatistikk, resendstatistikkSøknadsbehandlingVedtak } from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import { toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import sharedStyles from '../index.module.less';

const ResendStatistikk = () => {
    const [vilResendeStatistikk, setVilResendeStatistikk] = useState<boolean>(false);

    return (
        <>
            <Button
                className={sharedStyles.knapp}
                variant="secondary"
                type="button"
                onClick={() => setVilResendeStatistikk(true)}
            >
                Resend statistikk
            </Button>
            {vilResendeStatistikk && (
                <ResendStatistikkModal open={vilResendeStatistikk} onClose={() => setVilResendeStatistikk(false)} />
            )}
        </>
    );
};

const ResendStatistikkModal = (props: { open: boolean; onClose: () => void }) => {
    const [søknadsbehandlingVedtakStatistikkStatus, resendSøknadsbehandlingVedtak] = useApiCall(
        resendstatistikkSøknadsbehandlingVedtak,
    );
    const [spesifikkStatus, resendSpesifikkVedtak] = useApiCall(resendSpesifikkVedtakstatistikk);

    const [fraOgMed, setFraOgMed] = useState<Nullable<Date>>(null);
    const [vedtakId, setVedtakId] = useState<string>('');

    return (
        <Modal open={props.open} onClose={props.onClose} aria-label={'Statistikk'}>
            <Modal.Body>
                <div>
                    <Heading size="medium" spacing>
                        Spesifikk
                    </Heading>

                    <Textarea label={'vedtak id'} onChange={(v) => setVedtakId(v.target.value)} />
                    <Button onClick={() => resendSpesifikkVedtak({ vedtakIder: vedtakId })}>
                        Resend spesifikk vedtak statistikk
                    </Button>
                    {RemoteData.isSuccess(spesifikkStatus) && <p>Nice 👍🤌</p>}

                    {RemoteData.isFailure(spesifikkStatus) && <ApiErrorAlert error={spesifikkStatus.error} />}

                    <Heading size="medium" spacing>
                        Alle
                    </Heading>
                    <DatePicker
                        label="Fra og med"
                        value={fraOgMed}
                        onChange={(date) => {
                            setFraOgMed(date);
                        }}
                    />

                    <Button
                        onClick={() =>
                            resendSøknadsbehandlingVedtak({
                                fraOgMed: toIsoDateOnlyString(fraOgMed!),
                            })
                        }
                    >
                        Søknadsbehandling vedtak
                    </Button>

                    {RemoteData.isSuccess(søknadsbehandlingVedtakStatistikkStatus) && <p>Nice 👍🤌</p>}

                    {RemoteData.isFailure(søknadsbehandlingVedtakStatistikkStatus) && (
                        <ApiErrorAlert error={søknadsbehandlingVedtakStatistikkStatus.error} />
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ResendStatistikk;
