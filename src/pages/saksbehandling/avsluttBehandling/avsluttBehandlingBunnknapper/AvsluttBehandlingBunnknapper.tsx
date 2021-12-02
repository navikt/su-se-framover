import * as RemoteData from '@devexperts/remote-data-ts';
import { Back } from '@navikt/ds-icons';
import { Button, Loader } from '@navikt/ds-react';
import * as React from 'react';

import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';

import messages from '../avsluttBehandling-nb';

import styles from './avsluttBehandlingBunnknapper.module.less';

const AvsluttBehandlingBunnknapper = (props: {
    submitButtonText: string;
    submitStatus: RemoteData.RemoteData<unknown, unknown>;
    sakId: string;
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.container}>
            <LinkAsButton href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })} variant="secondary">
                <Back />
                {formatMessage('link.tilbake')}
            </LinkAsButton>
            <Button variant="danger" type="submit">
                {props.submitButtonText}
                {RemoteData.isPending(props.submitStatus) && <Loader />}
            </Button>
        </div>
    );
};

export default AvsluttBehandlingBunnknapper;
