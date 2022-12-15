import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Button, Heading, Modal, TextField } from '@navikt/ds-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import * as DeveloperActions from '~src/features/DeveloperActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';

import styles from './DevTools.module.less';
const DevToolsPage = () => {
    const [nySøknadModalÅpen, setNySøknadModalÅpen] = useState<boolean>(false);

    return (
        <div className={styles.pageContainer}>
            <Heading size="medium">Velg en handling</Heading>

            <div className={styles.handlingsContainer}>
                <Button variant="secondary" type="button" onClick={() => setNySøknadModalÅpen(true)}>
                    Ny søknad
                </Button>
            </div>

            {nySøknadModalÅpen && (
                <NySøknadModal åpen={nySøknadModalÅpen} onClose={() => setNySøknadModalÅpen(false)} />
            )}
        </div>
    );
};

const NySøknadModal = (props: { åpen: boolean; onClose: () => void }) => {
    const navigate = useNavigate();
    const [nySøknadStatus, lagNySøknad] = useAsyncActionCreator(DeveloperActions.sendUføresøknad);
    const [fnr, setFnr] = useState<Nullable<string>>(null);

    return (
        <Modal open={props.åpen} onClose={props.onClose}>
            <Modal.Content>
                <Heading size="medium" spacing>
                    Ny uføre søknad
                </Heading>
                <form className={styles.nySøknadForm}>
                    <TextField
                        label={'Skriv inn fødselsnummer'}
                        onChange={(e) => setFnr(e.target.value)}
                        description={
                            <div>
                                <BodyShort>Lager ny sak dersom det ikke eksisterer en fra før</BodyShort>
                                <BodyShort>
                                    Ved lokal utvikling blir det satt et tilfeldig (mest sannsynlig ugyldig fnr) dersom
                                    det ikke blir sendt med fnr
                                </BodyShort>
                            </div>
                        }
                    />

                    <Button
                        type="button"
                        loading={RemoteData.isPending(nySøknadStatus)}
                        onClick={() =>
                            lagNySøknad({ fnr: fnr }, (res) => {
                                navigate(Routes.saksoversiktValgtSak.createURL({ sakId: res.søknad.sakId }));
                            })
                        }
                    >
                        Send inn
                    </Button>
                </form>
                {RemoteData.isFailure(nySøknadStatus) && <ApiErrorAlert error={nySøknadStatus.error} />}
            </Modal.Content>
        </Modal>
    );
};

export default DevToolsPage;
