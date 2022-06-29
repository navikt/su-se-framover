import { Heading, Loader } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';

import styles from './henterInnhold.module.less';

const messages = {
    'spinner.henterInnhold': 'Henter innhold...',
};

const HenterInnhold = (props: { text?: string }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.hentInnholdContainer}>
            <Loader size="3xlarge" title={props.text ?? formatMessage('spinner.henterInnhold')} />
            <Heading level="3" size="large">
                {props.text ?? formatMessage('spinner.henterInnhold')}
            </Heading>
        </div>
    );
};

export default HenterInnhold;
