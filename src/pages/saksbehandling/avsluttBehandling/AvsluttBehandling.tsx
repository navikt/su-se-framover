import { Alert, Heading, Panel } from '@navikt/ds-react';
import { useOutletContext } from 'react-router-dom';

import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import styles from './avsluttBehandling.module.less';
import messages from './avsluttBehandling-nb';
import AvsluttKlage from './avsluttKlage/AvsluttKlage';
import AvsluttRevurdering from './avsluttRevurdering/AvsluttRevurdering';
import AvsluttTilbakekreving from './avsluttTilbakekreving/AvsluttTilbakekreving';
import LukkSøknadOgAvsluttBehandlingNy from './lukkSøknad/LukkSøknadNy';

const AvsluttBehandling = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const { formatMessage } = useI18n({ messages });
    const urlParams = Routes.useRouteParams<typeof Routes.avsluttBehandling>();

    const søknad = props.sak.søknader.find((s) => s.id === urlParams.id);
    const søknadsbehandling = props.sak.behandlinger.find((s) => s.id === urlParams.id);
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.id);
    const klage = props.sak.klager.find((k) => k.id === urlParams.id);
    const tilbakekreving = props.sak.tilbakekrevinger.find((t) => t.id === urlParams.id);

    if (!søknad && !søknadsbehandling && !revurdering && !klage && !tilbakekreving) {
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
                    {(søknad || søknadsbehandling) && (
                        <LukkSøknadOgAvsluttBehandlingNy søknad={(søknad || søknadsbehandling?.søknad)!} />
                    )}
                    {revurdering && <AvsluttRevurdering sakId={props.sak.id} revurdering={revurdering} />}
                    {klage && <AvsluttKlage sakId={props.sak.id} klage={klage} />}
                    {tilbakekreving && (
                        <AvsluttTilbakekreving saksversjon={props.sak.versjon} behandling={tilbakekreving} />
                    )}
                </div>
            </Panel>
        </div>
    );
};

export default AvsluttBehandling;
