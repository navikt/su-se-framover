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
    HistoriskKonvertering,
    hentHistoriskeImporter,
    hentHistoriskeKonverteringer,
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
    const [visKonverteringer, setVisKonverteringer] = useState(false);

    const kanSlettes = import_.status !== 'PÅGÅR';

    const handleSlett = () => {
        slett({ importId: import_.id }, () => {
            setBekreftSlett(false);
            resetSlettStatus();
            onSlettet();
        });
    };

    return (
        <>
            <Table.Row>
                <Table.DataCell>
                    <Tag variant={statusTagVariant(import_.status)} size="small">
                        {import_.status}
                    </Tag>
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
                    <HStack gap="2" wrap>
                        {import_.status === 'FULLFØRT' && (
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={() => setVisKonverteringer((vises) => !vises)}
                                aria-expanded={visKonverteringer}
                            >
                                {visKonverteringer ? 'Skjul konverteringer' : 'Vis konverteringer'}
                            </Button>
                        )}
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
                    </HStack>
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
            {visKonverteringer && (
                <Table.Row>
                    <Table.DataCell colSpan={7}>
                        <Konverteringer importId={import_.id} />
                    </Table.DataCell>
                </Table.Row>
            )}
        </>
    );
};

const Konverteringer = (props: { importId: string }) => {
    const [konverteringer, setKonverteringer] = useState<HistoriskKonvertering[]>([]);
    const [maksAntallStønader, setMaksAntallStønader] = useState('100');
    const [hentStatus, hentKonverteringer] = useApiCall(hentHistoriskeKonverteringer);
    const [startStatus, startKonvertering, resetStartStatus] = useApiCall(konverterImport);

    const hent = () => {
        hentKonverteringer({ importId: props.importId }, setKonverteringer);
    };

    useEffect(() => {
        hent();
    }, []);

    const maksAntall = Number(maksAntallStønader);
    const gyldigMaksAntall = Number.isInteger(maksAntall) && maksAntall > 0;

    const start = (maks?: number) => {
        resetStartStatus();
        startKonvertering({ importId: props.importId, maksAntallStønader: maks }, () => hent());
    };

    return (
        <div className={styles.konverteringer}>
            <Heading level="3" size="small">
                Konverteringer
            </Heading>
            <Alert variant="info" size="small">
                En ordinær konvertering blir automatisk gjeldende for personoppslag når den fullføres. Dry-runs blir
                aldri gjeldende.
            </Alert>
            <HStack gap="3" align="end" wrap>
                <Button
                    variant="danger"
                    size="small"
                    onClick={() => start()}
                    loading={RemoteData.isPending(startStatus)}
                >
                    Start ordinær konvertering
                </Button>
                <TextField
                    className={styles.maksAntallFelt}
                    label="Maks antall stønader"
                    size="small"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={maksAntallStønader}
                    onChange={(event) => setMaksAntallStønader(event.target.value)}
                    error={maksAntallStønader.length > 0 && !gyldigMaksAntall ? 'Oppgi et positivt heltall' : undefined}
                />
                <Button
                    variant="secondary"
                    size="small"
                    onClick={() => start(maksAntall)}
                    loading={RemoteData.isPending(startStatus)}
                    disabled={!gyldigMaksAntall}
                >
                    Start dry-run
                </Button>
                <Button variant="tertiary" size="small" onClick={hent} loading={RemoteData.isPending(hentStatus)}>
                    <ArrowsCirclepathIcon aria-hidden />
                    Oppdater
                </Button>
            </HStack>
            {RemoteData.isSuccess(startStatus) && (
                <Alert variant="success" size="small">
                    Konvertering startet med projeksjons-ID {startStatus.value.projeksjonId}.
                </Alert>
            )}
            {RemoteData.isFailure(startStatus) && <ApiErrorAlert error={startStatus.error} />}
            {RemoteData.isFailure(hentStatus) && <ApiErrorAlert error={hentStatus.error} />}
            {!RemoteData.isPending(hentStatus) && RemoteData.isSuccess(hentStatus) && konverteringer.length === 0 && (
                <BodyShort>Ingen konverteringer er startet for denne importen.</BodyShort>
            )}
            {konverteringer.length > 0 && <KonverteringTabell konverteringer={konverteringer} />}
        </div>
    );
};

const konverteringStatusVariant = (status: HistoriskKonvertering['status']): 'success' | 'warning' | 'error' => {
    switch (status) {
        case 'FULLFØRT':
            return 'success';
        case 'PÅGÅR':
            return 'warning';
        case 'FEILET':
            return 'error';
    }
};

const KonverteringTabell = (props: { konverteringer: HistoriskKonvertering[] }) => (
    <div className={styles.konverteringTabell}>
        <Table size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Opprettet</Table.HeaderCell>
                    <Table.HeaderCell>Fullført</Table.HeaderCell>
                    <Table.HeaderCell>Stønader</Table.HeaderCell>
                    <Table.HeaderCell>Avvik</Table.HeaderCell>
                    <Table.HeaderCell>Forbehold</Table.HeaderCell>
                    <Table.HeaderCell>Feilbeskrivelse</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {props.konverteringer.map((konvertering) => (
                    <Table.Row key={konvertering.id}>
                        <Table.DataCell>
                            {konvertering.dryRun
                                ? `Dry-run (maks ${konvertering.maksAntallStønader?.toLocaleString('nb-NO') ?? '–'})`
                                : 'Ordinær – blir gjeldende ved fullføring'}
                        </Table.DataCell>
                        <Table.DataCell>
                            <Tag variant={konverteringStatusVariant(konvertering.status)} size="small">
                                {konvertering.status}
                            </Tag>
                        </Table.DataCell>
                        <Table.DataCell>{formatDateTime(konvertering.opprettet)}</Table.DataCell>
                        <Table.DataCell>
                            {konvertering.fullført ? formatDateTime(konvertering.fullført) : '–'}
                        </Table.DataCell>
                        <Table.DataCell>{konvertering.antallStønader.toLocaleString('nb-NO')}</Table.DataCell>
                        <Table.DataCell>
                            {Object.entries(konvertering.avviksoppsummering).length === 0
                                ? 'Ingen'
                                : Object.entries(konvertering.avviksoppsummering)
                                      .map(([type, antall]) => `${type}: ${antall.toLocaleString('nb-NO')}`)
                                      .join(', ')}
                        </Table.DataCell>
                        <Table.DataCell>
                            {konvertering.forbehold.length === 0 ? 'Ingen' : konvertering.forbehold.join(', ')}
                        </Table.DataCell>
                        <Table.DataCell>
                            {konvertering.feilbeskrivelse ? (
                                <Alert variant="error" size="small" inline>
                                    {konvertering.feilbeskrivelse}
                                </Alert>
                            ) : (
                                '–'
                            )}
                        </Table.DataCell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    </div>
);

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
