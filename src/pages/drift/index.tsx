import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader, Modal, Select, TextField } from '@navikt/ds-react';
import { useEffect, useState } from 'react';

import { ApiError } from '~src/api/apiClient';
import {
    ferdigstillVedtak,
    fetchBakoverStatus,
    grensesnittsavstemming,
    konsistensavstemming,
    patchSøknader,
    SøknadResponse,
} from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import KontrollsamtaleOversikt from '~src/pages/drift/components/KontrollsamtaleOversikt.tsx';
import SakStatistikk from '~src/pages/drift/components/SakStatistikk.tsx';
import StønadStatistikk from '~src/pages/drift/components/StønadStatistikk.tsx';
import Nøkkeltall from '~src/pages/saksbehandling/behandlingsoversikt/nøkkeltall/Nøkkeltall';
import { toIsoDateOnlyString } from '~src/utils/date/dateUtils';
import DokumentDistribusjon from './components/dokument/DokumentDistribusjon';
import Fradragssjekk from './components/fradragssjekk/Fradragssjekk';
import Personhendelser from './components/personhendelser/Personhendelser';
import ResendStatistikk from './components/ResendStatistikk.tsx';
import Gregulering from './components/regulering/G-regulering';
import { SøknadTabellDrift } from './components/SøknadTabell';
import Stønadsmottakere from './components/stønadsmottakere/Stønadsmottakere';
import SendUtbetalingsIder from './components/utbetalingslinjer/SendUtbetalingslinjer';
import styles from './index.module.less';

enum Knapp {
    FIX_SØKNADER,
    GRENSESNITTSAVSTEMMING,
    KONSISTENSAVSTEMMING,
    G_REGULERING,
    NØKKELTALL,
}

