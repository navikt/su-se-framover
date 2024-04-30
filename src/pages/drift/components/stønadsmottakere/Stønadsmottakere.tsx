import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Checkbox, Label, Modal } from '@navikt/ds-react';
import { useState } from 'react';

import { stønadsmottakere } from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { MonthPicker } from '~src/components/inputs/datePicker/DatePicker';
import { useApiCall } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import { toIsoMonthOrNull } from '~src/utils/date/dateUtils';

import styles from './Stønadsmottakere.module.less';

const Stønadsmottakere = () => {
    const [stønadsmottakereModal, setStønadsmottakereModal] = useState<boolean>(false);
    return (
        <div>
            <Button variant="secondary" type="button" onClick={() => setStønadsmottakereModal(true)}>
                Stønadsmottakere
            </Button>
            {stønadsmottakereModal && (
                <StønadsmottakereModal open={stønadsmottakereModal} onClose={() => setStønadsmottakereModal(false)} />
            )}
        </div>
    );
};

export default Stønadsmottakere;

const StønadsmottakereModal = (props: { open: boolean; onClose: () => void }) => {
    const [medEps, setMedEps] = useState<boolean>(false);
    const [fraOgMed, setFraOgMed] = useState<Nullable<Date>>(null);
    const [stønadsmottakereStatus, hentStønadsmottakere] = useApiCall(stønadsmottakere);

    const onSubmit = () => {
        hentStønadsmottakere({ fraOgMed: toIsoMonthOrNull(fraOgMed), inkluderEPS: medEps });
    };

    return (
        <Modal
            className={styles.modal}
            open={props.open}
            onClose={props.onClose}
            header={{ heading: 'Stønadsmottakere' }}
        >
            <Modal.Body>
                <div>
                    <div className={styles.form}>
                        <div className={styles.formInputs}>
                            <MonthPicker label="Fra og med" value={fraOgMed} onChange={(dato) => setFraOgMed(dato)} />
                            <Checkbox onChange={() => setMedEps(!medEps)} checked={medEps}>
                                Med eps
                            </Checkbox>
                        </div>
                        <Button onClick={onSubmit}>Hent stønadsmottakere</Button>
                    </div>
                    <hr />
                    {RemoteData.isFailure(stønadsmottakereStatus) && (
                        <ApiErrorAlert error={stønadsmottakereStatus.error} />
                    )}
                    {RemoteData.isSuccess(stønadsmottakereStatus) && (
                        <div className={styles.resultContainer}>
                            <Label as="p">For dato: {stønadsmottakereStatus.value.dato}</Label>
                            <Label as="p">Antall: {stønadsmottakereStatus.value.fnr.length}</Label>
                            <Label as="p">Fødselsnummere: </Label>
                            <div>
                                <ul className={styles.result}>
                                    {stønadsmottakereStatus.value.fnr.map((s) => (
                                        <li key={s}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};
