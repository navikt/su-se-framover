import * as RemoteData from '@devexperts/remote-data-ts';
import {
    Button,
    Modal,
    Alert,
    GuidePanel,
    Loader,
    TextField,
    Tabs,
    RadioGroup,
    Radio,
    Textarea,
    Label,
} from '@navikt/ds-react';
import { useState, useEffect } from 'react';

import { dryRunRegulering, startRegulering } from '~src/api/reguleringApi';
import * as reguleringApi from '~src/api/reguleringApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { DatePicker, MonthPicker } from '~src/components/inputs/datePicker/DatePicker';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import { toIsoDateOnlyString, toIsoMonthOrNull } from '~src/utils/date/dateUtils';

import styles from './G-regulering.module.less';

const Gregulering = () => {
    const [visReguleringModal, setVisReguleringModal] = useState(false);

    return (
        <div>
            <GReguleringsModal visModal={visReguleringModal} onClose={() => setVisReguleringModal(false)} />
            <Button
                variant="secondary"
                type="button"
                onClick={() => {
                    setVisReguleringModal(true);
                }}
            >
                G-regulering
            </Button>
        </div>
    );
};

const GReguleringsModal = (props: { visModal: boolean; onClose: () => void }) => {
    const [hentÅpneBehandlingerStatus, hentÅpneBehandlinger] = useApiCall(reguleringApi.hentSakerMedÅpneBehandlinger);

    useEffect(() => {
        hentÅpneBehandlinger({});
    }, []);

    return (
        <Modal
            aria-labelledby="Start regulering"
            open={props.visModal}
            onClose={props.onClose}
            header={{ heading: 'G-regulering' }}
        >
            <Modal.Body className={styles.modalBody}>
                <GuidePanel className={styles.guidePanel}>
                    {pipe(
                        hentÅpneBehandlingerStatus,
                        RemoteData.fold(
                            () => <Loader />,
                            () => <Loader />,
                            () => <Alert variant="error">En feil skjedde under henting av åpne behandlinger</Alert>,
                            (saksnummer) => {
                                return (
                                    <>
                                        <p>Antall saker med åpen behandling eller stans: {saksnummer.length}</p>
                                        <br />
                                        <p>{saksnummer.sort().join(', ')}</p>
                                    </>
                                );
                            },
                        ),
                    )}
                </GuidePanel>

                <Tabs defaultValue="dry-run">
                    <Tabs.List>
                        <Tabs.Tab value="dry-run" label="Dry-run" />
                        <Tabs.Tab value="regulering" label="Regulering" />
                        <Tabs.Tab value="supplement" label="Reguleringsupplement" />
                    </Tabs.List>
                    <ReguleringPanel />
                    <DryRunPanel />

                    <Tabs.Panel value="supplement" className={styles.tabPanel}>
                        <ReguleringsSupplementStandAlone />
                    </Tabs.Panel>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

const ReguleringPanel = () => {
    const [startDato, setStartDato] = useState<Nullable<Date>>(null);
    const [reguleringsstatus, reguler] = useApiCall(startRegulering);
    const [supplementValue, setSupplementValue] = useState<Nullable<string | File>>(null);

    const handleSubmit = () => {
        if (startDato) {
            reguler({
                fraOgMedMåned: toIsoMonthOrNull(startDato)!,
                supplement: supplementValue,
            });
        } else {
            console.log('du må velge en startdato før du kan regulere');
        }
    };

    return (
        <Tabs.Panel value="regulering" className={styles.tabPanel}>
            <div className={styles.panelInnholdContainer}>
                <MonthPicker label="Velg reguleringsdato" value={startDato} onChange={(dato) => setStartDato(dato)} />

                <ReguleringsSupplement onSupplementChange={setSupplementValue} />

                <Button
                    onClick={handleSubmit}
                    loading={RemoteData.isPending(reguleringsstatus)}
                    disabled={!RemoteData.isInitial(reguleringsstatus)}
                >
                    Start regulering
                </Button>
                {RemoteData.isSuccess(reguleringsstatus) && (
                    <Alert variant="success">Regulering er startet 👍🤌 Sjekk logger</Alert>
                )}
                {RemoteData.isFailure(reguleringsstatus) && <ApiErrorAlert error={reguleringsstatus.error} />}
            </div>
        </Tabs.Panel>
    );
};

const DryRunPanel = () => {
    const [dryRunStatus, dryRun] = useApiCall(dryRunRegulering);
    const [startDatoDryRun, setStartDatoDryRun] = useState<Nullable<Date>>(null);
    const [gverdiDryRun, setGVerdiDryRun] = useState<Nullable<number>>(null);
    const [omregningsfaktor, setOmregningsfaktor] = useState<Nullable<string>>(null);
    const [kjøringsdato, setkjøringsdato] = useState<Nullable<Date>>(null);
    const [supplementValue, setSupplementValue] = useState<Nullable<string | File>>(null);

    const handleSubmit = () => {
        if (startDatoDryRun && gverdiDryRun && omregningsfaktor && kjøringsdato) {
            dryRun({
                fraOgMedMåned: toIsoMonthOrNull(startDatoDryRun)!,
                grunnbeløp: gverdiDryRun,
                omregningsfaktor: omregningsfaktor,
                kjøringsdato: toIsoDateOnlyString(kjøringsdato),
                supplement: supplementValue,
            });
        } else {
            console.log(
                'reguleringsdato, g-verdi, omregningsfaktor og kjøringsdato må fylles ut før du kan kjøre dry-run',
            );
        }
    };

    return (
        <Tabs.Panel value="dry-run" className={styles.tabPanel}>
            <div className={styles.panelInnholdContainer}>
                <div className={styles.inputContainers}>
                    <div className={styles.datoOgVerdiContainer}>
                        <MonthPicker
                            label="Velg reguleringsdato"
                            value={startDatoDryRun}
                            onChange={(dato) => setStartDatoDryRun(dato)}
                        />
                        <DatePicker label="Kjøringsdato" value={kjøringsdato} onChange={setkjøringsdato} />
                    </div>
                    <div className={styles.datoOgVerdiContainer}>
                        <TextField label="G-verdi" onChange={(v) => setGVerdiDryRun(Number(v.target.value))} />
                        <TextField
                            label="Omregningsfaktor (. som desimalltegn)"
                            onChange={(v) => setOmregningsfaktor(v.target.value)}
                        />
                    </div>
                </div>

                <ReguleringsSupplement onSupplementChange={setSupplementValue} />

                <Button onClick={handleSubmit} loading={RemoteData.isPending(dryRunStatus)}>
                    Start dry-run regulering
                </Button>
                {RemoteData.isSuccess(dryRunStatus) && (
                    <Alert variant="success">Nice 👍🤌. Dry run regulering startet. Sjekk logger</Alert>
                )}
                {RemoteData.isFailure(dryRunStatus) && <ApiErrorAlert error={dryRunStatus.error} />}
            </div>
        </Tabs.Panel>
    );
};

const ReguleringsSupplement = (props: { onSupplementChange: (i: Nullable<string | File>) => void }) => {
    const [supplement, setSupplement] = useState<Nullable<'fil' | 'text'>>(null);

    return (
        <div className={styles.supplementContainer}>
            <RadioGroup legend="Velg supplement" description={'Supplement er ikke påkrevd ved regulering'}>
                <Radio
                    value={'fil'}
                    onClick={() => {
                        setSupplement('fil');
                        props.onSupplementChange(null);
                    }}
                >
                    Fil
                </Radio>
                <Radio
                    value={'text'}
                    onClick={() => {
                        setSupplement('text');
                        props.onSupplementChange(null);
                    }}
                >
                    Text
                </Radio>
                <Radio
                    value={'Ingen supplement'}
                    onClick={() => {
                        setSupplement(null);
                        props.onSupplementChange(null);
                    }}
                >
                    Ingen supplement
                </Radio>
            </RadioGroup>

            {supplement === 'fil' && (
                <input
                    type="file"
                    onChange={(e) => (e.target.files ? props.onSupplementChange(e.target.files[0]) : null)}
                />
            )}
            {supplement === 'text' && (
                <Textarea
                    label={'CSV'}
                    minRows={5}
                    maxRows={10}
                    onChange={(e) => props.onSupplementChange(e.target.value)}
                />
            )}
        </div>
    );
};

const ReguleringsSupplementStandAlone = () => {
    const [supplement, setSupplement] = useState<Nullable<'fil' | 'text'>>(null);

    const [supplementValue, setSupplementValue] = useState<Nullable<string | File>>(null);
    const [status, sendSupplement] = useApiCall(reguleringApi.reguleringssupplement);

    const onClick = () => {
        if (!supplementValue) {
            console.log('du hakke valgt hva du skal sende inn');
            return;
        }
        sendSupplement({ innhold: supplementValue });
    };

    return (
        <div className={styles.supplementContainer}>
            <Label>
                Dersom regulering er blitt kjørt, og reguleringsbehandlinger er blitt opprettet, kan du legge til et
                supplement som kjører en del av disse behandlingenene automatisk
            </Label>
            <RadioGroup legend="Velg supplement">
                <Radio value={'fil'} onClick={() => setSupplement('fil')}>
                    Fil
                </Radio>

                <Radio value={'text'} onClick={() => setSupplement('text')}>
                    Text
                </Radio>
            </RadioGroup>

            {supplement === 'fil' && (
                <input type="file" onChange={(e) => (e.target.files ? setSupplementValue(e.target.files[0]) : null)} />
            )}
            {supplement === 'text' && (
                <Textarea label={'CSV'} minRows={5} maxRows={10} onChange={(e) => setSupplementValue(e.target.value)} />
            )}

            {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
            {RemoteData.isSuccess(status) && (
                <Alert variant="success">Regulering kjører med supplement 👍🤌 sjekk logger</Alert>
            )}

            <Button onClick={onClick}>Oppdater regulering med supplement</Button>
        </div>
    );
};

export default Gregulering;
