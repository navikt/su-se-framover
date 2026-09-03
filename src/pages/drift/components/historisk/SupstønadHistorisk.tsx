import * as RemoteData from '@devexperts/remote-data-ts';
import { ArrowsCirclepathIcon, TrashIcon } from '@navikt/aksel-icons';
import {
    Alert,
    BodyShort,
    Button,
    Heading,
    HStack,
    Loader,
    Modal,
    Table,
    Tabs,
    Tag,
    TextField,
} from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { ApiError } from '~src/api/apiClient';
import {
    HistoriskImportOversikt,
    hentHistoriskeImporter,
    hentUttrekkSupstønadHistorisk,
    ImportStatus,
    konverterImport,
    slettHistoriskImport,
    startHistoriskImport,
    tellRaderSupstønadHistorisk,
} from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { useApiCall } from '~src/lib/hooks';
import { formatDateTime } from '~src/utils/date/dateUtils';

import styles from './SupstønadHistorisk.module.less';

const SupstønadHistorisk = () => {
    const [visModal, setVisModal] = useState(false);

    return (
        <div>
            <Button variant="secondary" type="button" onClick={() => setVisModal(true)}>
                Stønadshistorisk
            </Button>
            {visModal && <SupstønadHistoriskModal visModal={visModal} onClose={() => setVisModal(false)} />}
        </div>
    );
};

