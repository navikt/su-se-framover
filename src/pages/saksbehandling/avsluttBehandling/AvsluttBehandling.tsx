import { Alert, Heading, Panel } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';

import messages from './avsluttBehandling-nb';
import styles from './avsluttBehandling.module.less';
import AvsluttKlage from './avsluttKlage/AvsluttKlage';
import AvsluttRevurdering from './avsluttRevurdering/AvsluttRevurdering';
import LukkSøknadOgAvsluttBehandling from './lukkSøknad/LukkSøknad';

const AvsluttBehandling = (props: { sak: Sak }) => {
    const { formatMessage } = useI18n({ messages });
    const urlParams = Routes.useRouteParams<typeof Routes.avsluttBehandling>();

    const søknad = props.sak.søknader.find((s) => s.id === urlParams.id);
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.id);
    const klage = props.sak.klager.find((k) => k.id === urlParams.id);

    if (!søknad && !revurdering && !klage) {
        return (
            <div>
                <Alert variant="error">
                    {formatMessage('feil.fantIkkeBehandling')} {urlParams.id}
                </Alert>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Heading level="1" size="large" className={styles.tittel}>
                {formatMessage('heading')}
            </Heading>
            <Panel className={styles.contentContainer}>
                <Heading level="2" size="medium" spacing>
                    {formatMessage('display.saksnummer')} {props.sak.saksnummer}
                </Heading>

                <div className={styles.mainContent}>
                    {søknad && <LukkSøknadOgAvsluttBehandling sakId={props.sak.id} søknad={søknad} />}
                    {revurdering && <AvsluttRevurdering sakId={props.sak.id} revurdering={revurdering} />}
                    {klage && <AvsluttKlage sakId={props.sak.id} klage={klage} />}
                </div>
            </Panel>
        </div>
    );
};

export default AvsluttBehandling;
