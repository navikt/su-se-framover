import * as RemoteData from '@devexperts/remote-data-ts';
import { ChevronLeftIcon, FileTextIcon } from '@navikt/aksel-icons';
import {
    Alert,
    BodyShort,
    Box,
    Button,
    CopyButton,
    HStack,
    Heading,
    Link,
    Loader,
    Tag,
    VStack,
} from '@navikt/ds-react';
import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { saksoversiktValgtSak } from '~src/lib/routes';
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

    const handleDokumentClick = (dokument: Dokument) => {
        window.open(URL.createObjectURL(getBlob(dokument)));
    };

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
                                <li key={`${d.id}-c`}>
                                    <Box
                                        background="surface-default"
                                        padding="6"
                                        borderWidth="1"
                                        borderRadius="medium"
                                        shadow="small"
                                    >
                                        <HStack justify="space-between" align="center">
                                            <HStack align="center">
                                                <FileTextIcon className={styles.dokumentikon} />
                                                <VStack gap="1">
                                                    <Heading size="medium">
                                                        <Link onClick={() => handleDokumentClick(d)}>{d.tittel}</Link>
                                                    </Heading>

                                                    <div className={styles.linkPanelBeskrivelse}>
                                                        <BodyShort>Id: {d.id}</BodyShort>
                                                        <CopyButton className={styles.copyButton} copyText={d.id} />
                                                    </div>

                                                    <BodyShort className={styles.linkPanelBeskrivelse}>
                                                        {DateUtils.formatDateTime(d.opprettet)}
                                                        <Tag variant={d.journalført ? 'success' : 'error'} size="small">
                                                            {d.journalført ? 'Journalført' : 'Ikke journalført'}
                                                        </Tag>
                                                        <Tag
                                                            variant={d.brevErBestilt ? 'success' : 'error'}
                                                            size="small"
                                                        >
                                                            {d.brevErBestilt ? 'Sendt' : 'Ikke sendt'}
                                                        </Tag>
                                                    </BodyShort>
                                                </VStack>
                                            </HStack>
                                        </HStack>
                                    </Box>
                                </li>
                            ))}
                        </ol>
                    </>
                ),
        ),
    );
};

export default DokumenterPage;