const SupstønadHistoriskModal = (props: { visModal: boolean; onClose: () => void }) => {
    const [hentImporterStatus, hentImporterCall] = useApiCall(hentHistoriskeImporter);
    const [importer, setImporter] = useState<HistoriskImportOversikt[]>([]);
    const [harLastet, setHarLastet] = useState(false);

    const hentImporter = () => {
        hentImporterCall(undefined, (data) => {
            setImporter(data);
            setHarLastet(true);
        });
    };

    useEffect(() => {
        hentImporter();
    }, []);

    return (
        <Modal
            className={styles.modal}
            open={props.visModal}
            onClose={props.onClose}
            header={{ heading: 'Stønadshistorisk' }}
        >
            <Modal.Body>
                <Tabs defaultValue="oversikt">
                    <Tabs.List>
                        <Tabs.Tab value="oversikt" label="Oversikt" />
                        <Tabs.Tab value="diagnostikk" label="Diagnostikk" />
                    </Tabs.List>
                    <Tabs.Panel value="oversikt" className={styles.tabPanel}>
                        <ImportOversikt
                            importer={importer}
                            harLastet={harLastet}
                            laster={RemoteData.isPending(hentImporterStatus)}
                            feil={RemoteData.isFailure(hentImporterStatus) ? hentImporterStatus.error : null}
                            hentImporter={hentImporter}
                        />
                    </Tabs.Panel>
                    <Tabs.Panel value="diagnostikk" className={styles.tabPanel}>
                        <TellRaderPanel />
                    </Tabs.Panel>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

const statusTagVariant = (status: ImportStatus): 'success' | 'warning' | 'error' => {
    switch (status) {
        case 'FULLFØRT':
            return 'success';
        case 'PÅGÅR':
            return 'warning';
        case 'FEILET':
            return 'error';
    }
};

const ImportOversikt = (props: {
    importer: HistoriskImportOversikt[];
    harLastet: boolean;
    laster: boolean;
    feil: ApiError | null;
    hentImporter: () => void;
}) => {
    const { laster, feil, hentImporter } = props;
    const [startImportStatus, startImport, resetStartImportStatus] = useApiCall(startHistoriskImport);
    const [bekreftStart, setBekreftStart] = useState(false);

    const handleStartImport = () => {
        startImport(undefined, () => {
            setBekreftStart(false);
            resetStartImportStatus();
            hentImporter();
        });
    };

    return (
        <div className={styles.oversiktContainer}>
            <HStack gap="4" align="center">
                {!bekreftStart ? (
                    <Button variant="secondary" size="small" onClick={() => setBekreftStart(true)}>
                        Start import
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="danger"
                            size="small"
                            onClick={handleStartImport}
                            loading={RemoteData.isPending(startImportStatus)}
                        >
                            Bekreft start
                        </Button>
                        <Button
                            variant="tertiary"
                            size="small"
                            onClick={() => {
                                setBekreftStart(false);
                                resetStartImportStatus();
                            }}
                        >
                            Avbryt
                        </Button>
                    </>
                )}
                <Button variant="tertiary" size="small" onClick={() => hentImporter()} loading={laster}>
                    <ArrowsCirclepathIcon aria-hidden />
                    Oppdater
                </Button>
            </HStack>
            {RemoteData.isSuccess(startImportStatus) && (
                <Alert variant="success" size="small">
                    Import startet.
                </Alert>
            )}
            {RemoteData.isFailure(startImportStatus) && <ApiErrorAlert error={startImportStatus.error} />}
            {feil && !props.harLastet && <ApiErrorAlert error={feil} />}
            <ImportTabell importer={props.importer} harLastet={props.harLastet} hentImporter={hentImporter} />
        </div>
    );
};

const ImportTabell = (props: { importer: HistoriskImportOversikt[]; harLastet: boolean; hentImporter: () => void }) => {
    const { importer, harLastet, hentImporter } = props;

    if (!harLastet) {
        return <Loader />;
    }

    if (importer.length === 0) {
        return <BodyShort>Ingen importer funnet.</BodyShort>;
    }

    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Opprettet</Table.HeaderCell>
                    <Table.HeaderCell>Fullført</Table.HeaderCell>
                    <Table.HeaderCell>Fremdrift</Table.HeaderCell>
                    <Table.HeaderCell>Tabeller</Table.HeaderCell>
                    <Table.HeaderCell>Feilbeskrivelse</Table.HeaderCell>
                    <Table.HeaderCell />
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {importer.map((i) => (
                    <ImportRad key={i.id} import_={i} onSlettet={() => hentImporter()} />
                ))}
            </Table.Body>
        </Table>
    );
};

const ImportRad = (props: { import_: HistoriskImportOversikt; onSlettet: () => void }) => {
    const { import_, onSlettet } = props;
    const [bekreftSlett, setBekreftSlett] = useState(false);
    const [slettStatus, slett, resetSlettStatus] = useApiCall(slettHistoriskImport);

    const [startKonverteringStatus, startKonvertering] = useApiCall(konverterImport);

    const kanSlettes = import_.status !== 'PÅGÅR';
    const kanKonverteres = import_.status === 'FULLFØRT';

    const handleSlett = () => {
        slett({ importId: import_.id }, () => {
            setBekreftSlett(false);
            resetSlettStatus();
            onSlettet();
        });
    };

    return (
        <Table.Row>
            <Table.DataCell>
                <Tag variant={statusTagVariant(import_.status)} size="small">
                    {import_.status}
                </Tag>
                {kanKonverteres && (
                    <div>
                        <Button
                            variant="danger"
                            size="small"
                            onClick={() => startKonvertering({ importId: import_.id })}
                            loading={RemoteData.isPending(startKonverteringStatus)}
                        >
                            Konverter import
                        </Button>
                        {RemoteData.isSuccess(startKonverteringStatus) && (
                            <Alert variant="success" size="small">
                                Konvertering startet.
                            </Alert>
                        )}
                        {RemoteData.isFailure(startKonverteringStatus) && (
                            <ApiErrorAlert error={startKonverteringStatus.error} />
                        )}
                    </div>
                )}
            </Table.DataCell>
            <Table.DataCell>{formatDateTime(import_.opprettet)}</Table.DataCell>
            <Table.DataCell>{import_.fullført ? formatDateTime(import_.fullført) : '–'}</Table.DataCell>
            <Table.DataCell>
                {import_.totaltImportertAntall.toLocaleString('nb-NO')} /{' '}
                {import_.totaltForventetAntall.toLocaleString('nb-NO')} rader
            </Table.DataCell>
            <Table.DataCell>{import_.tabeller.length} tabeller</Table.DataCell>
            <Table.DataCell className={styles.feilbeskrivelseCell}>
                {import_.feilbeskrivelse && (
                    <Alert variant="error" size="small" inline>
                        {import_.feilbeskrivelse}
                    </Alert>
                )}
            </Table.DataCell>
            <Table.DataCell>
                {kanSlettes && !bekreftSlett && (
                    <Button
                        variant="tertiary"
                        size="small"
                        onClick={() => setBekreftSlett(true)}
                        aria-label="Slett import"
                    >
                        <TrashIcon aria-hidden />
                    </Button>
                )}
                {kanSlettes && bekreftSlett && (
                    <div className={styles.bekreftSlettContainer}>
                        <Button
                            variant="danger"
                            size="small"
                            onClick={handleSlett}
                            loading={RemoteData.isPending(slettStatus)}
                        >
                            Bekreft
                        </Button>
                        <Button
                            variant="tertiary"
                            size="small"
                            onClick={() => {
                                setBekreftSlett(false);
                                resetSlettStatus();
                            }}
                        >
                            Avbryt
                        </Button>
                        {RemoteData.isFailure(slettStatus) && <ApiErrorAlert error={slettStatus.error} />}
                    </div>
                )}
            </Table.DataCell>
        </Table.Row>
    );
};

const TellRaderPanel = () => {
    const [tabellnavn, setTabellnavn] = useState('');
    const [antallRader, setAntallRader] = useState('');
    const [iterator, setIterator] = useState('');
    const [tellRaderStatus, tellRader] = useApiCall(tellRaderSupstønadHistorisk);
    const [hentUttrekkStatus, hentUttrekk] = useApiCall(hentUttrekkSupstønadHistorisk);

    const handleSubmit = () => {
        if (!tabellnavn.trim()) {
            return;
        }
        tellRader({ tabellnavn: tabellnavn.trim() });
    };

    const handleHentUttrekkSubmit = () => {
        const antall = Number(antallRader);
        if (!tabellnavn.trim() || !antallRader.trim() || antall <= 0) {
            return;
        }
        hentUttrekk({
            tabellnavn: tabellnavn.trim(),
            antallRader: antall,
            iterator: iterator.trim() || undefined,
        });
    };

    return (
        <div className={styles.diagnostikkContainer}>
            <div className={styles.diagnostikkForm}>
                <Heading level="2" size="small">
                    Tell rader
                </Heading>
                <TextField
                    label="Tabellnavn"
                    size="small"
                    value={tabellnavn}
                    onChange={(e) => setTabellnavn(e.target.value)}
                />
                <Button
                    size="small"
                    onClick={handleSubmit}
                    loading={RemoteData.isPending(tellRaderStatus)}
                    disabled={!tabellnavn.trim()}
                >
                    Tell rader
                </Button>
                {RemoteData.isSuccess(tellRaderStatus) && (
                    <Alert variant="success" size="small">
                        Antall rader: {tellRaderStatus.value.antall}
                    </Alert>
                )}
                {RemoteData.isFailure(tellRaderStatus) && <ApiErrorAlert error={tellRaderStatus.error} />}
            </div>
            <div className={styles.diagnostikkForm}>
                <Heading level="2" size="small">
                    Hent uttrekk
                </Heading>
                <TextField
                    label="Tabellnavn"
                    size="small"
                    value={tabellnavn}
                    onChange={(e) => setTabellnavn(e.target.value)}
                />
                <TextField
                    label="Antall rader"
                    size="small"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={antallRader}
                    onChange={(e) => setAntallRader(e.target.value)}
                />
                <TextField
                    size="small"
                    label="Iterator (valgfri)"
                    value={iterator}
                    onChange={(e) => setIterator(e.target.value)}
                />
                <Button
                    size="small"
                    onClick={handleHentUttrekkSubmit}
                    loading={RemoteData.isPending(hentUttrekkStatus)}
                    disabled={!tabellnavn.trim() || !antallRader.trim() || Number(antallRader) <= 0}
                >
                    Hent uttrekk
                </Button>
                {RemoteData.isSuccess(hentUttrekkStatus) && (
                    <Alert variant="info" size="small">
                        <pre className={styles.uttrekkResultat}>{JSON.stringify(hentUttrekkStatus.value, null, 2)}</pre>
                    </Alert>
                )}
                {RemoteData.isFailure(hentUttrekkStatus) && <ApiErrorAlert error={hentUttrekkStatus.error} />}
            </div>
        </div>
    );
};

export default SupstønadHistorisk;
