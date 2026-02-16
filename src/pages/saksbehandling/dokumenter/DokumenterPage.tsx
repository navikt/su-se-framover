import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { ChevronLeftIcon, FileTextIcon } from '@navikt/aksel-icons';
import {
    Accordion,
    Alert,
    BodyShort,
    Box,
    Button,
    Heading,
    HStack,
    Link,
    Loader,
    Modal,
    Tag,
    VStack,
} from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { distribuerDokument, hentAdresseForDokument, hentEksterneDokumenter } from '~src/api/dokumentApi';
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
import {
    DokumentUtsendingsinfo,
    JournalpostDokumentInfo,
    Utsendingsinfo,
    VarselSendt,
    VarselType,
} from '~src/types/dokument/JournalpostDokumentInfo';
import * as DateUtils from '~src/utils/date/dateUtils';
import { getBlob, getPdfBlob } from '~src/utils/dokumentUtils';
import DokumentHeader from './DokumentHeader';
import styles from './dokumenterPage.module.less';

const REVOKE_FALLBACK_MS = 5_000;

const openPdfInNewTab = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWindow) {
        URL.revokeObjectURL(url);
        return;
    }

    let revoked = false;
    const revoke = () => {
        if (revoked) return;
        revoked = true;
        URL.revokeObjectURL(url);
        window.clearTimeout(fallbackTimeoutId);
    };

    const fallbackTimeoutId = window.setTimeout(revoke, REVOKE_FALLBACK_MS);

    newWindow.addEventListener('load', revoke, { once: true });
};

const formatVarselType = (type: VarselType): string => {
    switch (type) {
        case VarselType.Epost:
            return 'E-post';
        case VarselType.Sms:
            return 'SMS';
        default:
            return 'Ukjent';
    }
};

const formatVarselTidspunkt = (varslingstidspunkt: string | null): string | null => {
    if (!varslingstidspunkt) {
        return null;
    }

    const dato = new Date(varslingstidspunkt);
    if (Number.isNaN(dato.getTime())) {
        return varslingstidspunkt;
    }

    return DateUtils.formatDateTime(dato);
};

const formatVarselMottaker = (varsel: VarselSendt): string => {
    const tidspunkt = formatVarselTidspunkt(varsel.varslingstidspunkt);
    const deler: string[] = [];

    if (tidspunkt) {
        deler.push(`varslet ${tidspunkt}`);
    }

    if (varsel.passert40TimerSidenVarsling != null) {
        deler.push(
            varsel.passert40TimerSidenVarsling
                ? 'over 40 timer siden varsling (indikasjon)'
                : 'under 40 timer siden varsling (indikasjon)',
        );
    }

    if (deler.length === 0) {
        return `- ${formatVarselType(varsel.type)}: ${varsel.adresse}`;
    }

    return `- ${formatVarselType(varsel.type)}: ${varsel.adresse}, ${deler.join(', ')}`;
};

const getUtsendingsinfoTekst = (utsendingsinfo: Utsendingsinfo | null) => {
    if (!utsendingsinfo) {
        return null;
    }

    const linjer: string[] = [];
    const fysiskpost = utsendingsinfo.fysiskpostSendt?.trim() || null;

    if (fysiskpost) {
        linjer.push('Fysisk post sendt til:');
        linjer.push(fysiskpost);
    }

    if (utsendingsinfo.digitalpostSendt) {
        if (linjer.length > 0) {
            linjer.push('');
        }
        linjer.push('Digital post sendt (egen kanal, uavhengig av fysisk post).');
    }

    const varsler = utsendingsinfo.varselSendt;
    if (varsler.length > 0) {
        if (linjer.length > 0) {
            linjer.push('');
        }
        const harSms = varsler.some((varsel) => varsel.type === VarselType.Sms);
        if (harSms) {
            linjer.push('Varsel sendt til SMS.');
        } else {
            linjer.push('Varsel sendt til e-post.');
        }

        linjer.push(...varsler.map(formatVarselMottaker));
    }

    return linjer.length > 0 ? linjer.join('\n') : null;
};

const DokumenterPage = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const navigate = useNavigate();

    return (
        <div className={styles.outerContainer}>
            <div className={styles.container}>
                <DokumentHeader saksnummer={props.sak.saksnummer} />
                <div className={styles.contentContainer}>
                    <VStack gap="5">
                        <VStack gap="4">
                            <Heading size="small">Brev i sak</Heading>
                            <VisDokumenter id={props.sak.id} idType={DokumentIdType.Sak} />
                            <Heading size="small">Eksterne dokumenter for klage</Heading>
                            <VisEksterneDokumenter sakId={props.sak.id} />
                        </VStack>
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
    }, [props.id, props.idType]);

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

const VisEksterneDokumenter = (props: { sakId: string }) => {
    const [dokumenterState, fetchDokumenter] = useApiCall(hentEksterneDokumenter);

    useEffect(() => {
        fetchDokumenter({ sakId: props.sakId });
    }, [props.sakId]);

    return pipe(
        dokumenterState,
        RemoteData.fold3(
            () => (
                <div className={styles.loaderContainer}>
                    <Loader size="large" title="Henter eksterne dokumenter..." />
                </div>
            ),
            (err) => <ApiErrorAlert error={err} />,
            (dokumenter) => {
                if (dokumenter.length === 0) {
                    return <Alert variant="info">Fant ingen eksterne dokumenter for klage</Alert>;
                }

                const sorterteDokumenter = [...dokumenter].sort((a, b) => {
                    if (a.datoOpprettet && b.datoOpprettet) {
                        return b.datoOpprettet.localeCompare(a.datoOpprettet);
                    }
                    if (a.datoOpprettet) return -1;
                    if (b.datoOpprettet) return 1;
                    return 0;
                });

                return (
                    <ol className={styles.dokumentliste}>
                        {sorterteDokumenter.map((d) => (
                            <li key={`${d.journalpostId}-${d.dokumentInfoId}`}>
                                <EksterntDokumentPanel dokument={d} />
                            </li>
                        ))}
                    </ol>
                );
            },
        ),
    );
};

