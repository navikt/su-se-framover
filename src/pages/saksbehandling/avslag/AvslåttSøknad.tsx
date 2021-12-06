import { Textarea } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';

import nb from './avslåttSøknad-nb';
import styles from './avslåttSøknad.module.less';

interface Props {
    fritekstValue: Nullable<string>;
    fritekstError?: string;
    onFritekstChange: (value: string) => void;
}

const AvslåttSøknad = (props: Props) => {
    const { formatMessage } = useI18n({ messages: nb });

    return (
        <div className={styles.container}>
            <Textarea
                className={styles.textArea}
                label={formatMessage('display.avvist.fritekst')}
                value={props.fritekstValue ?? ''}
                error={props.fritekstError}
                onChange={(e) => props.onFritekstChange(e.target.value)}
            />
        </div>
    );
};

export default AvslåttSøknad;
