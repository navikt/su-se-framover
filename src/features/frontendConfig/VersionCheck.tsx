import { Alert, Button, Modal } from '@navikt/ds-react';
import { useEffect, useState } from 'react';

import { fetchFrontendConfig } from '~src/api/frontendConfigApi';
import { useAppSelector } from '~src/redux/Store';

const FEM_MINUTTER_MS = 300_000;
const TO_MINUTTER_MS = 120_000;

const VersionCheck = () => {
    const cachebuster = useAppSelector((state) => state.frontendConfig.config.cachebuster);
    const [isOutdated, setIsOutdated] = useState(false);

    useEffect(() => {
        let detected = false;

        const intervalId = window.setInterval(() => {
            if (detected) return;
            fetchFrontendConfig()
                .then((config) => {
                    if (!detected && config.cachebuster !== cachebuster) {
                        detected = true;
                        setIsOutdated(true);
                        window.setTimeout(() => window.location.reload(), TO_MINUTTER_MS);
                    }
                })
                .catch(() => {
                    // Ignorer nettverksfeil - prøver igjen neste intervall
                });
        }, FEM_MINUTTER_MS);

        return () => window.clearInterval(intervalId);
    }, [cachebuster]);

    return (
        <Modal
            header={{
                label: 'Ny oppdatering',
                heading: 'Utdatert web applikasjon',
                closeButton: false,
            }}
            open={isOutdated}
            onClose={() => setIsOutdated(false)}
        >
            <Modal.Body>
                <Alert variant="warning">
                    Det er kommet en ny versjon av applikasjonen. Nettsida vil automatisk laste på nytt om 2 minutter
                    for å hente inn den nyeste versjonen. Har du endringer du ønsker å lagre først? Trykk på
                    avbryt-knappen.
                </Alert>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setIsOutdated(false)}>
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
