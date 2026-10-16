import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Heading, Modal } from '@navikt/ds-react';
import { useState } from 'react';
import { kjørUlfApiTest } from '~src/api/driftApi.ts';
import { useApiCall } from '~src/lib/hooks.ts';
import sharedStyles from '~src/pages/drift/index.module.less';

export const UlfApiDrift = () => {
    const [visModal, setVisModal] = useState(false);

    return (
        <div>
            <Button className={sharedStyles.knapp} variant="secondary" type="button" onClick={() => setVisModal(true)}>
                Ulf api testing
            </Button>
            {visModal && <UlfApiDriftModal open={visModal} onClose={() => setVisModal(false)} />}
        </div>
    );
};

const UlfApiDriftModal = (props: { open: boolean; onClose: () => void }) => {
    const [kjørUlfApiTestKallStatus, kjørUlfApiTestKall] = useApiCall(kjørUlfApiTest);

    const testApi = () => kjørUlfApiTestKall({});

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            header={{ heading: 'Ulf api testing' }}
            aria-describedby="ulf-api-test"
        >
            <Heading level={'2'} size={'medium'}>
                Tester ulf api sjekk network
            </Heading>
            <Button onClick={testApi}>Kjør</Button>
            {RemoteData.isPending(kjørUlfApiTestKallStatus) && <p>Kjører..</p>}
            {RemoteData.isSuccess(kjørUlfApiTestKallStatus) && <p>OK!</p>}
            {RemoteData.isFailure(kjørUlfApiTestKallStatus) && <p>FEIL!</p>}
        </Modal>
    );
};
