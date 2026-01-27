import * as RemoteData from '@devexperts/remote-data-ts';
import { isSuccess } from '@devexperts/remote-data-ts';
import { Button, Heading, Loader, Modal } from '@navikt/ds-react';
import { isPending } from '@reduxjs/toolkit';
import { useEffect, useState } from 'react';
import { hentKontrollsamtaler } from '~src/api/kontrollsamtaleApi.ts';
import { hentKontrollsamtaleoversikt } from '~src/api/kontrollsamtalerOversiktApi.ts';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert.tsx';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks.ts';
import sharedStyles from '../index.module.less';

const KontrollsamtaleOversikt = () => {
    const [visKontrollsamtaleOversikt, setKontrollsamtaleOversikt] = useState<boolean>(false);

    return (
        <div>
            <Button
                className={sharedStyles.knapp}
                variant="secondary"
                type="button"
                onClick={() => setKontrollsamtaleOversikt(true)}
            >
                Kontrollsamtaler
            </Button>
            {visKontrollsamtaleOversikt && (
                <KontrollsamtalerModal
                    open={visKontrollsamtaleOversikt}
                    onClose={() => setKontrollsamtaleOversikt(false)}
                />
            )}
        </div>
    );
};

const KontrollsamtalerModal = (props: { open: boolean; onClose: () => void }) => {
    const [hentKontrollsamtaleoversiktStatus, hentKontrollsamtaleoversiktRequest] =
        useApiCall(hentKontrollsamtaleoversikt);

    useEffect(() => {
        hentKontrollsamtaleoversiktRequest({});
    }, []);

    return (
        <Modal open={props.open} onClose={props.onClose} aria-label={'Statistikk'}>
            <Modal.Body>
                <div>
                    <Heading size="medium" spacing>
                        Kontrollsamtaler
                    </Heading>
                    {pipe(
                        hentKontrollsamtaleoversiktStatus,
                        RemoteData.fold(
                            () => <Loader />,
                            () => <Loader />,
                            (error) => <ApiErrorAlert error={error} />,
                            (kontrollSamtaleoversikt) => (
                                <div>
                                    {kontrollSamtaleoversikt.kontrollsamtaleAntall.map((antall, index) => (
                                        <div key={index}>
                                            <div>samtaler med frist {antall.frist.toString()}</div>
                                            <div>Antall {antall.antall}</div>
                                        </div>
                                    ))}
                                </div>
                            ),
                        ),
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default KontrollsamtaleOversikt;
