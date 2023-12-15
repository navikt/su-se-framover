import * as RemoteData from '@devexperts/remote-data-ts';
import { ChevronLeftIcon, FileTextIcon } from '@navikt/aksel-icons';
import { Alert, BodyLong, Button, Heading, HelpText, LinkPanel, Loader, Tag } from '@navikt/ds-react';
import * as React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { ÅpentBrev } from '~src/assets/Illustrations';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { MessageFormatter, useI18n } from '~src/lib/i18n';
import { saksoversiktValgtSak } from '~src/lib/routes';
import { Dokument, DokumentIdType } from '~src/types/dokument/Dokument';
import * as DateUtils from '~src/utils/date/dateUtils';
import { getBlob } from '~src/utils/dokumentUtils';

import messages from './dokumenterPage-nb';
import * as styles from './dokumenterPage.module.less';

const Header = (props: { saksnummer: number; formatMessage: MessageFormatter<typeof messages> }) => (
    <div className={styles.headerContainer}>
        <div className={styles.illustrasjonContainer}>
            <div className={styles.illustrasjon}>
                <ÅpentBrev />
            </div>
        </div>
        <div className={styles.undertittel}>
            <Heading level="1" size="large">
                {props.formatMessage('undertittel')}
            </Heading>
            <HelpText>{props.formatMessage('dokumenter.helpText')}</HelpText>
        </div>
        <BodyLong size="large">
            {props.formatMessage('tittel.saksnummer', {
                saksnummer: props.saksnummer,
            })}
        </BodyLong>
    </div>
);

const DokumenterPage = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.outerContainer}>
            <div className={styles.container}>
                <Header saksnummer={props.sak.saksnummer} formatMessage={formatMessage} />
                <div className={styles.contentContainer}>
                    <VisDokumenter id={props.sak.id} idType={DokumentIdType.Sak} />
                    <Button
                        className={styles.tilbakeknapp}
                        variant="secondary"
                        onClick={() => navigate(saksoversiktValgtSak.createURL({ sakId: props.sak.id }))}
                    >
                        <ChevronLeftIcon />
                        {formatMessage('knapp.tilbake')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const VisDokumenter = (props: { id: string; idType: DokumentIdType; ingenBrevTekst?: string }) => {
    const [dokumenterState, fetchDokumenter] = useAsyncActionCreator(sakSlice.hentDokumenter);

    const { formatMessage } = useI18n({ messages });

    React.useEffect(() => {
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
                    <Loader size="large" title={formatMessage('loader.henterBrev')} />
                </div>
            ),
            (err) => <Alert variant="error">{err?.body?.message ?? formatMessage('feil.ukjent')}</Alert>,
            (dokumenter) =>
                dokumenter.length === 0 ? (
                    <Alert variant="info">{props.ingenBrevTekst ?? formatMessage('feil.ingenBrev')}</Alert>
                ) : (
                    <ol className={styles.dokumentliste}>
                        {dokumenter.map((d) => (
                            <li key={d.id}>
                                <LinkPanel
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDokumentClick(d);
                                    }}
                                    border
                                >
                                    <div className={styles.dokument}>
                                        <FileTextIcon className={styles.dokumentikon} />
                                        <div>
                                            <LinkPanel.Title>{d.tittel}</LinkPanel.Title>
                                            <LinkPanel.Description className={styles.linkPanelBeskrivelse}>
                                                {DateUtils.formatDateTime(d.opprettet)}
                                                <Tag variant={d.journalført ? 'success' : 'error'} size="small">
                                                    {d.journalført ? 'Journalført' : 'Ikke journalført'}
                                                </Tag>
                                                <Tag variant={d.brevErBestilt ? 'success' : 'error'} size="small">
                                                    {d.brevErBestilt ? 'Sendt' : 'Ikke sendt'}
                                                </Tag>
                                            </LinkPanel.Description>
                                        </div>
                                    </div>
                                </LinkPanel>
                            </li>
                        ))}
                    </ol>
                ),
        ),
    );
};

export default DokumenterPage;
