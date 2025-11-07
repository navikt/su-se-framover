import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Label, Modal, Select, TextField } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { getDokument } from '~src/api/dokumentApi';
import * as kontrollsamtaleApi from '~src/api/kontrollsamtaleApi';
import ApiErrorAlert, { useApiErrorMessages } from '~src/components/apiErrorAlert/ApiErrorAlert';
import { MonthPicker } from '~src/components/inputs/datePicker/DatePicker';
import { createToast, ToastType, useToast } from '~src/components/toast/Toast';
import { useApiCall, useBrevForhåndsvisning } from '~src/lib/hooks';
import { navigateToSakIntroWithMessage } from '~src/lib/routes';
import { Kontrollsamtale, KontrollsamtaleStatus } from '~src/types/Kontrollsamtale';
import { formatDate, parseNonNullableIsoDateOnly, toIsoMonth } from '~src/utils/date/dateUtils';
import {
    erKontrollsamtaleAnnullert,
    erKontrollsamtaleGjennomført,
    erKontrollsamtaleIkkeMøttInnenFrist,
} from '~src/utils/KontrollsamtaleUtils';

import styles from './OppsummeringAvKontrollsamtale.module.less';
import {
    KontrollsamtaleFormStatus,
    kontrollsamtaleStatusTextMapper,
    kontrollsamtalestatusToFormStatus,
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
        <div>
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
            {props.medEdit &&
                !(
                    erKontrollsamtaleIkkeMøttInnenFrist(props.kontrollsamtale) ||
                    erKontrollsamtaleGjennomført(props.kontrollsamtale) ||
                    erKontrollsamtaleAnnullert(props.kontrollsamtale)
                ) && <AnnullerKontrollsamtale sakId={props.sakId} kontrollsamtale={props.kontrollsamtale} />}
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
                        {kontrollsamtaleStatusTextMapper(props.kontrollsamtale.status)}
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

const EditStatusTextHelper = (props: { kontrollsamtale: Kontrollsamtale }) => {
    const kanAnnulleres = props.kontrollsamtale.lovligeStatusovergangerForSaksbehandler.includes(
        KontrollsamtaleStatus.ANNULLERT,
    );

    const statuserUtenAnnullering = props.kontrollsamtale.lovligeStatusovergangerForSaksbehandler.filter(
        (status) => status !== KontrollsamtaleStatus.ANNULLERT,
    );

    return (
        <div>
            {statuserUtenAnnullering.length > 0 ? (
                <div>
                    <Label>Kontrollsamtalen kan bli oppdatert til følgende statuser: </Label>
                    <ul>
                        {props.kontrollsamtale.lovligeStatusovergangerForSaksbehandler
                            .filter((status) => status !== KontrollsamtaleStatus.ANNULLERT)
                            .map((status, idx) => (
                                <BodyShort key={`${status}-${idx}`}>
                                    - {kontrollsamtaleStatusTextMapper(status)}
                                </BodyShort>
                            ))}
                    </ul>
                    {kanAnnulleres && (
                        <BodyShort>
                            Kontrollsamtalen kan også annuleres ved å klikke på annuller knappen i oversikten
                        </BodyShort>
                    )}
                </div>
            ) : (
                <div>
                    <Label>Kontrollsamtalen kan ikke oppdateres til noen nye statuser</Label>
                    {kanAnnulleres && (
                        <BodyShort>
                            Kontrollsamtalen kan annuleres ved å klikke på annuller knappen i oversikten
                        </BodyShort>
                    )}
                </div>
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

    const kanOppdatereKontrollsamtale =
        props.kontrollsamtaleSomSkalEndres.lovligeStatusovergangerForSaksbehandler.filter(
            (status) => status !== KontrollsamtaleStatus.ANNULLERT,
        ).length > 1;

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
                    <EditStatusTextHelper kontrollsamtale={props.kontrollsamtaleSomSkalEndres} />

                    {kanOppdatereKontrollsamtale && (
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
                    )}

                    {form.watch('status') === KontrollsamtaleFormStatus.GJENNOMFØRT && (
                        <Controller
                            control={form.control}
                            name={'journalpostId'}
                            render={({ field, fieldState }) => (
                                <TextField
                                    label="Kontrollnotatets journalpost-id"
                                    error={fieldState.error?.message}
                                    {...field}
                                />
                            )}
                        />
                    )}
                    {RemoteData.isFailure(oppdaterStatus) && <ApiErrorAlert error={oppdaterStatus.error} />}
                    {kanOppdatereKontrollsamtale && (
                        <div className={styles.buttonsContainer}>
                            <Button type="button" variant="secondary" onClick={() => props.onClose()}>
                                Avbryt
                            </Button>
                            <Button>Oppdater kontrollsamtale</Button>
                        </div>
                    )}
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
                        {formatDate(props.kontrollsamtale.innkallingsdato)}
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
                    {!props.kontrollsamtaleSomSkalEndres.kanOppdatereInnkallingsmåned && (
                        <Label>Datoen for innkalling kan kun oppdateres dersom kontrollsamtalen er planlagt.</Label>
                    )}

                    {!props.kontrollsamtaleSomSkalEndres.kanOppdatereInnkallingsmåned && (
                        <>
                            <Controller
                                control={form.control}
                                name={'innkallingsmåned'}
                                render={({ field, fieldState }) => (
                                    <MonthPicker
                                        label={'Innkallingsdato'}
                                        hjelpetekst="Innkallingsdatoen må være innenfor ytterpunktene av en eller flere stønadsperioder. I tillegg, må den tidligst være neste måned"
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
                        </>
                    )}
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
                        {props.kontrollsamtale.journalpostIdKontrollnotat ?? 'Ikke funnet'}
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

const AnnullerKontrollsamtale = (props: { sakId: string; kontrollsamtale: Kontrollsamtale }) => {
    const [visKontrollsamtaleModal, setVisKontrollsamtaleModal] = useState(false);

    return (
        <div className={styles.editControllsamtaleComponentContainer}>
            <AnnullerKontrollsamtaleModal
                visModal={visKontrollsamtaleModal}
                onClose={() => setVisKontrollsamtaleModal(false)}
                sakId={props.sakId}
                kontrollsamtaleSomSkalEndres={props.kontrollsamtale}
            />
            <Button
                variant="secondary"
                type="button"
                size="small"
                onClick={() => {
                    setVisKontrollsamtaleModal(true);
                }}
            >
                Annuller
            </Button>
        </div>
    );
};

const AnnullerKontrollsamtaleModal = (props: {
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
