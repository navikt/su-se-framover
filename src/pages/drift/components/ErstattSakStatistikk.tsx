import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Button, ConfirmationPanel, Modal, Textarea, VStack } from '@navikt/ds-react';
import { useState } from 'react';

import { ApiError } from '~src/api/apiClient';
import {
    erstattSakStatistikk,
    ForhåndsvisErstattSakStatistikk,
    forhåndsvisErstattSakStatistikk,
} from '~src/api/driftApi';
import { useApiCall } from '~src/lib/hooks';

import sharedStyles from '../index.module.less';

const MAKS_ANTALL_SEKVENS_IDER = 500;

type Valideringsresultat = { ok: true; sekvensIder: number[] } | { ok: false; feil: string };

export const validerSekvensIder = (input: string): Valideringsresultat => {
    const trimmetInput = input.trim();
    if (trimmetInput.length === 0) {
        return { ok: false, feil: 'Oppgi minst én sekvens-ID.' };
    }

    const verdier = trimmetInput.split(/[\s,;]+/);
    if (verdier.some((verdi) => !/^-?\d+$/.test(verdi))) {
        return { ok: false, feil: 'Fjern null, negative tall og ugyldige verdier.' };
    }

    const sekvensIder = verdier.map(Number);
    if (sekvensIder.some((sekvensId) => !Number.isSafeInteger(sekvensId) || sekvensId < 1)) {
        return { ok: false, feil: 'Fjern null, negative tall og ugyldige verdier.' };
    }

    if (new Set(sekvensIder).size !== sekvensIder.length) {
        return { ok: false, feil: 'Fjern duplikater fra lista.' };
    }

    if (sekvensIder.length > MAKS_ANTALL_SEKVENS_IDER) {
        return { ok: false, feil: 'Del lista i sekvensielle kall med maksimalt 500 ID-er.' };
    }

    return { ok: true, sekvensIder };
};

const backendFeilmeldinger: Record<string, string> = {
    ingen_sekvens_ider: 'Oppgi minst én sekvens-ID.',
    for_mange_sekvens_ider: 'Del lista i sekvensielle kall med maksimalt 500 ID-er.',
    ugyldige_sekvens_ider: 'Fjern null, negative tall og ugyldige verdier.',
    duplikate_sekvens_ider: 'Fjern duplikater fra lista.',
    avvik_i_sak_statistikk:
        'En eller flere ID-er mangler eller finnes flere ganger i sak_statistikk. Ingen BigQuery-endring er gjort.',
};

const feilmeldingFor = (error: ApiError): string => {
    return backendFeilmeldinger[error.body.code] ?? 'Operasjonen feilet. Du kan prøve den samme lista på nytt.';
};

const antallRaderTekst = (antall: number) => `${antall} ${antall === 1 ? 'rad' : 'rader'}`;

const forhåndsvisningstekst = (forhåndsvisning: ForhåndsvisErstattSakStatistikk): string => {
    const harPostgresAvvik =
        forhåndsvisning.manglendeISakStatistikk.length > 0 || forhåndsvisning.ikkeUnikeISakStatistikk.length > 0;
    if (harPostgresAvvik) {
        return 'En eller flere ID-er mangler eller finnes flere ganger i sak_statistikk. BigQuery ble ikke kontrollert. Lista kan ikke erstattes.';
    }

    if (
        forhåndsvisning.antallRaderIBigQuery === null ||
        forhåndsvisning.manglendeIBigQuery === null ||
        forhåndsvisning.ikkeUnikeIBigQuery === null
    ) {
        return 'BigQuery ble ikke kontrollert. Lista kan ikke erstattes.';
    }

    if (!forhåndsvisning.kanErstattes) {
        if (forhåndsvisning.ikkeUnikeIBigQuery.length > 0) {
            return 'BigQuery-treffene samsvarer ikke med én rad per sekvens-ID. Lista kan ikke erstattes før avviket er avklart.';
        }
        return `Vi fant ${forhåndsvisning.antallRaderISakStatistikk} rader i sak_statistikk, men ${forhåndsvisning.antallRaderIBigQuery} av ${forhåndsvisning.antallForespurte} forventede rader i BigQuery. Lista kan ikke erstattes før avviket er avklart.`;
    }
    if (forhåndsvisning.antallRaderIBigQuery === 0) {
        return `Vi fant ${forhåndsvisning.antallRaderISakStatistikk} rader i sak_statistikk og ingen av de forespurte radene i BigQuery. Lista kan erstattes som et nytt forsøk.`;
    }
    return `Vi fant ${forhåndsvisning.antallRaderISakStatistikk} rader i sak_statistikk og ${forhåndsvisning.antallRaderIBigQuery} rader i BigQuery.`;
};

const ErstattSakStatistikk = () => {
    const [visModal, setVisModal] = useState(false);

    return (
        <div>
            <Button className={sharedStyles.knapp} variant="secondary" type="button" onClick={() => setVisModal(true)}>
                Erstatt sakstatistikk
            </Button>
            {visModal && <ErstattSakStatistikkModal open={visModal} onClose={() => setVisModal(false)} />}
        </div>
    );
};

