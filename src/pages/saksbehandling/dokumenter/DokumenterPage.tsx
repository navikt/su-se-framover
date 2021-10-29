import * as RemoteData from '@devexperts/remote-data-ts';
import { FileContent } from '@navikt/ds-icons';
import { Alert, Button, Heading, Ingress, LinkPanel, Loader, Tag } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import * as React from 'react';
import { useHistory } from 'react-router';

import { ÅpentBrev } from '~assets/Illustrations';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~lib/hooks';
import { MessageFormatter, useI18n } from '~lib/i18n';
import { Dokument, DokumentIdType } from '~types/dokument/Dokument';
import { Sak } from '~types/Sak';
import * as DateUtils from '~utils/date/dateUtils';
import { getBlob } from '~utils/dokumentUtils';

import messages from './dokumenterPage-nb';
import styles from './dokumenterPage.module.less';

const Header = (props: { saksnummer: number; formatMessage: MessageFormatter<typeof messages> }) => (
    <div className={styles.headerContainer}>
        <div className={styles.illustrasjonContainer}>
            <div className={styles.illustrasjon}>
                <ÅpentBrev />
            </div>
        </div>
        <Heading level="1" size="large">
            {props.formatMessage('undertittel')}
        </Heading>
        <Ingress>
            {props.formatMessage('tittel.saksnummer', {
                saksnummer: props.saksnummer,
            })}
        </Ingress>
    </div>
);

const DokumenterPage = (props: { sak: Sak }) => {
    const [dokumenterState, fetchDokumenter] = useAsyncActionCreator(sakSlice.hentDokumenter);
    const history = useHistory();

    const { formatMessage } = useI18n({ messages });

    React.useEffect(() => {
        fetchDokumenter({
            id: props.sak.id,
            idType: DokumentIdType.Sak,
        });
    }, [props.sak.id]);

    const handleDokumentClick = (dokument: Dokument) => {
        window.open(URL.createObjectURL(getBlob(dokument)));
    };

    return (
        <div className={styles.outerContainer}>
            <div className={styles.container}>
                <Header saksnummer={props.sak.saksnummer} formatMessage={formatMessage} />
                <div className={styles.contentContainer}>
                    {pipe(
                        dokumenterState,
                        RemoteData.fold(
                            () => <Loader />,
                            () => <Loader />,
                            (err) => (
                                <Alert variant="error">{err?.body?.message ?? formatMessage('feil.ukjent')}</Alert>
                            ),
                            (dokumenter) =>
                                dokumenter.length === 0 ? (
                                    <Alert variant="error">{formatMessage('feil.ingenBrev')}</Alert>
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
                                                        <FileContent className={styles.dokumentikon} />
                                                        <div>
                                                            <LinkPanel.Title>{d.tittel}</LinkPanel.Title>
                                                            <LinkPanel.Description
                                                                className={styles.linkPanelBeskrivelse}
                                                            >
                                                                {DateUtils.formatDateTime(d.opprettet)}
                                                                <div className={styles.statusContainer}>
                                                                    <Tag
                                                                        variant={d.journalført ? 'success' : 'error'}
                                                                        size="small"
                                                                    >
                                                                        {d.journalført
                                                                            ? 'Journalført'
                                                                            : 'Ikke journalført'}
                                                                    </Tag>
                                                                    <Tag
                                                                        variant={d.brevErBestilt ? 'success' : 'error'}
                                                                        size="small"
                                                                    >
                                                                        {d.brevErBestilt ? 'Sendt' : 'Ikke sendt'}
                                                                    </Tag>
                                                                </div>
                                                            </LinkPanel.Description>
                                                        </div>
                                                    </div>
                                                </LinkPanel>
                                            </li>
                                        ))}
                                    </ol>
                                )
                        )
                    )}
                    <Button
                        variant="secondary"
                        onClick={() => {
                            history.goBack();
                        }}
                    >
                        {formatMessage('knapp.tilbake')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DokumenterPage;
