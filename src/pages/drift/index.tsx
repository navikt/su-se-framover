import * as RemoteData from '@devexperts/remote-data-ts';
import {
    Alert,
    BodyShort,
    Button,
    ExpansionCard,
    Heading,
    Loader,
    Modal,
    Page,
    Select,
    Tag,
    TextField,
    VStack,
} from '@navikt/ds-react';
import { useCallback, useEffect, useState } from 'react';

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
import SupstønadHistorisk from './components/historisk/SupstønadHistorisk';
import JobbOversikt from './components/jobber/JobbOversikt';
import Personhendelser from './components/personhendelser/Personhendelser';
import ResendStatistikk from './components/ResendStatistikk.tsx';
import Gregulering from './components/regulering/G-regulering';
import { SøknadTabellDrift } from './components/SøknadTabell';
import Stønadsmottakere from './components/stønadsmottakere/Stønadsmottakere';
import SendUtbetalingsIder from './components/utbetalingslinjer/SendUtbetalingslinjer';
import styles from './index.module.less';
import Statistikk from './statistikk/Statistikk';

enum Knapp {
    FIX_SØKNADER,
    GRENSESNITTSAVSTEMMING,
    KONSISTENSAVSTEMMING,
    G_REGULERING,
    NØKKELTALL,
}

