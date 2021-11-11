import { Alert, Heading, Link, Panel } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';

import LukkSøknadOgAvsluttBehandling from '../lukkSøknad/LukkSøknad';

import messages from './avsluttBehandling-nb';
import styles from './avsluttBehandling.module.less';
import AvsluttRevurdering from './avsluttRevurdering/AvsluttRevurdering';

const AvsluttBehandling = (props: { sak: Sak }) => {
    const { formatMessage } = useI18n({ messages });
    const urlParams = Routes.useRouteParams<typeof Routes.avsluttBehandling>();

    const søknad = props.sak.søknader.find((s) => s.id === urlParams.id);
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.id);

    if (!søknad && !revurdering) {
        return (
            <div>
                <Alert variant="error">
                    {formatMessage('feil.fantIkkeBehandling')} {urlParams.id}
                </Alert>
                <Link href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}>
                    {formatMessage('link.tilbake')}
                </Link>
            </div>
        );
    }

    return (
        <Panel className={styles.pageContainer}>
            <Heading level="2" size="medium">
                {formatMessage('display.saksnummer')} {props.sak.saksnummer}
            </Heading>
            <Heading level="2" size="medium" spacing>
                {formatMessage(søknad ? 'behandling.søknadsId' : 'behandling.revurderingsId')} {urlParams.id}
            </Heading>

            <div className={styles.mainContent}>
                {søknad && <LukkSøknadOgAvsluttBehandling sakId={props.sak.id} søknad={søknad} />}
                {revurdering && <AvsluttRevurdering sakId={props.sak.id} revurdering={revurdering} />}
            </div>
            <Link href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}>
                {formatMessage('link.tilbake')}
            </Link>
        </Panel>
    );
};

export default AvsluttBehandling;
