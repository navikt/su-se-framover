import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { ExternalLinkIcon, PencilWritingIcon, XMarkOctagonIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, HelpText, Modal, Select, TextField } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { getDokument } from '~src/api/dokumentApi';
import * as kontrollsamtaleApi from '~src/api/kontrollsamtaleApi';
import ApiErrorAlert, { useApiErrorMessages } from '~src/components/apiErrorAlert/ApiErrorAlert';
import { MonthPicker } from '~src/components/inputs/datePicker/DatePicker';
import { ToastType, createToast, useToast } from '~src/components/toast/Toast';
import { useApiCall, useBrevForhåndsvisning } from '~src/lib/hooks';
import { navigateToSakIntroWithMessage } from '~src/lib/routes';
import { Kontrollsamtale } from '~src/types/Kontrollsamtale';
import { formatDate, parseNonNullableIsoDateOnly, toIsoMonth } from '~src/utils/date/dateUtils';

import { kontrollsamtaleStatusTextMapper, kontrollsamtalestatusToFormStatus } from './KontrollsamtaleUtils';
import styles from './OppsummeringAvKontrollsamtale.module.less';
import {
    KontrollsamtaleFormStatus,
    OppdaterKontrollsamtaleInnkallingsdato,
    OppdaterKontrollsamtaleStatusOgJournalpostIdFormData,
    oppdaterKontrollsamtaleInnkallingsdatoSchema,
    oppdaterKontrollsamtaleStatusOgJournalpostIdFormDataSchema,
} from './OppsummeringAvKontrollsamtaleUtils';

const OppsummeringAvKontrollsamtale = (props: {
    sakId: string;
    kontrollsamtale: Kontrollsamtale;
    medEdit: boolean;
}) => {
    const { insert } = useToast();
    const apiErrorMessages = useApiErrorMessages();
    const [dokumentStatus, hentDokument] = useBrevForhåndsvisning(getDokument);

    useEffect(() => {
        if (RemoteData.isFailure(dokumentStatus)) {
            insert(
                createToast({
                    type: ToastType.ERROR,
                    duration: 5000,
                    message: apiErrorMessages(dokumentStatus.error),
                }),
            );
        }
    }, [dokumentStatus]);

    return (
        <div className={styles.oppsummeringsContainer}>
            <div>
                <div className={styles.kontrollsamtaleDetalje}>
                    <BodyShort>Id</BodyShort>
                    <BodyShort>{props.kontrollsamtale.id}</BodyShort>
                </div>
                <OppsummerKontrollsamtaleStatus
                    sakId={props.sakId}
                    kontrollsamtale={props.kontrollsamtale}
                    medEdit={props.medEdit}
                />
                <div className={styles.kontrollsamtaleDetalje}>
                    <BodyShort>Frist</BodyShort>
                    <BodyShort>{formatDate(props.kontrollsamtale.frist)}</BodyShort>
                </div>
                <OppsummerKontrollsamtaleInnkallingsdato
                    sakId={props.sakId}
                    kontrollsamtale={props.kontrollsamtale}
                    medEdit={props.medEdit}
                />
                <div className={styles.kontrollsamtaleDetalje}>
                    <BodyShort>Dokument-id</BodyShort>
                    <BodyShort>
                        {props.kontrollsamtale.dokumentId ? (
                            <Button
                                className={styles.buttonMedIKon}
                                type="button"
                                variant="tertiary"
                                onClick={() => hentDokument({ dokumentId: props.kontrollsamtale.dokumentId! })}
                            >
                                {props.kontrollsamtale.dokumentId} <ExternalLinkIcon />
                            </Button>
                        ) : (
                            'Ikke funnet'
                        )}
                    </BodyShort>
                </div>
                <OppsummerKontrollsamtaleJournalpostKontrollnotat
                    sakId={props.sakId}
                    kontrollsamtale={props.kontrollsamtale}
                    medEdit={props.medEdit}
                />
            </div>
            {props.medEdit && <EditKontrollsamtale sakId={props.sakId} kontrollsamtale={props.kontrollsamtale} />}
        </div>
    );
};

const OppsummerKontrollsamtaleStatus = (props: {
    sakId: string;
    kontrollsamtale: Kontrollsamtale;
    medEdit: boolean;
}) => {
    const [editStatus, setEditStatus] = useState(false);

    return (
        <div>
            <div className={styles.kontrollsamtaleDetalje}>
                <BodyShort>Status</BodyShort>
                {props.medEdit ? (
                    <Button
                        className={styles.buttonMedIKon}
                        type="button"
                        variant="tertiary"
                        onClick={() => setEditStatus(true)}
                    >
                        {kontrollsamtaleStatusTextMapper(props.kontrollsamtale.status)} <PencilWritingIcon />
                    </Button>
                ) : (
                    <BodyShort>{kontrollsamtaleStatusTextMapper(props.kontrollsamtale.status)}</BodyShort>
                )}
            </div>
            {editStatus && (
                <EditKontrollsamtaleStatusOgJournalpostId
                    visModal={editStatus}
                    onClose={() => setEditStatus(false)}
                    sakId={props.sakId}
                    kontrollsamtaleSomSkalEndres={props.kontrollsamtale}
                />
            )}
        </div>
    );
};

