import { Alert, Button, Modal } from '@navikt/ds-react';
import { useEffect, useRef, useState } from 'react';

import { fetchFrontendConfig } from '~src/api/frontendConfigApi';
import { useAppSelector } from '~src/redux/Store';

const FEM_MINUTTER_MS = 300_000;
const TO_MINUTTER_MS = 120_000;

const VersionCheck = () => {
    const cachebuster = useAppSelector((state) => state.frontendConfig.config.cachebuster);
    const [isOutdated, setIsOutdated] = useState(false);
    const reloadTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            if (reloadTimeoutRef.current !== null) return;
            fetchFrontendConfig()
                .then((config) => {
                    if (reloadTimeoutRef.current === null && config.cachebuster !== cachebuster) {
                        setIsOutdated(true);
                        reloadTimeoutRef.current = window.setTimeout(() => window.location.reload(), TO_MINUTTER_MS);
                    }
                })
                .catch(() => {
                    // Ignorer nettverksfeil - prøver igjen neste intervall
                });
        }, FEM_MINUTTER_MS);

        return () => window.clearInterval(intervalId);
    }, [cachebuster]);

    const onAvbryt = () => {
        setIsOutdated(false);
        if (reloadTimeoutRef.current !== null) {
            window.clearTimeout(reloadTimeoutRef.current);
            reloadTimeoutRef.current = null;
        }
    };

    return (
        <Modal
            header={{
                label: 'Ny oppdatering',
                heading: 'Utdatert web applikasjon',
                closeButton: false,
            }}
            open={isOutdated}
            onClose={onAvbryt}
        >
            <Modal.Body>
                <Alert variant="warning">
                    Det er kommet en ny versjon av applikasjonen. Nettsida vil automatisk laste på nytt om 2 minutter
                    for å hente inn den nyeste versjonen. Har du endringer du ønsker å lagre først? Trykk på
                    avbryt-knappen.
                </Alert>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onAvbryt}>
                    Avbryt oppdatering
                </Button>
                <Button variant="primary" onClick={() => window.location.reload()}>
                    Last siden på nytt nå
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default VersionCheck;