const ErstattSakStatistikkModal = (props: { open: boolean; onClose: () => void }) => {
    const [forhåndsvisStatus, forhåndsvis, resetForhåndsvisStatus] = useApiCall(forhåndsvisErstattSakStatistikk);
    const [erstattStatus, erstatt, resetErstattStatus] = useApiCall(erstattSakStatistikk);
    const [input, setInput] = useState('');
    const [valideringsfeil, setValideringsfeil] = useState<string>();
    const [sekvensIder, setSekvensIder] = useState<number[]>();
    const [bekreftet, setBekreftet] = useState(false);

    const kontrollerListe = () => {
        const resultat = validerSekvensIder(input);
        if (!resultat.ok) {
            setValideringsfeil(resultat.feil);
            setSekvensIder(undefined);
            setBekreftet(false);
            return;
        }

        setValideringsfeil(undefined);
        setSekvensIder(resultat.sekvensIder);
        setBekreftet(false);
        resetForhåndsvisStatus();
        resetErstattStatus();
        forhåndsvis({ sekvensIder: resultat.sekvensIder });
    };

    const oppdaterInput = (verdi: string) => {
        setInput(verdi);
        setValideringsfeil(undefined);
        setSekvensIder(undefined);
        setBekreftet(false);
        resetForhåndsvisStatus();
        resetErstattStatus();
    };

    const send = () => {
        if (
            !sekvensIder ||
            !bekreftet ||
            !RemoteData.isSuccess(forhåndsvisStatus) ||
            !forhåndsvisStatus.value.kanErstattes
        ) {
            return;
        }
        erstatt({ sekvensIder });
    };

    const pågår = RemoteData.isPending(forhåndsvisStatus) || RemoteData.isPending(erstattStatus);
    const forhåndsvisning = RemoteData.isSuccess(forhåndsvisStatus) ? forhåndsvisStatus.value : undefined;
    const antallRaderIBigQuery = forhåndsvisning?.antallRaderIBigQuery;
    const kanErstattes =
        forhåndsvisning?.kanErstattes === true &&
        antallRaderIBigQuery !== null &&
        antallRaderIBigQuery !== undefined &&
        forhåndsvisning.manglendeIBigQuery !== null &&
        forhåndsvisning.ikkeUnikeIBigQuery !== null;

    return (
        <Modal
            open={props.open}
            onClose={props.onClose}
            header={{ heading: 'Erstatt sakstatistikk' }}
            aria-describedby="erstatt-sakstatistikk-beskrivelse"
        >
            <Modal.Body>
                <VStack gap="4">
                    <BodyShort id="erstatt-sakstatistikk-beskrivelse">
                        Lim inn sekvens-ID-ene som skal slettes fra BigQuery og lastes på nytt fra sak_statistikk. Skill
                        ID-ene med komma, mellomrom eller linjeskift.
                    </BodyShort>
                    <Textarea
                        label="Sekvens-ID-er"
                        value={input}
                        onChange={(event) => oppdaterInput(event.target.value)}
                        error={valideringsfeil}
                        disabled={pågår}
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={kontrollerListe}
                        loading={RemoteData.isPending(forhåndsvisStatus)}
                        disabled={RemoteData.isPending(erstattStatus)}
                    >
                        Kontroller liste
                    </Button>

                    {RemoteData.isPending(forhåndsvisStatus) && <BodyShort>Kontrollerer lista...</BodyShort>}
                    {RemoteData.isFailure(forhåndsvisStatus) && (
                        <Alert variant="error">{feilmeldingFor(forhåndsvisStatus.error)}</Alert>
                    )}
                    {RemoteData.isSuccess(forhåndsvisStatus) && (
                        <Alert variant={kanErstattes ? 'success' : 'warning'}>
                            {forhåndsvisningstekst(forhåndsvisStatus.value)}
                        </Alert>
                    )}

                    {sekvensIder && kanErstattes && forhåndsvisning && typeof antallRaderIBigQuery === 'number' && (
                        <ConfirmationPanel
                            checked={bekreftet}
                            label="Jeg bekrefter at radene skal erstattes."
                            onChange={() => setBekreftet((erBekreftet) => !erBekreftet)}
                            disabled={pågår}
                        >
                            {antallRaderTekst(antallRaderIBigQuery)} slettes fra BigQuery, og{' '}
                            {antallRaderTekst(forhåndsvisning.antallRaderISakStatistikk)} lastes på nytt fra
                            sak_statistikk.
                        </ConfirmationPanel>
                    )}

                    {RemoteData.isSuccess(erstattStatus) && (
                        <Alert variant="success">{antallRaderTekst(erstattStatus.value.antall)} ble erstattet.</Alert>
                    )}
                    {RemoteData.isFailure(erstattStatus) && (
                        <Alert variant="error">{feilmeldingFor(erstattStatus.error)}</Alert>
                    )}
                </VStack>
            </Modal.Body>
            <Modal.Footer>
                <Button type="button" variant="secondary" onClick={props.onClose} disabled={pågår}>
                    Avbryt
                </Button>
                <Button
                    type="button"
                    onClick={send}
                    loading={RemoteData.isPending(erstattStatus)}
                    disabled={!sekvensIder || !bekreftet || !kanErstattes || RemoteData.isSuccess(erstattStatus)}
                >
                    Erstatt rader
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ErstattSakStatistikk;
