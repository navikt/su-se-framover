import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { PencilWritingIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Heading, Modal, Skeleton } from '@navikt/ds-react';
import { startOfTomorrow } from 'date-fns';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useOutletContext } from 'react-router-dom';

import * as kontrollsamtaleApi from '~src/api/kontrollsamtaleApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { Kontrollsamtale } from '~src/types/Kontrollsamtale';
import { formatDate, parseNonNullableIsoDateOnly, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import styles from './kontrollsamtalePage.module.less';
import {
    OppdaterKontrollsamtaleFormData,
    OppdaterKontrollsamtaleSchema,
    OpprettNyKontrollsamtaleFormData,
    opprettNyKontrollsamtaleSchema,
} from './KontrollsamtaleUtils';

const KontrollsamtalePage = () => {
    const props = useOutletContext<SaksoversiktContext>();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headingContainer}>
                <Heading className={styles.kontrollsamtaleHeading} size="large">
                    Kontrollsamtale
                </Heading>
            </div>
            <div className={styles.mainContentContainer}>
                <OpprettNyKontrollsamtale sakId={props.sak.id} />
                <OppsummeringAvKontrollsamtaler sakId={props.sak.id} />
            </div>
        </div>
    );
};

const OpprettNyKontrollsamtale = (props: { sakId: string }) => {
    const [status, opprett] = useApiCall(kontrollsamtaleApi.opprettNyKontrollsamtale);

    const form = useForm<OpprettNyKontrollsamtaleFormData>({
        defaultValues: {
            nyKontrollsamtaleDato: null,
        },
        resolver: yupResolver(opprettNyKontrollsamtaleSchema),
    });

    const onSubmit = (values: OpprettNyKontrollsamtaleFormData) => {
        opprett({ sakId: props.sakId, dato: toIsoDateOnlyString(values.nyKontrollsamtaleDato!) });
    };

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Blyant}
            farge={Oppsummeringsfarge.Grønn}
            tittel={'Opprett ny kontrollsamtale'}
        >
            <form className={styles.opprettNyKontrollsamtaleFormContainer} onSubmit={form.handleSubmit(onSubmit)}>
                <Controller
                    control={form.control}
                    name={'nyKontrollsamtaleDato'}
                    render={({ field, fieldState }) => (
                        <DatePicker
                            label={'Velg dato for ny kontrollsamtale'}
                            fromDate={startOfTomorrow()}
                            error={fieldState.error?.message}
                            {...field}
                        />
                    )}
                />

                {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                <div className={styles.buttonsContainer}>
                    <LinkAsButton
                        variant="secondary"
                        href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                    >
                        Tilbake
                    </LinkAsButton>
                    <Button>Opprett ny kontrollsamtale</Button>
                </div>
            </form>
        </Oppsummeringspanel>
    );
};

const OppsummeringAvKontrollsamtaler = (props: { sakId: string }) => {
    const [kontrollsamtaler, hentKontrollsamtaler] = useApiCall(kontrollsamtaleApi.hentKontrollsamtaler);

    useEffect(() => {
        hentKontrollsamtaler({ sakId: props.sakId });
    }, []);

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Liste}
            farge={Oppsummeringsfarge.Lilla}
            tittel="Registrerte kontrollsamtaler"
        >
            {pipe(
                kontrollsamtaler,
                RemoteData.fold(
                    () => null,
                    () => <Skeleton />,
                    (err) => <ApiErrorAlert error={err} />,
                    (kontrollsamtaler) =>
                        kontrollsamtaler.length === 0 ? (
                            <BodyShort>Ingen kontrollsamtaler registrert</BodyShort>
                        ) : (
                            <ul className={styles.kontrollsamtalerContainer}>
                                {kontrollsamtaler.map((k) => (
                                    <li key={k.id}>
                                        <BasicKontrollsamtaleOppsummering kontrollsamtale={k} />
                                    </li>
                                ))}
                            </ul>
                        ),
                ),
            )}
        </Oppsummeringspanel>
    );
};

const BasicKontrollsamtaleOppsummering = (props: { kontrollsamtale: Kontrollsamtale }) => {
    return (
        <div className={styles.oppsummeringsContainer}>
            <div>
                <div className={styles.kontrollsamtaleDetalje}>
                    <BodyShort>Id</BodyShort>
                    <BodyShort>{props.kontrollsamtale.id}</BodyShort>
                </div>
                <div className={styles.kontrollsamtaleDetalje}>
                    <BodyShort>Status</BodyShort>
                    <BodyShort>{props.kontrollsamtale.status}</BodyShort>
                </div>
                <div className={styles.kontrollsamtaleDetalje}>
                    <BodyShort>Frist</BodyShort>
                    <BodyShort>{formatDate(props.kontrollsamtale.frist)}</BodyShort>
                </div>
                <div className={styles.kontrollsamtaleDetalje}>
                    <BodyShort>Innkallingsdato</BodyShort>
                    <BodyShort>{formatDate(props.kontrollsamtale.innkallingsdato)}</BodyShort>
                </div>
                <div className={styles.kontrollsamtaleDetalje}>
                    <BodyShort>Dokument-id</BodyShort>
                    <BodyShort>{props.kontrollsamtale.dokumentId ?? 'Ikke funnet'}</BodyShort>
                </div>
                <div className={styles.kontrollsamtaleDetalje}>
                    <BodyShort>kontrollnotatets journalpost-id</BodyShort>
                    <BodyShort>{props.kontrollsamtale.journalpostIdKontrollnotat ?? 'Ikke funnet'}</BodyShort>
                </div>
            </div>
            <KontrollsamtaleModal kontrollsamtale={props.kontrollsamtale} />
        </div>
    );
};

const KontrollsamtaleModal = (props: { kontrollsamtale: Kontrollsamtale }) => {
    const [visKontrollsamtaleModal, setVisKontrollsamtaleModal] = useState(false);

    return (
        <div>
            <EndreKontrollsamtaleModal
                visModal={visKontrollsamtaleModal}
                onClose={() => setVisKontrollsamtaleModal(false)}
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
                <PencilWritingIcon fontSize={'1rem'} aria-label="Blyantikon" />
            </Button>
        </div>
    );
};

const EndreKontrollsamtaleModal = (props: {
    visModal: boolean;
    onClose: () => void;
    kontrollsamtaleSomSkalEndres: Kontrollsamtale;
}) => {
    const form = useForm<OppdaterKontrollsamtaleFormData>({
        defaultValues: {
            nyDato: parseNonNullableIsoDateOnly(props.kontrollsamtaleSomSkalEndres.innkallingsdato),
        },
        resolver: yupResolver(OppdaterKontrollsamtaleSchema),
    });

    return (
        <Modal
            aria-labelledby="Endre kontrollsamtale modal"
            open={props.visModal}
            onClose={props.onClose}
            header={{ heading: 'Endre kontrollsamtale' }}
        >
            <Modal.Body>
                <form
                    onSubmit={form.handleSubmit((values) => {
                        console.log('TODO', values);
                    })}
                >
                    <Controller
                        control={form.control}
                        name={'nyDato'}
                        render={({ field, fieldState }) => (
                            <DatePicker
                                label={'Velg ny dato for kontrollsamtalen'}
                                fromDate={parseNonNullableIsoDateOnly(
                                    props.kontrollsamtaleSomSkalEndres.innkallingsdato,
                                )}
                                error={fieldState.error?.message}
                                {...field}
                            />
                        )}
                    />

                    <Button>Oppdater kontrollsamtale</Button>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default KontrollsamtalePage;
