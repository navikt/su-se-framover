import React from 'react';

import { Journalpost } from '~src/types/Journalpost';

import OppsummeringAvJournalpost from './OppsummeringAvJournalpost';
import styles from './OppsummeringAvJournalpost.module.less';

const OppsummeringAvJournalposter = (props: { journalposter: Journalpost[] }) => {
    return (
        <ul className={styles.oppsummeringAvJournalposterContainer}>
            {props.journalposter.map((j) => (
                <li key={j.id}>
                    <OppsummeringAvJournalpost journalpost={j} />
                </li>
            ))}
        </ul>
    );
};

export default OppsummeringAvJournalposter;