const DokumentPanel = (props: { sakId: string; dokument: Dokument }) => {
    const [skalDistribuere, setSkalDistribuere] = useState<boolean>(false);
    const [adresseDokument, setAdresseDokument] = useState<DokumentUtsendingsinfo | null>(null);
    const [adresseStatus, hentAdresse] = useApiCall(hentAdresseForDokument);
    const [adresseApen, setAdresseApen] = useState(false);
    const journalpostId = props.dokument.journalpostId ?? null;
    const kanHenteAdresse = props.dokument.journalført;
    const utsendingsinfoTekst = getUtsendingsinfoTekst(adresseDokument?.utsendingsinfo ?? null);

    const handleAdresseKlikk = () => {
        const åpenStatus = !adresseApen;
        setAdresseApen(åpenStatus);
        if (åpenStatus && journalpostId && !adresseDokument) {
            hentAdresse({ dokumentId: props.dokument.id, journalpostId }, (dokument) => setAdresseDokument(dokument));
        }
    };

    const handleDokumentClick = (dokument: Dokument) => {
        openPdfInNewTab(getBlob(dokument));
    };

    return (
        <Box background="surface-default" padding="6" borderWidth="1" borderRadius="medium" shadow="small">
            <VStack gap="2">
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
                {kanHenteAdresse ? (
                    <Accordion className={styles.eksterntDokumentAccordion} size="small">
                        <Accordion.Item open={adresseApen}>
                            <Accordion.Header type="button" onClick={handleAdresseKlikk}>
                                Utsendingsinfo
                            </Accordion.Header>
                            <Accordion.Content>
                                {!journalpostId ? (
                                    <BodyShort>Journalpost-id mangler</BodyShort>
                                ) : RemoteData.isPending(adresseStatus) ? (
                                    <Loader size="small" title="Henter adresse..." />
                                ) : RemoteData.isFailure(adresseStatus) ? (
                                    <ApiErrorAlert error={adresseStatus.error} />
                                ) : utsendingsinfoTekst ? (
                                    <BodyShort as="div" className={styles.preWrap}>
                                        {utsendingsinfoTekst}
                                    </BodyShort>
                                ) : adresseDokument ? (
                                    <BodyShort>Ingen utsendingsinfo funnet</BodyShort>
                                ) : null}
                            </Accordion.Content>
                        </Accordion.Item>
                    </Accordion>
                ) : (
                    <BodyShort className={styles.adresseInfo}>
                        Adresse finnes ikke fordi brevet ikke er distribuert.
                    </BodyShort>
                )}
            </VStack>
        </Box>
    );
};

const EksterntDokumentPanel = (props: { dokument: JournalpostDokumentInfo }) => {
    const tittel = props.dokument.dokumentTittel ?? props.dokument.journalpostTittel ?? 'Uten tittel';
    const datoOpprettet = props.dokument.datoOpprettet
        ? DateUtils.formatDate(props.dokument.datoOpprettet)
        : 'Ukjent dato';
    const utsendingsinfoTekst = getUtsendingsinfoTekst(props.dokument.utsendingsinfo);

    const handleDokumentClick = (dokument: JournalpostDokumentInfo) => {
        openPdfInNewTab(getPdfBlob(dokument.pdfBase64));
    };

    return (
        <Box background="surface-default" padding="6" borderWidth="1" borderRadius="medium" shadow="small">
            <VStack gap="2">
                <HStack justify="space-between" align="center">
                    <HStack align="center">
                        <FileTextIcon className={styles.dokumentikon} />
                        <VStack gap="1">
                            <Heading size="medium">
                                <Link onClick={() => handleDokumentClick(props.dokument)}>{tittel}</Link>
                            </Heading>
                            <BodyShort className={styles.linkPanelBeskrivelse}>{datoOpprettet}</BodyShort>
                        </VStack>
                    </HStack>
                </HStack>
                <Accordion className={styles.eksterntDokumentAccordion} size="small">
                    <Accordion.Item>
                        <Accordion.Header>Utsendingsinfo</Accordion.Header>
                        <Accordion.Content>
                            {utsendingsinfoTekst ? (
                                <BodyShort as="div" className={styles.preWrap}>
                                    {utsendingsinfoTekst}
                                </BodyShort>
                            ) : (
                                <BodyShort>Vi har ikke utsendingsinfo</BodyShort>
                            )}
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion>
            </VStack>
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
                adressadresselinje1: values.adresser[0]?.adresselinje ?? '',
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
        <Modal aria-labelledby="distribuer-dokument-heading" open={props.visModal} onClose={props.onClose}>
            <Modal.Header>
                <Heading id="distribuer-dokument-heading" size="medium">
                    Distribuer et dokument
                </Heading>
                <BodyShort>I de fleste tilfeller vil distribuering av brev skje av seg selv.</BodyShort>
                <BodyShort>
                    Likevel vil det være et fåtall av tilfeller der brev ikke kan distribueres automatisk, f.eks ved
                    død. Disse må da distribueres manuelt.
                </BodyShort>
            </Modal.Header>
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
