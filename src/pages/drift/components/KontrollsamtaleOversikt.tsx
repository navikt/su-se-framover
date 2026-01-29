import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Heading, Loader, Modal, Textarea } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { hentKontrollsamtaleoversikt } from '~src/api/kontrollsamtalerOversiktApi.ts';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert.tsx';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks.ts';
import { formatDate } from '~src/utils/date/dateUtils.ts';
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
                                    <div>
                                        <Heading size={'xsmall'}>
                                            Antall innkallinger denne måned (
                                            {formatDate(kontrollSamtaleoversikt.utgåttMåned.frist.toString())}):
                                        </Heading>
                                        <div>{kontrollSamtaleoversikt.utgåttMåned.antallInnkallinger}</div>
                                    </div>
                                    <div>
                                        <Heading size={'xsmall'}>
                                            Antall innkallinger måned som var (
                                            {formatDate(kontrollSamtaleoversikt.inneværendeMåned.frist.toString())}):{' '}
                                        </Heading>
                                        <div>{kontrollSamtaleoversikt.inneværendeMåned.antallInnkallinger}</div>
                                    </div>
                                    <div>
                                        <Heading size={'xsmall'}>Antall som har ført til stans </Heading>
                                        <div>{kontrollSamtaleoversikt.inneværendeMåned.sakerMedStans.length}</div>
                                    </div>
                                    <div>
                                        <Heading size={'xsmall'}>Saker:</Heading>
                                        <Textarea label={undefined}>
                                            {kontrollSamtaleoversikt.inneværendeMåned.sakerMedStans.join(',\n')}
                                        </Textarea>
                                    </div>
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
