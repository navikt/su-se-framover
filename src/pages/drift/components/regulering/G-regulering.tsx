import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Checkbox, HelpText, Modal, Radio, RadioGroup, Tabs, TextField } from '@navikt/ds-react';
import { useState } from 'react';
import { dryRunRegulering, startRegulering } from '~src/api/reguleringApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { DatePicker, MonthPicker } from '~src/components/inputs/datePicker/DatePicker';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import { Sakstype } from '~src/types/Sak.ts';
import { toIsoDateOnlyString, toIsoMonthOrNull, toStringDateOrNull } from '~src/utils/date/dateUtils';
import styles from './G-regulering.module.less';
import ReguleringStatus from './ReguleringStatus';

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
    return (
        <Modal
            aria-labelledby="Start regulering"
            open={props.visModal}
            onClose={props.onClose}
            header={{ heading: 'G-regulering' }}
        >
            <Modal.Body className={styles.modalBody}>
                <Tabs defaultValue="dry-run">
                    <Tabs.List>
                        <Tabs.Tab value="dry-run" label="Dry-run" />
                        <Tabs.Tab value="regulering" label="Regulering" />
                        <Tabs.Tab value="status" label="Status" />
                    </Tabs.List>
                    <ReguleringPanel />
                    <DryRunPanel />
                    <Tabs.Panel value="status" className={styles.tabPanel}>
                        <ReguleringStatus />
                    </Tabs.Panel>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

const ReguleringPanel = () => {
    const [startDato, setStartDato] = useState<Nullable<Date>>(null);
    const [reguleringsstatus, reguler] = useApiCall(startRegulering);

    const handleSubmit = () => {
        if (startDato) {
            reguler({ fraOgMedMåned: toIsoMonthOrNull(startDato)! });
        } else {
            console.log('du må velge en startdato før du kan regulere');
        }
    };

    return (
        <Tabs.Panel value="regulering" className={styles.tabPanel}>
            <div className={styles.panelInnholdContainer}>
                <MonthPicker label="Velg reguleringsdato" value={startDato} onChange={(dato) => setStartDato(dato)} />
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

    const [startDatoRgulering, setStartDatoRegulering] = useState<Nullable<Date>>(null);
    const [gjeldendeSatsFra, setGjeldendeSatsFra] = useState<Nullable<Date>>(null);

    const [nyGrunnbeløp, setNyGrunnbeløp] = useState<boolean>(false);
    const [lagreManuelle, setLagreManuelle] = useState<boolean>(false);
    const [virkningstidspunkt, setVirkningstidspunkt] = useState<Nullable<Date>>(null);
    const [ikrafttredelse, setIkrafttredelse] = useState<Nullable<Date>>(null);
    const [gverdiDryRun, setGVerdiDryRun] = useState<Nullable<number>>(null);
    const [omregningsfaktor, setOmregningsfaktor] = useState<Nullable<string>>(null);
    const [gpensjonOrdinærDryRun, setGpensjonOrdinærDryRun] = useState<Nullable<number>>(null);
    const [gpensjonHøyDryRun, setGpensjonHøyDryRun] = useState<Nullable<number>>(null);
    const [maksAntallSaker, setMaksAntallSaker] = useState<Nullable<number>>(null);
    const [kunSakstype, setKunSakstype] = useState<Nullable<Sakstype>>(null);

    const handleSubmit = () => {
        if (nyGrunnbeløp) {
            if (
                virkningstidspunkt &&
                gverdiDryRun &&
                omregningsfaktor &&
                gjeldendeSatsFra &&
                gpensjonOrdinærDryRun &&
                gpensjonHøyDryRun
            ) {
                dryRun({
                    startDatoRegulering: toIsoMonthOrNull(startDatoRgulering)!,
                    gjeldendeSatsFraOgMed: toIsoDateOnlyString(gjeldendeSatsFra!),
                    nyttGrunnbeløp: {
                        virkningstidspunkt: toIsoDateOnlyString(virkningstidspunkt)!,
                        ikrafttredelse: toStringDateOrNull(ikrafttredelse),
                        grunnbeløp: gverdiDryRun.toString(),
                        omregningsfaktor: omregningsfaktor,
                        garantipensjonOrdinær: gpensjonOrdinærDryRun.toString(),
                        garantipensjonHøy: gpensjonHøyDryRun.toString(),
                    },
                    lagreManuelle: lagreManuelle,
                    kunSakstype: kunSakstype,
                    maksAntallSaker: maksAntallSaker,
                });
            } else {
                console.log('du må fylle ut alle feltene før du kan kjøre dry-run');
            }
        } else {
            dryRun({
                startDatoRegulering: toIsoMonthOrNull(startDatoRgulering)!,
                gjeldendeSatsFraOgMed: toIsoDateOnlyString(gjeldendeSatsFra!),
                nyttGrunnbeløp: null,
                lagreManuelle: lagreManuelle,
                kunSakstype: kunSakstype,
                maksAntallSaker: maksAntallSaker,
            });
        }
    };

    return (
        <Tabs.Panel value="dry-run" className={styles.tabPanel}>
            <div className={styles.panelInnholdContainer}>
                <div className={styles.inputContainers}>
                    <div className={styles.datoOgVerdiContainer}>
                        <MonthPicker
                            label="Start dato for regulering"
                            value={startDatoRgulering}
                            onChange={(dato) => setStartDatoRegulering(dato)}
                        />
                        <DatePicker
                            label="Gjeldende sats fra og med"
                            hjelpetekst="Bestemmer hvilken gjelden sats som skal brukes i reguleringen"
                            value={gjeldendeSatsFra}
                            onChange={setGjeldendeSatsFra}
                        />
                    </div>
                    <Checkbox onChange={() => setNyGrunnbeløp(!nyGrunnbeløp)} checked={nyGrunnbeløp}>
                        Legg til nytt grunnbeløp
                    </Checkbox>

                    {nyGrunnbeløp && (
                        <div className={styles.nyGrunnbeløpsForm}>
                            <DatePicker
                                label="Virkningstidspunkt"
                                value={virkningstidspunkt}
                                onChange={setVirkningstidspunkt}
                            />
                            <DatePicker
                                label="Ikrafttredelse"
                                hjelpetekst="Settes til virkningstidspunkt dersom den ikke er utfylt"
                                value={ikrafttredelse}
                                onChange={setIkrafttredelse}
                            />
                            <TextField label="G-verdi" onChange={(v) => setGVerdiDryRun(Number(v.target.value))} />
                            <TextField
                                label={
                                    <div className={styles.omregnignsfaktorLabel}>
                                        Omregningsfaktor <HelpText>Bruk punktum som desimaltegn</HelpText>
                                    </div>
                                }
                                onChange={(v) => setOmregningsfaktor(v.target.value)}
                            />
                            <TextField
                                label="Garantipensjon ordinær"
                                onChange={(v) => setGpensjonOrdinærDryRun(Number(v.target.value))}
                            />
                            <TextField
                                label="Garantipensjon høy"
                                onChange={(v) => setGpensjonHøyDryRun(Number(v.target.value))}
                            />
                        </div>
                    )}

                    <div className={styles.lagreManuelle}>
                        <Checkbox onChange={() => setLagreManuelle(!lagreManuelle)} checked={lagreManuelle}>
                            Lagre manuelle behandlinger (gjelder ikke prod)
                        </Checkbox>
                        <HelpText>
                            Grunnbeløp som legges til her vil brukes for å trigge opprettelse av manuelle reguleringer.
                            Under behandlingen av disse reguleringene vil grunnbeløp som ligger i systemet benyttes.
                        </HelpText>
                    </div>
                </div>
                <TextField
                    label="Maks antall saker"
                    type="number"
                    onChange={(val) => {
                        const parsedValue = val ? Number(val.target.value) : null;
                        setMaksAntallSaker(
                            parsedValue !== null && Number.isFinite(parsedValue) && parsedValue > 0
                                ? parsedValue
                                : null,
                        );
                    }}
                />
                <RadioGroup
                    legend="Kun sakstype"
                    value={kunSakstype ?? ''}
                    onChange={(val) => setKunSakstype(val === 'alder' || val === 'uføre' ? val : null)}
                >
                    <Radio value="">Alle</Radio>
                    <Radio value="alder">Alder</Radio>
                    <Radio value="uføre">Uføre</Radio>
                </RadioGroup>

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

export default Gregulering;
