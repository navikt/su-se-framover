import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Checkbox, Modal, Tabs, TextField } from '@navikt/ds-react';
import { useState } from 'react';
import { dryRunOmregning, startOmregning } from '~src/api/reguleringApi.ts';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert.tsx';
import { MonthPicker } from '~src/components/inputs/datePicker/DatePicker.tsx';
import { useApiCall } from '~src/lib/hooks.ts';
import { Nullable } from '~src/lib/types.ts';
import sharedStyles from '~src/pages/drift/index.module.less';
import { toIsoMonthOrNull } from '~src/utils/date/dateUtils.ts';
import styles from './G-regulering.module.less';

const Omregning = () => {
    const [visOmregningModal, setVisOmregningModal] = useState(false);

    return (
        <div>
            <Button
                className={sharedStyles.knapp}
                variant="secondary"
                type="button"
                onClick={() => setVisOmregningModal(true)}
            >
                Omregning
            </Button>
            <OmregningsModal visModal={visOmregningModal} onClose={() => setVisOmregningModal(false)} />
        </div>
    );
};

const OmregningsModal = (props: { visModal: boolean; onClose: () => void }) => {
    return (
        <Modal open={props.visModal} onClose={props.onClose} header={{ heading: 'Omregning' }}>
            <Modal.Body className={styles.modalBody}>
                <Tabs defaultValue="dry-run">
                    <Tabs.List>
                        <Tabs.Tab value="dry-run" label="Dry-Run" />
                        <Tabs.Tab value="omregning" label="Omregning" />
                    </Tabs.List>
                    <OmregningPanel />
                    <Tabs.Panel value="dry-run" className={styles.tabPanel}>
                        <DryRunPanel />
                    </Tabs.Panel>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

const OmregningPanel = () => {
    const [startDato, setStartDato] = useState<Nullable<Date>>(null);
    const [omregingStatus, omregn] = useApiCall(startOmregning);

    const handleSubmit = () => {
        if (startDato) {
            omregn({
                fraOgMedMåned: toIsoMonthOrNull(startDato)!,
            });
        } else {
            console.log('Du må velge en startdato før du kan omregne.');
        }
    };

    return (
        <Tabs.Panel value="omregning" className={styles.tabPanel}>
            <div className={styles.panelInnholdContainer}>
                <MonthPicker label="Velg omregningsdato" value={startDato} onChange={(dato) => setStartDato(dato)} />
                <Button
                    onClick={handleSubmit}
                    loading={RemoteData.isPending(omregingStatus)}
                    disabled={!RemoteData.isInitial(omregingStatus)}
                >
                    Start omregning
                </Button>
                {RemoteData.isSuccess(omregingStatus) && (
                    <Alert variant="success">Omregning startet. Sjekk logg for detaljer.</Alert>
                )}
                {RemoteData.isFailure(omregingStatus) && <ApiErrorAlert error={omregingStatus.error} />}
            </div>
        </Tabs.Panel>
    );
};

const DryRunPanel = () => {
    const [dryRunStatus, dryRun] = useApiCall(dryRunOmregning);
    const [startDatoOmregning, setStartDatoOmregning] = useState<Nullable<Date>>(null);
    const [lagreManuelle, setLagreManuelle] = useState<boolean>(false);
    const [maksAntallSaker, setMaksAntallSaker] = useState<number | null>(null);
    const [maksAntallSakerInput, setMaksAntallSakerInput] = useState<string>('');
    const [manglerStartDato, setManglerStartDato] = useState(false);
    const [saksnummer, setSaksnummer] = useState<string>('');

    const maksAntallSakerErUgyldig =
        maksAntallSakerInput !== '' &&
        (!Number.isInteger(Number(maksAntallSakerInput)) || Number(maksAntallSakerInput) <= 0);

    const handleSubmit = () => {
        if (!startDatoOmregning) {
            setManglerStartDato(true);
            return;
        }
        setManglerStartDato(false);
        if (maksAntallSakerErUgyldig) {
            return;
        }
        dryRun({
            startDatoOmregning: toIsoMonthOrNull(startDatoOmregning)!,
            lagreManuelle: lagreManuelle,
            maksAntallSaker: maksAntallSaker,
            saksnummer: saksnummer || null,
        });
    };

    return (
        <Tabs.Panel value="dry-run" className={styles.tabPanel}>
            <div className={styles.panelInnholdContainer}>
                <div className={styles.inputContainers}>
                    <div className={styles.datoOgVerdiContainer}>
                        <MonthPicker
                            label="Startdato for omregning"
                            value={startDatoOmregning}
                            onChange={(dato) => {
                                setStartDatoOmregning(dato);
                                setManglerStartDato(!dato);
                            }}
                            error={manglerStartDato ? 'Startdato for omregning må fylles ut' : undefined}
                        />
                    </div>
                    <TextField label="Saksnummer" value={saksnummer} onChange={(e) => setSaksnummer(e.target.value)} />
                </div>
                <div className={styles.lagreManuelle}>
                    <Checkbox onChange={() => setLagreManuelle(!lagreManuelle)} checked={lagreManuelle}>
                        Lagre manuelle behandlinger (gjelder ikke prod)
                    </Checkbox>
                </div>
                <TextField
                    label="Maks antall saker"
                    type="number"
                    onChange={(val) => {
                        const input = val.target.value;
                        setMaksAntallSakerInput(input);
                        const parsedValue = input ? Number(input) : null;
                        setMaksAntallSaker(
                            parsedValue !== null && Number.isFinite(parsedValue) && parsedValue > 0
                                ? parsedValue
                                : null,
                        );
                    }}
                />
                {maksAntallSakerErUgyldig && (
                    <Alert variant="error">Maks antall saker må være et positivt heltall</Alert>
                )}
                <Button onClick={handleSubmit} loading={RemoteData.isPending(dryRunStatus)}>
                    Kjør dry run
                </Button>
                {RemoteData.isSuccess(dryRunStatus) && (
                    <Alert variant="success"> Nice 👍. Dry run omregning startet. Sjekk logg for detaljer. </Alert>
                )}
                {RemoteData.isFailure(dryRunStatus) && <ApiErrorAlert error={dryRunStatus.error} />}
            </div>
        </Tabs.Panel>
    );
};

export default Omregning;
