import { Back } from '@navikt/ds-icons';
import { Button, Loader } from '@navikt/ds-react';
import * as React from 'react';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';

import messages from '../avsluttBehandling-nb';

import * as styles from './avsluttBehandlingBunnknapper.module.less';

const AvsluttBehandlingBunnknapper = (props: { submitButtonText: string; isSubmitPending: boolean; sakId: string }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.container}>
            <LinkAsButton href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })} variant="secondary">
                <Back />
                {formatMessage('link.tilbake')}
            </LinkAsButton>
            <Button variant="danger" type="submit">
                {props.submitButtonText}
                {props.isSubmitPending && <Loader />}
            </Button>
        </div>
    );
};

export default AvsluttBehandlingBunnknapper;
