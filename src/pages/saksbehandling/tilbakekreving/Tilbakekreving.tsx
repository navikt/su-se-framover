import { BodyLong, Button, Heading, Panel } from '@navikt/ds-react';
import React from 'react';
import { useOutletContext } from 'react-router-dom';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';

import messages from './Tilbakekreving-nb';
import styles from './Tilbakekreving.module.less';

const Tilbakekreving = () => {
    const kanTilbakekreves = true;
    const { formatMessage } = useI18n({ messages });
    const { sak } = useOutletContext<SaksoversiktContext>();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headingContainer}>
                <Heading className={styles.tilbakekrevingHeading} size="large">
                    {formatMessage('page.heading')}
                </Heading>
            </div>

            <div className={styles.mainContentContainer}>
                {kanTilbakekreves ? <KanTilbakekreves sakId={sak.id} /> : <KanIkkeTilbakekreves sakId={sak.id} />}
            </div>
        </div>
    );
};

const KanTilbakekreves = (props: { sakId: string }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Panel border className={styles.panelContentContainer}>
            <div>
                <Heading size="medium">{formatMessage('tilbakekreving.kanTilbakekreves.heading')}</Heading>
                <BodyLong>{formatMessage('tilbakekreving.kanTilbakekreves.text')}</BodyLong>
            </div>

            <div className={styles.knappContainer}>
                <LinkAsButton variant="secondary" href={routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}>
                    {formatMessage('knapp.tilbake')}
                </LinkAsButton>
                <Button>{formatMessage('tilbakekreving.kanTilbakekreves.ny')}</Button>
            </div>
        </Panel>
    );
};

const KanIkkeTilbakekreves = (props: { sakId: string }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <Panel border className={styles.panelContentContainer}>
            <div>
                <Heading size="medium">{formatMessage('tilbakekreving.kanIkkeTilbakekreves.heading')}</Heading>
                <BodyLong>{formatMessage('tilbakekreving.kanIkkeTilbakekreves.text')}</BodyLong>
            </div>

            <LinkAsButton variant="secondary" href={routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}>
                {formatMessage('knapp.tilbake')}
            </LinkAsButton>
        </Panel>
    );
};

export default Tilbakekreving;
