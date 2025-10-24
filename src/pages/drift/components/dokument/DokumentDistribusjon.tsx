import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Modal, TextField } from '@navikt/ds-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { distribuerDokument } from '~src/api/dokumentApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import DokumentDistribusjonForm from '~src/components/forms/dokument/distribusjon/DokumentDistribusjonForm';
import { useApiCall } from '~src/lib/hooks';

import styles from './DokumentDistribusjon.module.less';
import { DistribuerDokumentFormData, distribuerDokumentSchema } from './DokumentDistribusjonUtils';

const DokumentDistribusjon = () => {
    const [visDokumentDistribusjonsmodal, setDokumentDistribusjonsmodal] = useState(false);

    return (
        <div>
            <DokumentDistribusjonsModal
                visModal={visDokumentDistribusjonsmodal}
                onClose={() => setDokumentDistribusjonsmodal(false)}
            />
            <Button
                variant="secondary"
                type="button"
                onClick={() => {
                    setDokumentDistribusjonsmodal(true);
                }}
            >
                Manuell brevutsending
            </Button>
        </div>
    );
};

const DokumentDistribusjonsModal = (props: { visModal: boolean; onClose: () => void }) => {
    const [distribuerStatus, distribuer] = useApiCall(distribuerDokument);

    const form = useForm<DistribuerDokumentFormData>({
        defaultValues: {
            dokumentId: '',
            sakId: '',
            distribusjon: {
                adresser: [{ adresselinje: '' }],
                postnummer: '',
                poststed: '',
            },
        },
        resolver: yupResolver(distribuerDokumentSchema),
    });

    const handleSubmit = (values: DistribuerDokumentFormData) => {
        distribuer({
            dokumentId: values.dokumentId,
            sakId: values.sakId,
            adressadresselinje1: values.distribusjon.adresser[0].adresselinje!,
            adressadresselinje2: values.distribusjon.adresser[1]?.adresselinje
                ? values.distribusjon.adresser[1].adresselinje
                : null,
            adressadresselinje3: values.distribusjon.adresser[2]?.adresselinje
                ? values.distribusjon.adresser[2].adresselinje
                : null,
            postnummer: values.distribusjon.postnummer,
            poststed: values.distribusjon.poststed,
        });
    };

    return (
        <Modal
            aria-labelledby="Distribuer dokument"
            open={props.visModal}
            onClose={props.onClose}
            header={{ heading: 'Distribuer et dokument' }}
        >
            <Modal.Body className={styles.modalBody}>
                <form className={styles.formContainer} onSubmit={form.handleSubmit(handleSubmit)}>
                    <Controller
                        control={form.control}
                        name={'dokumentId'}
                        render={({ field, fieldState }) => (
                            <TextField
                                label={'Dokument id'}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        control={form.control}
                        name={'sakId'}
                        render={({ field, fieldState }) => (
                            <TextField label={'Sak id'} onChange={field.onChange} error={fieldState.error?.message} />
                        )}
                    />
                    <DokumentDistribusjonForm control={form.control} prependNames="distribusjon" />

                    {RemoteData.isSuccess(distribuerStatus) && <Alert variant="success">Brev er sendt!</Alert>}
                    {RemoteData.isFailure(distribuerStatus) && <ApiErrorAlert error={distribuerStatus.error} />}
                    <div className={styles.formButtonsContainer}>
                        <Button type="button" variant="secondary" onClick={props.onClose}>
                            Avbryt
                        </Button>
                        <Button loading={RemoteData.isPending(distribuerStatus)}>Send brev</Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default DokumentDistribusjon;
