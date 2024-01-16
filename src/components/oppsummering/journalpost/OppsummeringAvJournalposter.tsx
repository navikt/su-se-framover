import React from 'react';

import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { useI18n } from '~src/lib/i18n';
import { Journalpost } from '~src/types/Journalpost';

import OppsummeringAvJournalpost from './OppsummeringAvJournalpost';
import * as styles from './OppsummeringAvJournalpost.module.less';
import messages from './OppsummeringAvJournalposter-nb';

const OppsummeringAvJournalposter = (props: { journalposter: Journalpost[] }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Liste}
            farge={Oppsummeringsfarge.Lilla}
            tittel={formatMessage('journalposter.tittel')}
        >
            <ul className={styles.oppsummeringAvJournalposterContainer}>
                {props.journalposter.map((j) => (
                    <li key={j.id}>
                        <OppsummeringAvJournalpost journalpost={j} />
                    </li>
                ))}
            </ul>
        </Oppsummeringspanel>
    );
};

export default OppsummeringAvJournalposter;