const Drift = () => {
    const [knappTrykket, settKnappTrykket] = useState<Nullable<Knapp>>();
    const [statusBakover, setStatusBakover] = useState<RemoteData.RemoteData<ApiError, string>>(RemoteData.pending);
    const hentStatus = useCallback(async () => {
        setStatusBakover(RemoteData.pending);
        const resultat = await fetchBakoverStatus();
        if (resultat.status === 'ok') {
            setStatusBakover(RemoteData.success(resultat.data));
        } else {
            setStatusBakover(RemoteData.failure(resultat.error));
        }
    }, []);

    useEffect(() => {
        void hentStatus();
    }, [hentStatus]);

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
        <Page.Block as="main" width="xl" gutters className={styles.side}>
            <VStack gap={{ xs: '6', md: '8' }}>
                {vilFikseVedtak && (
                    <VilFikseVedtakModal open={vilFikseVedtak} onClose={() => setVilFikseVedtak(false)} />
                )}

                <header>
                    <Heading level="1" size="xlarge">
                        Drift
                    </Heading>
                    <BodyShort className={styles.innledning}>
                        Følg systemstatus og statistikk, eller start avgrensede driftsoppgaver.
                    </BodyShort>
                </header>

                <div className={styles.statusContainer} aria-live="polite">
                    {RemoteData.isPending(statusBakover) || RemoteData.isInitial(statusBakover) ? (
                        <>
                            <Tag variant="info">Bakover: Kontrollerer status</Tag>
                            <Button size="small" variant="tertiary" loading>
                                Oppdater
                            </Button>
                        </>
                    ) : RemoteData.isSuccess(statusBakover) ? (
                        <>
                            <Tag variant="success">Bakover: Tilgjengelig</Tag>
                            <Button size="small" variant="tertiary" onClick={() => void hentStatus()}>
                                Oppdater
                            </Button>
                        </>
                    ) : (
                        <>
                            <Tag variant="error">Bakover: Utilgjengelig</Tag>
                            <Button size="small" variant="tertiary" onClick={() => void hentStatus()}>
                                Prøv igjen
                            </Button>
                        </>
                    )}
                </div>

                <ExpansionCard aria-label="Driftsoppgaver">
                    <ExpansionCard.Header>
                        <ExpansionCard.Title as="h2" size="medium">
                            Driftsoppgaver
                        </ExpansionCard.Title>
                        <ExpansionCard.Description>
                            Avstemming, statistikkjobber, vedlikehold og retting.
                        </ExpansionCard.Description>
                    </ExpansionCard.Header>
                    <ExpansionCard.Content>
                        <VStack gap="6">
                            <section>
                                <Heading level="3" size="small" spacing>
                                    Avstemming og kontroll
                                </Heading>
                                <div className={styles.actionsContainer}>
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={() => setGrensesnittsavstemmingModalOpen(true)}
                                    >
                                        Grensesnittsavstemming
                                        {RemoteData.isPending(grensesnittsavstemmingStatus) && <Loader />}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={() => setKonsistensavtemmingModalOpen(true)}
                                    >
                                        Konsistensavstemming
                                        {RemoteData.isPending(konsistensavstemmingStatus) && <Loader />}
                                    </Button>
                                    <Fradragssjekk />
                                    <KontrollsamtaleOversikt />
                                </div>
                            </section>

                            <section>
                                <Heading level="3" size="small" spacing>
                                    Statistikk og oversikter
                                </Heading>
                                <div className={styles.actionsContainer}>
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        onClick={() => settKnappTrykket(Knapp.NØKKELTALL)}
                                    >
                                        Nøkkeltall
                                    </Button>
                                    <SakStatistikk />
                                    <StønadStatistikk />
                                    <ResendStatistikk />
                                    <Stønadsmottakere />
                                </div>
                            </section>

                            <section>
                                <Heading level="3" size="small" spacing>
                                    Vedlikehold og retting
                                </Heading>
                                <div className={styles.actionsContainer}>
                                    <Button variant="secondary" type="button" onClick={fixSøknader}>
                                        Fix Søknader
                                        {RemoteData.isPending(fixSøknaderResponse) && <Loader />}
                                    </Button>
                                    <Gregulering />
                                    <Personhendelser />
                                    <SupstønadHistorisk />
                                    <DokumentDistribusjon />
                                    <Button variant="secondary" type="button" onClick={() => setVilFikseVedtak(true)}>
                                        Fiks vedtak
                                    </Button>
                                    <SendUtbetalingsIder />
                                </div>
                            </section>

                            <Modal
                                open={grensesnittsavstemmingModalOpen}
                                onClose={() => setGrensesnittsavstemmingModalOpen(false)}
                                aria-label="grensesnittavstemming"
                            >
                                <Modal.Body>
                                    <div className={styles.modalContainer}>
                                        <DatePicker
                                            label="Fra og med"
                                            value={grensesnittsavtemmingFraOgMed}
                                            onChange={setGrensesnittsavtemmingFraOgMed}
                                        />
                                        <DatePicker
                                            label="Til og med"
                                            value={grensesnittsavtemmingTilOgMed}
                                            onChange={setGrensesnittsavtemmingTilOgMed}
                                        />
                                        <Select
                                            label="Fagområde"
                                            value={grensesnittsavstemmingFagområde}
                                            onChange={(event) => setGrensesnittsavstemmingFagområde(event.target.value)}
                                        >
                                            <option value="SUUFORE">Uføre</option>
                                            <option value="SUALDER">Alder</option>
                                        </Select>
                                        <Button
                                            variant="secondary"
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
                                        </Button>
                                    </div>
                                </Modal.Body>
                            </Modal>

                            <Modal
                                open={konsistensavtemmingModalOpen}
                                onClose={() => setKonsistensavtemmingModalOpen(false)}
                                aria-label="konsistensavstemming"
                            >
                                <Modal.Body>
                                    <div className={styles.modalContainer}>
                                        <DatePicker
                                            label="Fra og med"
                                            value={konsistensavstemmingFraOgMed}
                                            onChange={setKonsistensavstemmingFraOgMed}
                                        />
                                        <Select
                                            label="Fagområde"
                                            value={konsistensavstemmingFagområde}
                                            onChange={(event) => setKonsistensavstemmingFagområde(event.target.value)}
                                        >
                                            <option value="SUUFORE">Uføre</option>
                                            <option value="SUALDER">Alder</option>
                                        </Select>
                                        <Button
                                            variant="secondary"
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
                                        </Button>
                                    </div>
                                </Modal.Body>
                            </Modal>

                            {knappTrykket === Knapp.FIX_SØKNADER && RemoteData.isFailure(fixSøknaderResponse) && (
                                <Alert variant="error">
                                    <p>Fix Søknader feilet</p>
                                    {fixSøknaderResponse.error.statusCode}
                                    <p>
                                        {fixSøknaderResponse.error.body?.message ??
                                            JSON.stringify(fixSøknaderResponse.error.body)}
                                    </p>
                                </Alert>
                            )}
                            <div className={styles.tabellContainer}>
                                {knappTrykket === Knapp.FIX_SØKNADER && RemoteData.isSuccess(fixSøknaderResponse) && (
                                    <SøknadTabellDrift søknadResponse={fixSøknaderResponse.value} />
                                )}
                                {knappTrykket === Knapp.KONSISTENSAVSTEMMING &&
                                    RemoteData.isSuccess(konsistensavstemmingStatus) && (
                                        <Alert variant="success">
                                            <p>{JSON.stringify(konsistensavstemmingStatus.value)}</p>
                                        </Alert>
                                    )}
                            </div>
                            {knappTrykket === Knapp.NØKKELTALL && <Nøkkeltall />}
                        </VStack>
                    </ExpansionCard.Content>
                </ExpansionCard>

                <JobbOversikt />
                <Statistikk />
            </VStack>
        </Page.Block>
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