const Drift = () => {
    const [knappTrykket, settKnappTrykket] = useState<Nullable<Knapp>>();
    const [statusBakover, setStatusBakover] = useState<RemoteData.RemoteData<ApiError, string>>(RemoteData.initial);
    useEffect(() => {
        const hentStatus = async () => {
            const resultat = await fetchBakoverStatus();
            if (resultat.status === 'ok') {
                setStatusBakover(RemoteData.success(resultat.data));
            } else {
                setStatusBakover(RemoteData.failure(resultat.error));
            }
        };
        hentStatus();
    }, []);

    const [vilFikseVedtak, setVilFikseVedtak] = useState<boolean>(false);

    const [fixSøknaderResponse, setfixSøknaderResponse] = useState<RemoteData.RemoteData<ApiError, SøknadResponse>>(
        RemoteData.initial,
    );

    const fixSøknader = async () => {
        settKnappTrykket(Knapp.FIX_SØKNADER);
        const resultat = await patchSøknader();
        if (resultat.status === 'ok') {
            setfixSøknaderResponse(RemoteData.success(resultat.data));
        } else {
            setfixSøknaderResponse(RemoteData.failure(resultat.error));
        }
    };

    const [grensesnittsavstemmingModalOpen, setGrensesnittsavstemmingModalOpen] = useState(false);
    const [grensesnittsavtemmingFraOgMed, setGrensesnittsavtemmingFraOgMed] = useState<Nullable<Date>>(new Date());
    const [grensesnittsavtemmingTilOgMed, setGrensesnittsavtemmingTilOgMed] = useState<Nullable<Date>>(new Date());
    const [grensesnittsavstemmingStatus, fetchGrensesnittsavstemming] = useApiCall(grensesnittsavstemming);
    const [grensesnittsavstemmingFagområde, setGrensesnittsavstemmingFagområde] = useState<string>('SUUFORE');

    const [konsistensavtemmingModalOpen, setKonsistensavtemmingModalOpen] = useState(false);
    const [konsistensavstemmingFraOgMed, setKonsistensavstemmingFraOgMed] = useState<Nullable<Date>>(new Date());
    const [konsistensavstemmingStatus, fetchKonsistensavstemming] = useApiCall(konsistensavstemming);
    const [konsistensavstemmingFagområde, setKonsistensavstemmingFagområde] = useState<string>('SUUFORE');

    return (
        <div className={styles.container}>
            {vilFikseVedtak && <VilFikseVedtakModal open={vilFikseVedtak} onClose={() => setVilFikseVedtak(false)} />}

            <div>
                <h1>Drift</h1>
            </div>

            <div>
                <h1>Status</h1>
                <div className={styles.statusContainer}>
                    {RemoteData.isSuccess(statusBakover) ? (
                        <Alert className={styles.alert} variant="success">
                            Bakover er oppe
                        </Alert>
                    ) : (
                        <Alert className={styles.alert} variant="error">
                            Bakover er nede
                        </Alert>
                    )}
                </div>
            </div>
            <h1>Actions</h1>
            <div>
                <div className={styles.actionsContainer}>
                    <Button variant="secondary" className={styles.knapp} type="button" onClick={fixSøknader}>
                        Fix Søknader
                        {RemoteData.isPending(fixSøknaderResponse) && <Loader />}
                    </Button>

                    <Button
                        variant="secondary"
                        className={styles.knapp}
                        type="button"
                        onClick={() => setGrensesnittsavstemmingModalOpen(true)}
                    >
                        Grensesnittsavstemming
                        {RemoteData.isPending(grensesnittsavstemmingStatus) && <Loader />}
                    </Button>
                    <Modal
                        open={grensesnittsavstemmingModalOpen}
                        onClose={() => {
                            setGrensesnittsavstemmingModalOpen(false);
                        }}
                        aria-label="grensesnittavstemming"
                    >
                        <Modal.Body>
                            <div className={styles.modalContainer}>
                                <DatePicker
                                    label={''}
                                    value={grensesnittsavtemmingFraOgMed}
                                    onChange={(date) => {
                                        setGrensesnittsavtemmingFraOgMed(date);
                                    }}
                                />
                                <DatePicker
                                    label={''}
                                    value={grensesnittsavtemmingTilOgMed}
                                    onChange={(date) => {
                                        setGrensesnittsavtemmingTilOgMed(date);
                                    }}
                                />
                                <Select
                                    label={'Fagområde'}
                                    value={grensesnittsavstemmingFagområde}
                                    onChange={(e) => setGrensesnittsavstemmingFagområde(e.target.value)}
                                >
                                    <option value="SUUFORE">{'UFØRE'}</option>
                                    <option value="SUALDER">{'ALDER'}</option>
                                </Select>
                                <Button
                                    variant="secondary"
                                    className={styles.knapp}
                                    type="button"
                                    onClick={() => {
                                        settKnappTrykket(Knapp.GRENSESNITTSAVSTEMMING);
                                        fetchGrensesnittsavstemming({
                                            fraOgMed: toIsoDateOnlyString(grensesnittsavtemmingFraOgMed!),
                                            tilOgMed: toIsoDateOnlyString(grensesnittsavtemmingTilOgMed!),
                                            fagområde: grensesnittsavstemmingFagområde,
                                        });
                                    }}
                                >
                                    Grensesnittsavstemming
                                    {RemoteData.isPending(grensesnittsavstemmingStatus) && <Loader />}
                                </Button>
                            </div>
                        </Modal.Body>
                    </Modal>
                    <Button
                        variant="secondary"
                        className={styles.knapp}
                        type="button"
                        onClick={() => setKonsistensavtemmingModalOpen(true)}
                    >
                        Konsistensavstemming
                        {RemoteData.isPending(konsistensavstemmingStatus) && <Loader />}
                    </Button>
                    <Modal
                        open={konsistensavtemmingModalOpen}
                        onClose={() => {
                            setKonsistensavtemmingModalOpen(false);
                        }}
                        aria-label="konsistensavstemming"
                    >
                        <Modal.Body>
                            <div className={styles.modalContainer}>
                                <DatePicker
                                    label={''}
                                    value={konsistensavstemmingFraOgMed}
                                    onChange={(date) => {
                                        setKonsistensavstemmingFraOgMed(date);
                                    }}
                                />
                                <Select
                                    label={'Fagområde'}
                                    value={konsistensavstemmingFagområde}
                                    onChange={(e) => setKonsistensavstemmingFagområde(e.target.value)}
                                >
                                    <option value="SUUFORE">{'UFØRE'}</option>
                                    <option value="SUALDER">{'ALDER'}</option>
                                </Select>
                                <Button
                                    variant="secondary"
                                    className={styles.knapp}
                                    type="button"
                                    onClick={() => {
                                        settKnappTrykket(Knapp.KONSISTENSAVSTEMMING);
                                        fetchKonsistensavstemming({
                                            fraOgMed: toIsoDateOnlyString(konsistensavstemmingFraOgMed!),
                                            fagområde: konsistensavstemmingFagområde,
                                        });
                                    }}
                                >
                                    Konsistensavstemming
                                    {RemoteData.isPending(konsistensavstemmingStatus) && <Loader />}
                                </Button>
                            </div>
                        </Modal.Body>
                    </Modal>
                    <Gregulering />
                    <Fradragssjekk />
                    <Personhendelser />
                    <Stønadsmottakere />
                    <DokumentDistribusjon />

                    <Button
                        variant="secondary"
                        className={styles.knapp}
                        type="button"
                        onClick={() => settKnappTrykket(Knapp.NØKKELTALL)}
                    >
                        Nøkkeltall
                    </Button>

                    <SakStatistikk />
                    <StønadStatistikk />

                    <ResendStatistikk />

                    <Button
                        variant="secondary"
                        className={styles.knapp}
                        type="button"
                        onClick={() => setVilFikseVedtak(true)}
                    >
                        Fiks vedtak
                    </Button>
                    <SendUtbetalingsIder />

                    <KontrollsamtaleOversikt />
                </div>
                {knappTrykket === Knapp.FIX_SØKNADER && RemoteData.isFailure(fixSøknaderResponse) && (
                    <Alert className={styles.alert} variant="error">
                        <p>Fix Søknader feilet</p>
                        {fixSøknaderResponse.error.statusCode}
                        <p>
                            {fixSøknaderResponse.error.body?.message ?? JSON.stringify(fixSøknaderResponse.error.body)}
                        </p>
                    </Alert>
                )}
                <div className={styles.tabellContainer}>
                    {knappTrykket === Knapp.FIX_SØKNADER && RemoteData.isSuccess(fixSøknaderResponse) && (
                        <div>
                            <SøknadTabellDrift søknadResponse={fixSøknaderResponse.value} />
                        </div>
                    )}
                    {knappTrykket === Knapp.KONSISTENSAVSTEMMING &&
                        RemoteData.isSuccess(konsistensavstemmingStatus) && (
                            <Alert className={styles.alert} variant="success">
                                <p>{JSON.stringify(konsistensavstemmingStatus.value)}</p>
                            </Alert>
                        )}
                </div>
                {knappTrykket === Knapp.NØKKELTALL && <Nøkkeltall />}
            </div>
        </div>
    );
};

const VilFikseVedtakModal = (props: { open: boolean; onClose: () => void }) => {
    const [ferdigstillStatus, ferdigstill] = useApiCall(ferdigstillVedtak);
    const [vedtakId, setVedtakId] = useState<string>('');
    return (
        <Modal open={props.open} onClose={props.onClose} aria-label={'Ferdigstill'}>
            <Modal.Body>
                <div>
                    <Heading size="medium" spacing>
                        Ferdigstill
                    </Heading>
                    <TextField label={'vedtak id'} onChange={(v) => setVedtakId(v.target.value)} />
                    <Button onClick={() => ferdigstill({ vedtakId: vedtakId })}>Ferdigstill vedtak</Button>
                    {RemoteData.isSuccess(ferdigstillStatus) && <p>Nice 👍🤌</p>}

                    {RemoteData.isFailure(ferdigstillStatus) && <ApiErrorAlert error={ferdigstillStatus.error} />}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default Drift;