const EditKontrollsamtaleStatusOgJournalpostId = (props: {
    visModal: boolean;
    onClose: () => void;
    sakId: string;
    kontrollsamtaleSomSkalEndres: Kontrollsamtale;
}) => {
    const navigate = useNavigate();
    const [oppdaterStatus, oppdater] = useApiCall(kontrollsamtaleApi.oppdaterKontrollsamtaleStatusOgJournalpost);

    const form = useForm<OppdaterKontrollsamtaleStatusOgJournalpostIdFormData>({
        defaultValues: {
            journalpostId: props.kontrollsamtaleSomSkalEndres.journalpostIdKontrollnotat ?? '',
            status: kontrollsamtalestatusToFormStatus(props.kontrollsamtaleSomSkalEndres.status),
        },
        resolver: yupResolver(oppdaterKontrollsamtaleStatusOgJournalpostIdFormDataSchema),
    });

    return (
        <Modal
            aria-labelledby="Endrer status på kontrollsamtale"
            open={props.visModal}
            onClose={props.onClose}
            header={{ heading: 'Oppdaterer status/Journalpost på kontrollsamtale' }}
            className={styles.modal}
        >
            <Modal.Body className={styles.modalBody}>
                <form
                    className={styles.modalForm}
                    onSubmit={form.handleSubmit((values) => {
                        oppdater(
                            {
                                sakId: props.sakId,
                                kontrollsamtaleId: props.kontrollsamtaleSomSkalEndres.id,
                                status: values.status!,
                                journalpostId: values.journalpostId ? values.journalpostId : null,
                            },
                            () => {
                                navigateToSakIntroWithMessage(
                                    navigate,
                                    'Kontrollsamtalen har blitt oppdatert',
                                    props.sakId,
                                );
                            },
                        );
                    })}
                >
                    <Controller
                        control={form.control}
                        name={'status'}
                        render={({ field, fieldState }) => (
                            <Select
                                {...field}
                                label={'Kontrollsamtalestatus'}
                                error={fieldState.error?.message}
                                value={field.value ?? ''}
                            >
                                <option value="">Velg et alternativ</option>
                                {Object.values(KontrollsamtaleFormStatus).map((grunn) => (
                                    <option value={grunn} key={grunn}>
                                        {kontrollsamtaleStatusTextMapper(grunn)}
                                    </option>
                                ))}
                            </Select>
                        )}
                    />
                    <Controller
                        control={form.control}
                        name={'journalpostId'}
                        render={({ field, fieldState }) => (
                            <TextField
                                label={
                                    <div className={styles.journalpostInputLabel}>
                                        <BodyShort>Kontrollnotatets journalpost-id</BodyShort>
                                        <HelpText>
                                            Journalpost-id er kun påkrevd dersom kontrollsamtale statusen er gjennomført
                                        </HelpText>
                                    </div>
                                }
                                error={fieldState.error?.message}
                                {...field}
                            />
                        )}
                    />
                    {RemoteData.isFailure(oppdaterStatus) && <ApiErrorAlert error={oppdaterStatus.error} />}
                    <div className={styles.buttonsContainer}>
                        <Button type="button" variant="secondary" onClick={() => props.onClose()}>
                            Avbryt
                        </Button>
                        <Button>Oppdater kontrollsamtale</Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

const OppsummerKontrollsamtaleInnkallingsdato = (props: {
    sakId: string;
    kontrollsamtale: Kontrollsamtale;
    medEdit: boolean;
}) => {
    const [editStatus, setEditStatus] = useState(false);
    return (
        <div>
            <div className={styles.kontrollsamtaleDetalje}>
                <BodyShort>Innkallingsdato</BodyShort>
                {props.medEdit ? (
                    <Button
                        className={styles.buttonMedIKon}
                        type="button"
                        variant="tertiary"
                        onClick={() => setEditStatus(true)}
                    >
                        {formatDate(props.kontrollsamtale.innkallingsdato)} <PencilWritingIcon />
                    </Button>
                ) : (
                    <BodyShort>{formatDate(props.kontrollsamtale.innkallingsdato)}</BodyShort>
                )}
            </div>
            {editStatus && (
                <EditKontrollsamtaleInnkallingsdato
                    visModal={editStatus}
                    onClose={() => setEditStatus(false)}
                    sakId={props.sakId}
                    kontrollsamtaleSomSkalEndres={props.kontrollsamtale}
                />
            )}
        </div>
    );
};

const EditKontrollsamtaleInnkallingsdato = (props: {
    visModal: boolean;
    onClose: () => void;
    sakId: string;
    kontrollsamtaleSomSkalEndres: Kontrollsamtale;
}) => {
    const navigate = useNavigate();
    const [oppdaterStatus, oppdater] = useApiCall(kontrollsamtaleApi.oppdaterKontrollsamtaleInnkallingsdato);

    const form = useForm<OppdaterKontrollsamtaleInnkallingsdato>({
        defaultValues: {
            innkallingsmåned: parseNonNullableIsoDateOnly(props.kontrollsamtaleSomSkalEndres.innkallingsdato),
        },
        resolver: yupResolver(oppdaterKontrollsamtaleInnkallingsdatoSchema),
    });

    return (
        <Modal
            aria-labelledby="Endrer innkallingsdato på kontrollsamtale"
            open={props.visModal}
            onClose={props.onClose}
            header={{ heading: 'Oppdaterer innkallingsdato på kontrollsamtale' }}
            className={styles.modal}
        >
            <Modal.Body className={styles.modalBody}>
                <form
                    className={styles.modalForm}
                    onSubmit={form.handleSubmit((values) => {
                        oppdater(
                            {
                                sakId: props.sakId,
                                kontrollsamtaleId: props.kontrollsamtaleSomSkalEndres.id,
                                innkallingsmåned: toIsoMonth(values.innkallingsmåned!),
                            },
                            () => {
                                navigateToSakIntroWithMessage(
                                    navigate,
                                    'Kontrollsamtalen har blitt oppdatert',
                                    props.sakId,
                                );
                            },
                        );
                    })}
                >
                    <Controller
                        control={form.control}
                        name={'innkallingsmåned'}
                        render={({ field, fieldState }) => (
                            <MonthPicker
                                label={'Innkallingsdato'}
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                    {RemoteData.isFailure(oppdaterStatus) && <ApiErrorAlert error={oppdaterStatus.error} />}
                    <div className={styles.buttonsContainer}>
                        <Button type="button" variant="secondary" onClick={() => props.onClose()}>
                            Avbryt
                        </Button>
                        <Button>Oppdater kontrollsamtale</Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

const OppsummerKontrollsamtaleJournalpostKontrollnotat = (props: {
    sakId: string;
    kontrollsamtale: Kontrollsamtale;
    medEdit: boolean;
}) => {
    const [editStatus, setEditStatus] = useState(false);
    return (
        <div>
            <div className={styles.kontrollsamtaleDetalje}>
                <BodyShort>kontrollnotatets journalpost-id</BodyShort>
                {props.medEdit ? (
                    <Button
                        className={styles.buttonMedIKon}
                        type="button"
                        variant="tertiary"
                        onClick={() => setEditStatus(true)}
                    >
                        {props.kontrollsamtale.journalpostIdKontrollnotat ?? 'Ikke funnet'} <PencilWritingIcon />
                    </Button>
                ) : (
                    <BodyShort>{props.kontrollsamtale.journalpostIdKontrollnotat ?? 'Ikke funnet'}</BodyShort>
                )}
            </div>
            {editStatus && (
                <EditKontrollsamtaleStatusOgJournalpostId
                    visModal={editStatus}
                    onClose={() => setEditStatus(false)}
                    sakId={props.sakId}
                    kontrollsamtaleSomSkalEndres={props.kontrollsamtale}
                />
            )}
        </div>
    );
};

const EditKontrollsamtale = (props: { sakId: string; kontrollsamtale: Kontrollsamtale }) => {
    const [visKontrollsamtaleModal, setVisKontrollsamtaleModal] = useState(false);

    return (
        <div>
            <EndreKontrollsamtaleModal
                visModal={visKontrollsamtaleModal}
                onClose={() => setVisKontrollsamtaleModal(false)}
                sakId={props.sakId}
                kontrollsamtaleSomSkalEndres={props.kontrollsamtale}
            />
            <Button
                className={styles.annullerKontrollsamtaleIkon}
                variant="secondary"
                type="button"
                size="small"
                onClick={() => {
                    setVisKontrollsamtaleModal(true);
                }}
            >
                <XMarkOctagonIcon fontSize={'1rem'} aria-label="Blyantikon" />
            </Button>
        </div>
    );
};

const EndreKontrollsamtaleModal = (props: {
    visModal: boolean;
    onClose: () => void;
    sakId: string;
    kontrollsamtaleSomSkalEndres: Kontrollsamtale;
}) => {
    const navigate = useNavigate();
    const [annullerStatus, annuller] = useApiCall(kontrollsamtaleApi.annullerKontrollsamtale);

    return (
        <Modal
            aria-labelledby="Annuller kontrollsamtale"
            open={props.visModal}
            onClose={props.onClose}
            header={{ heading: 'Annuler kontrollsamtale' }}
        >
            <Modal.Body className={styles.modalBody}>
                <BodyShort>
                    Er du sikker på at du vil annullere kontrollsamtalen med id {props.kontrollsamtaleSomSkalEndres.id}?
                </BodyShort>
                {RemoteData.isFailure(annullerStatus) && <ApiErrorAlert error={annullerStatus.error} />}
                <div className={styles.buttonsContainer}>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            props.onClose();
                        }}
                    >
                        Avbryt
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            annuller(
                                { sakId: props.sakId, kontrollsamtaleId: props.kontrollsamtaleSomSkalEndres.id },
                                () => {
                                    navigateToSakIntroWithMessage(
                                        navigate,
                                        'Kontrollsamtalen har blitt annullert',
                                        props.sakId,
                                    );
                                },
                            );
                        }}
                    >
                        Annuller
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default OppsummeringAvKontrollsamtale;
