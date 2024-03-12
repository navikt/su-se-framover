import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Modal, Alert, GuidePanel, Heading, Loader, TextField } from '@navikt/ds-react';
import { useState, useEffect } from 'react';

import { dryRunRegulering, startRegulering } from '~src/api/reguleringApi';
import * as reguleringApi from '~src/api/reguleringApi';
import { MonthPicker } from '~src/components/inputs/datePicker/DatePicker';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import { toIsoMonthOrNull } from '~src/utils/date/dateUtils';

import sharedStyles from '../index.module.less';

const Gregulering = () => {
    const [visReguleringModal, setVisReguleringModal] = useState(false);

    return (
        <div>
            <GReguleringsModal visModa={visReguleringModal} onClose={() => setVisReguleringModal(false)} />
            <Button
                variant="secondary"
                className={sharedStyles.knapp}
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

    return (
        <Modal aria-labelledby="Start regulering" open={props.visModa} onClose={props.onClose}>
            <Modal.Body>
                <div className={sharedStyles.regulering}>
                    <div>
                        <MonthPicker
                            label="Velg reguleringsdato"
                            value={startDatoDryRun}
                            onChange={(dato) => setStartDatoDryRun(dato)}
                        />
                        <TextField label={'G-verdi'} onChange={(v) => setGVerdiDryRun(Number(v.target.value))} />

                        <Button
                            onClick={() =>
                                startDatoDryRun &&
                                dryRun({
                                    fraOgMedMåned: toIsoMonthOrNull(startDatoDryRun)!,
                                    grunnbeløp: gverdiDryRun,
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

                    <Heading level="1" size="medium" className={sharedStyles.reguleringHeader}>
                        Start G-regulering
                    </Heading>
                    <GuidePanel className={sharedStyles.guidePanel}>
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
                    <MonthPicker
                        label="Velg reguleringsdato"
                        value={startDato}
                        onChange={(dato) => setStartDato(dato)}
                    />

                    <Button
                        onClick={() => startDato && reguler({ fraOgMedMåned: toIsoMonthOrNull(startDato)! })}
                        loading={RemoteData.isPending(reguleringsstatus)}
                        disabled={!RemoteData.isInitial(reguleringsstatus)}
                    >
                        Start regulering
                    </Button>
                    {RemoteData.isSuccess(reguleringsstatus) && <Alert variant="success">Regulering gjennomført</Alert>}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default Gregulering;
