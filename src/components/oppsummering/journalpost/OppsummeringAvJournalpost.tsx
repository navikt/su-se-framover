import { BodyShort } from '@navikt/ds-react';

import { Journalpost } from '~src/types/Journalpost';

import * as styles from './OppsummeringAvJournalpost.module.less';

const OppsummeringAvJournalpost = (props: { journalpost: Journalpost }) => {
    return (
        <div>
            <div className={styles.journalpostDetalje}>
                <BodyShort>Id</BodyShort>
                <BodyShort>{props.journalpost.id}</BodyShort>
            </div>
            <div className={styles.journalpostDetalje}>
                <BodyShort>Tittel</BodyShort>
                <BodyShort>{props.journalpost.tittel}</BodyShort>
            </div>
        </div>
    );
};

export default OppsummeringAvJournalpost;
