import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Label, Loader, Modal, Select, TextField } from '@navikt/ds-react';
import { useEffect, useState } from 'react';

import { ApiError } from '~src/api/apiClient';
import {
    fetchBakoverStatus,
    patchSøknader,
    SøknadResponse,
    konsistensavstemming,
    grensesnittsavstemming,
    stønadsmottakere,
    ferdigstillVedtak,
} from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import Nøkkeltall from '~src/pages/saksbehandling/behandlingsoversikt/nøkkeltall/Nøkkeltall';
import { toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import Gregulering from './components/G-regulering';
import ResendStatistikk from './components/statistikk/Statistikk';
import { SøknadTabellDrift } from './components/SøknadTabell';
import SendUtbetalingsIder from './components/utbetalingslinjer/SendUtbetalingslinjer';
import styles from './index.module.less';

enum Knapp {
    FIX_SØKNADER,
    KAST_EN_FEIL,
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

    const [stønadsmottakereModal, setStønadsmottakereModal] = useState<boolean>(false);

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
            {stønadsmottakereModal && (
                <StønadsmottakereModal open={stønadsmottakereModal} onClose={() => setStønadsmottakereModal(false)} />
            )}

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
                        onClick={() => {
                            throw Error('Feil som ble trigget manuelt fra driftssiden');
                        }}
                    >
                        Kast en feil
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

                    <Button
                        variant="secondary"
                        className={styles.knapp}
                        type="button"
                        onClick={() => settKnappTrykket(Knapp.NØKKELTALL)}
                    >
                        Nøkkeltall
                    </Button>

                    <Button
                        variant="secondary"
                        className={styles.knapp}
                        type="button"
                        onClick={() => setStønadsmottakereModal(true)}
                    >
                        Stønadsmottakere
                    </Button>

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
        <Modal open={props.open} onClose={props.onClose}>
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

const StønadsmottakereModal = (props: { open: boolean; onClose: () => void }) => {
    const [stønadsmottakereStatus, hentStønadsmottakere] = useApiCall(stønadsmottakere);

    return (
        <Modal open={props.open} onClose={props.onClose}>
            <Modal.Body>
                <div>
                    <Heading size="medium" spacing>
                        stønadsmottakere
                    </Heading>
                    <Button onClick={() => hentStønadsmottakere({})}>Hent stønadsmottakere</Button>

                    {RemoteData.isSuccess(stønadsmottakereStatus) && (
                        <div>
                            <Label as="p">For dato: {stønadsmottakereStatus.value.dato}</Label>
                            <Label as="p">Antall: {stønadsmottakereStatus.value.fnr.length}</Label>
                            <Label as="p">Fødselsnummere: </Label>
                            <ul>
                                {stønadsmottakereStatus.value.fnr.map((s) => (
                                    <li key={s}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default Drift;
