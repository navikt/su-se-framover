import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { ChevronLeftIcon, FileTextIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Box, Button, HStack, Heading, Link, Loader, Modal, Tag, VStack } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { distribuerDokument } from '~src/api/dokumentApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import DokumentDistribusjonForm from '~src/components/forms/dokument/distribusjon/DokumentDistribusjonForm';
import {
    DokumentDistribusjonFormData,
    dokumentDistribusjonFormSchema,
} from '~src/components/forms/dokument/distribusjon/DokumentDistribusjonFormUtils';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { navigateToSakIntroWithMessage, saksoversiktValgtSak } from '~src/lib/routes';
import { Dokument, DokumentIdType } from '~src/types/dokument/Dokument';
import * as DateUtils from '~src/utils/date/dateUtils';
import { getBlob } from '~src/utils/dokumentUtils';

import styles from './dokumenterPage.module.less';
import DokumentHeader from './DokumentHeader';

const DokumenterPage = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const navigate = useNavigate();

    return (
        <div className={styles.outerContainer}>
            <div className={styles.container}>
                <DokumentHeader saksnummer={props.sak.saksnummer} />
                <div className={styles.contentContainer}>
                    <VStack gap="5">
                        <VisDokumenter id={props.sak.id} idType={DokumentIdType.Sak} />
                        <Button
                            className={styles.tilbakeknapp}
                            variant="secondary"
                            onClick={() => navigate(saksoversiktValgtSak.createURL({ sakId: props.sak.id }))}
                        >
                            <div className={styles.knappInnhold}>
                                <ChevronLeftIcon />
                                <BodyShort>Tilbake</BodyShort>
                            </div>
                        </Button>
                    </VStack>
                </div>
            </div>
        </div>
    );
};

export const VisDokumenter = (props: { id: string; idType: DokumentIdType; ingenBrevTekst?: string }) => {
    const [dokumenterState, fetchDokumenter] = useAsyncActionCreator(sakSlice.hentDokumenter);

    useEffect(() => {
        fetchDokumenter({
            id: props.id,
            idType: props.idType,
        });
    }, [props.id]);

    return pipe(
        dokumenterState,
        RemoteData.fold3(
            () => (
                <div className={styles.loaderContainer}>
                    <Loader size="large" title="Henter brev..." />
                </div>
            ),
            (err) => <ApiErrorAlert error={err} />,
            (dokumenter) =>
                dokumenter.length === 0 ? (
                    <Alert variant="info">{props.ingenBrevTekst ?? 'Fant ingen brev'}</Alert>
                ) : (
                    <>
                        <ol className={styles.dokumentliste}>
                            {dokumenter.map((d) => (
                                <li key={d.id}>
                                    <DokumentPanel sakId={props.id} dokument={d} />
                                </li>
                            ))}
                        </ol>
                    </>
                ),
        ),
    );
};

const DokumentPanel = (props: { sakId: string; dokument: Dokument }) => {
    const [skalDistribuere, setSkalDistribuere] = useState<boolean>(false);

    const handleDokumentClick = (dokument: Dokument) => {
        window.open(URL.createObjectURL(getBlob(dokument)));
    };

    return (
        <Box background="surface-default" padding="6" borderWidth="1" borderRadius="medium" shadow="small">
            <HStack justify="space-between" align="center">
                <HStack align="center">
                    <FileTextIcon className={styles.dokumentikon} />
                    <VStack gap="1">
                        <Heading size="medium">
                            <Link onClick={() => handleDokumentClick(props.dokument)}>{props.dokument.tittel}</Link>
                        </Heading>

                        <BodyShort className={styles.linkPanelBeskrivelse}>
                            {DateUtils.formatDateTime(props.dokument.opprettet)}
                            <Tag variant={props.dokument.journalført ? 'success' : 'error'} size="small">
                                {props.dokument.journalført ? 'Journalført' : 'Ikke journalført'}
                            </Tag>
                            <Tag variant={props.dokument.brevErBestilt ? 'success' : 'error'} size="small">
                                {props.dokument.brevErBestilt ? 'Sendt' : 'Ikke sendt'}
                            </Tag>
                        </BodyShort>
                    </VStack>
                </HStack>
                {props.dokument.journalført && !props.dokument.brevErBestilt && (
                    <Button
                        style={{ alignSelf: 'flex-end' }}
                        variant="secondary"
                        onClick={() => setSkalDistribuere(true)}
                    >
                        Distribuer
                    </Button>
                )}
                {skalDistribuere && (
                    <DistribueringsModal
                        sakId={props.sakId}
                        dokumentId={props.dokument.id}
                        visModal={skalDistribuere}
                        onClose={() => setSkalDistribuere(false)}
                    />
                )}
            </HStack>
        </Box>
    );
};

const DistribueringsModal = (props: { sakId: string; dokumentId: string; visModal: boolean; onClose: () => void }) => {
    const [distribuerStatus, distribuer] = useApiCall(distribuerDokument);
    const navigate = useNavigate();

    const form = useForm<DokumentDistribusjonFormData>({
        defaultValues: {
            adresser: [{ adresselinje: '' }],
            postnummer: '',
            poststed: '',
        },
        resolver: yupResolver(dokumentDistribusjonFormSchema),
    });

    const handleSubmit = (values: DokumentDistribusjonFormData) => {
        distribuer(
            {
                sakId: props.sakId,
                dokumentId: props.dokumentId,
                adressadresselinje1: values.adresser[0].adresselinje!,
                adressadresselinje2: values.adresser[1]?.adresselinje ? values.adresser[1].adresselinje : null,
                adressadresselinje3: values.adresser[2]?.adresselinje ? values.adresser[2].adresselinje : null,
                postnummer: values.postnummer,
                poststed: values.poststed,
            },
            () => {
                navigateToSakIntroWithMessage(navigate, 'Brev er sendt!', props.sakId);
            },
        );
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
                    <DokumentDistribusjonForm control={form.control} />

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

export default DokumenterPage;
