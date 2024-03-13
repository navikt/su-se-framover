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
import { MonthPicker } from '~src/components/inputs/datePicker/DatePicker';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import { toIsoMonthOrNull } from '~src/utils/date/dateUtils';

import styles from './G-regulering.module.less';

const Gregulering = () => {
    const [visReguleringModal, setVisReguleringModal] = useState(false);

    return (
        <div>
            <GReguleringsModal visModa={visReguleringModal} onClose={() => setVisReguleringModal(false)} />
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

const GReguleringsModal = (props: { visModa: boolean; onClose: () => void }) => {
    const [reguleringsstatus, reguler] = useApiCall(startRegulering);
    const [dryRunStatus, dryRun] = useApiCall(dryRunRegulering);
    const [hentÅpneBehandlingerStatus, hentÅpneBehandlinger] = useApiCall(reguleringApi.hentSakerMedÅpneBehandlinger);

    useEffect(() => {
        hentÅpneBehandlinger({});
    }, []);

    const [startDato, setStartDato] = useState<Nullable<Date>>(null);

    const [startDatoDryRun, setStartDatoDryRun] = useState<Nullable<Date>>(null);
    const [gverdiDryRun, setGVerdiDryRun] = useState<Nullable<number>>(null);
    const [supplementValue, setSupplementValue] = useState<Nullable<string | File>>(null);

    return (
        <Modal
            aria-labelledby="Start regulering"
            open={props.visModa}
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
                    </Tabs.List>
                    <Tabs.Panel value="dry-run" className={styles.tabPanel}>
                        <div className={styles.panelInnholdContainer}>
                            <div className={styles.datoOgGVerdiContainer}>
                                <MonthPicker
                                    label="Velg reguleringsdato"
                                    value={startDatoDryRun}
                                    onChange={(dato) => setStartDatoDryRun(dato)}
                                />
                                <TextField
                                    label={'G-verdi'}
                                    onChange={(v) => setGVerdiDryRun(Number(v.target.value))}
                                />
                            </div>

                            <ReguleringsSupplement onSupplementChange={setSupplementValue} />

                            <Button
                                onClick={() =>
                                    //TODO helst ha som en onSubmit function
                                    startDatoDryRun &&
                                    supplementValue &&
                                    dryRun({
                                        fraOgMedMåned: toIsoMonthOrNull(startDatoDryRun)!,
                                        grunnbeløp: gverdiDryRun,
                                        supplement: supplementValue!,
                                    })
                                }
                                loading={RemoteData.isPending(dryRunStatus)}
                            >
                                Start dry-run regulering
                            </Button>
                            {RemoteData.isSuccess(dryRunStatus) && (
                                <Alert variant="success">Nice 👍🤌. Dry run regulering startet. Sjekk logger</Alert>
                            )}
                        </div>
                    </Tabs.Panel>
                    <Tabs.Panel value="regulering" className={styles.tabPanel}>
                        <div className={styles.panelInnholdContainer}>
                            <MonthPicker
                                label="Velg reguleringsdato"
                                value={startDato}
                                onChange={(dato) => setStartDato(dato)}
                            />

                            <ReguleringsSupplement onSupplementChange={setSupplementValue} />

                            <Button
                                onClick={() =>
                                    //TODO helst ha som en onSubmit function
                                    startDato &&
                                    supplementValue &&
                                    reguler({
                                        fraOgMedMåned: toIsoMonthOrNull(startDato)!,
                                        supplement: supplementValue!,
                                    })
                                }
                                loading={RemoteData.isPending(reguleringsstatus)}
                                disabled={!RemoteData.isInitial(reguleringsstatus)}
                            >
                                Start regulering
                            </Button>
                            {RemoteData.isSuccess(reguleringsstatus) && (
                                <Alert variant="success">Regulering gjennomført 👍🤌</Alert>
                            )}
                        </div>
                    </Tabs.Panel>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

const ReguleringsSupplement = (props: { onSupplementChange: (i: Nullable<string | File>) => void }) => {
    const [supplement, setSupplement] = useState<Nullable<'fil' | 'text'>>(null);

    return (
        <div className={styles.supplementContainer}>
            <Label>
                Dersom regulering er blitt kjørt, og reguleringsbehandlinger er blitt opprettet, kan du legge til et
                supplement som kjører en del av disse behandlingenene automatisk{' '}
            </Label>
            <RadioGroup legend="Velg supplement">
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

export default Gregulering;
