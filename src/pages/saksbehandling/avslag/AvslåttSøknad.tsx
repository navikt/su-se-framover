import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Loader, Textarea } from '@navikt/ds-react';
import React from 'react';

import { ApiResult } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import { Sak } from '~types/Sak';

import nb from './avslåttSøknad-nb';
import styles from './avslåttSøknad.module.less';

interface Props {
    søknadsbehandlingAvsluttetStatus: ApiResult<Sak, string>;
    fritekstValue: Nullable<string>;
    fritekstError?: string;
    onFritekstChange: (value: string) => void;
}

const AvslåttSøknad = (props: Props) => {
    const { formatMessage } = useI18n({ messages: nb });

    return (
        <div className={styles.formContainer}>
            <div className={styles.avvistContainer}>
                <div className={styles.textAreaContainer}>
                    <Textarea
                        label={formatMessage('display.avvist.fritekst')}
                        value={props.fritekstValue ?? ''}
                        error={props.fritekstError}
                        onChange={(e) => props.onFritekstChange(e.target.value)}
                    />
                </div>
                <Button variant="danger" className={styles.avvisButton} type="submit">
                    {formatMessage('knapp.avvis')}
                    {RemoteData.isPending(props.søknadsbehandlingAvsluttetStatus) && <Loader />}
                </Button>
            </div>
        </div>
    );
};

export default AvslåttSøknad;
