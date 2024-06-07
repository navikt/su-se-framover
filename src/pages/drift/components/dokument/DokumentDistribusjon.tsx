import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, BodyShort, Button, HelpText, Modal, TextField } from '@navikt/ds-react';
import { useState } from 'react';
import { Control, Controller, useFieldArray, useForm } from 'react-hook-form';

import { distribuerDokument } from '~src/api/driftApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
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
            adresser: [{ adresselinje: '' }],
            postnummer: '',
            poststed: '',
        },
        resolver: yupResolver(distribuerDokumentSchema),
    });

    const handleSubmit = (values: DistribuerDokumentFormData) => {
        distribuer({
            dokumentId: values.dokumentId,
            sakId: values.sakId,
            adressadresselinje1: values.adresser[0].adresselinje!,
            adressadresselinje2: values.adresser[1]?.adresselinje ? values.adresser[1].adresselinje : null,
            adressadresselinje3: values.adresser[2]?.adresselinje ? values.adresser[2].adresselinje : null,
            postnummer: values.postnummer,
            poststed: values.poststed,
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
                    <div className={styles.formInputsContainer}>
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
                                <TextField
                                    label={'Sak id'}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />
                        <Adresselinjer control={form.control} />
                        <div className={styles.postContainer}>
                            <Controller
                                control={form.control}
                                name={'postnummer'}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        label={
                                            <div className={styles.label}>
                                                <BodyShort>Postnummer</BodyShort>
                                                <HelpText>Postnummer blir ikke validert</HelpText>
                                            </div>
                                        }
                                        onChange={field.onChange}
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />
                            <Controller
                                control={form.control}
                                name={'poststed'}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        label={
                                            <div className={styles.label}>
                                                <BodyShort>Poststed</BodyShort>
                                                <HelpText>Poststed blir ikke validert</HelpText>
                                            </div>
                                        }
                                        onChange={field.onChange}
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>

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

const Adresselinjer = (props: { control: Control<DistribuerDokumentFormData> }) => {
    const adresser = useFieldArray({
        control: props.control,
        name: 'adresser',
    });

    return (
        <div className={styles.adresselinjeComponentContainer}>
            {adresser.fields.map((el, idx) => (
                <Controller
                    key={el.id}
                    control={props.control}
                    name={`adresser.${idx}.adresselinje`}
                    render={({ field, fieldState }) => (
                        <TextField
                            {...field}
                            autoComplete="off"
                            onChange={field.onChange}
                            value={field.value ?? ''}
                            label={`Adresselinje ${idx + 1}`}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            ))}
            <div className={styles.adresselinjeButtons}>
                {adresser.fields.length < 3 && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            adresser.append({ adresselinje: '' });
                        }}
                    >
                        +
                    </Button>
                )}
                {adresser.fields.length > 1 && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            adresser.remove(adresser.fields.length - 1);
                        }}
                    >
                        -
                    </Button>
                )}
            </div>
        </div>
    );
};

export default DokumentDistribusjon;
