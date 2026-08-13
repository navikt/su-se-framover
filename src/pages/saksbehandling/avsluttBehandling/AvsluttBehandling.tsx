import { Alert, Heading, Panel } from '@navikt/ds-react';
import { useOutletContext } from 'react-router-dom';
import NotatPanel from '~src/components/notat/NotatPanel.tsx';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import AvsluttRegulering from '~src/pages/saksbehandling/avsluttBehandling/avsluttRegulering/AvsluttRegulering.tsx';
import { ReferanseType } from '~src/types/Notat.ts';
import { erRevurderingAvsluttet, erRevurderingIverksatt } from '~src/utils/revurdering/revurderingUtils';
import { erIverksatt } from '~src/utils/SøknadsbehandlingUtils';
import { erSøknadLukket } from '~src/utils/søknad/søknadUtils';
import styles from './avsluttBehandling.module.less';
import messages from './avsluttBehandling-nb';
import AvsluttKlage from './avsluttKlage/AvsluttKlage';
import AvsluttRevurdering from './avsluttRevurdering/AvsluttRevurdering';
import AvsluttTilbakekreving from './avsluttTilbakekreving/AvsluttTilbakekreving';
import LukkSøknadOgAvsluttBehandling from './lukkSøknad/LukkSøknad';

type NotatProps = {
    referanseId: string;
    referanseType: ReferanseType;
    kanRedigere: boolean;
};

const AvsluttBehandling = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const { formatMessage } = useI18n({ messages });
    const { id, type } = Routes.useRouteParams<typeof Routes.avsluttBehandling>();

    const søknad = props.sak.søknader.find((s) => s.id === urlParams.id);
    const søknadsbehandling = props.sak.behandlinger.find((s) => s.id === urlParams.id);
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.id);
    const klage = props.sak.klager.find((k) => k.id === urlParams.id);
    const tilbakekreving = props.sak.tilbakekrevinger.find((t) => t.id === urlParams.id);
    const regulering = props.sak.reguleringer.find((r) => r.id === urlParams.id);

    if (!søknad && !søknadsbehandling && !revurdering && !klage && !tilbakekreving && !regulering) {
    const søknad =
        type === Routes.AvsluttBehandlingType.SØKNAD ? props.sak.søknader.find((s) => s.id === id) : undefined;
    const søknadsbehandling =
        type === Routes.AvsluttBehandlingType.SØKNADSBEHANDLING
            ? props.sak.behandlinger.find((s) => s.id === id)
            : undefined;
    const revurdering =
        type === Routes.AvsluttBehandlingType.REVURDERING
            ? props.sak.revurderinger.find((r) => r.id === id)
            : undefined;
    const klage = type === Routes.AvsluttBehandlingType.KLAGE ? props.sak.klager.find((k) => k.id === id) : undefined;
    const tilbakekreving =
        type === Routes.AvsluttBehandlingType.TILBAKEKREVING
            ? props.sak.tilbakekrevinger.find((t) => t.id === id)
            : undefined;

    const funnet = søknad ?? søknadsbehandling ?? revurdering ?? klage ?? tilbakekreving;
    if (!funnet) {
        return (
            <div>
                <Alert variant="error">
                    {formatMessage('feil.fantIkkeBehandling')} {id}
                </Alert>
            </div>
        );
    }

    let notatProps: NotatProps | null = null;
    if (søknad) {
        notatProps = {
            referanseId: søknad.id,
            referanseType: ReferanseType.SØKNAD,
            kanRedigere: !erSøknadLukket(søknad),
        };
    } else if (søknadsbehandling) {
        notatProps = {
            referanseId: søknadsbehandling.id,
            referanseType: ReferanseType.SØKNADSBEHANDLING,
            kanRedigere: !erIverksatt(søknadsbehandling) && !søknadsbehandling.erLukket,
        };
    } else if (revurdering) {
        notatProps = {
            referanseId: revurdering.id,
            referanseType: ReferanseType.REVURDERING,
            kanRedigere: !erRevurderingIverksatt(revurdering) && !erRevurderingAvsluttet(revurdering),
        };
    }

    return (
        <div className={styles.container}>
            <Heading level="1" size="large" className={styles.tittel}>
                {formatMessage('heading')}
            </Heading>
            {notatProps && (
                <NotatPanel
                    sakId={props.sak.id}
                    referanseId={notatProps.referanseId}
                    referanseType={notatProps.referanseType}
                    underAttestering={false}
                    kanRedigere={notatProps.kanRedigere}
                />
            )}
            <Panel className={styles.contentContainer}>
                <Heading level="2" size="medium" spacing>
                    {formatMessage('display.saksnummer')} {props.sak.saksnummer}
                </Heading>

                <div className={styles.mainContent}>
                    {(søknad || søknadsbehandling) && (
                        <LukkSøknadOgAvsluttBehandling søknad={(søknad || søknadsbehandling?.søknad)!} />
                    )}
                    {revurdering && <AvsluttRevurdering sakId={props.sak.id} revurdering={revurdering} />}
                    {klage && <AvsluttKlage sakId={props.sak.id} klage={klage} />}
                    {tilbakekreving && (
                        <AvsluttTilbakekreving saksversjon={props.sak.versjon} behandling={tilbakekreving} />
                    )}
                    {regulering && <AvsluttRegulering sakId={props.sak.id} regulering={regulering} />}
                </div>
            </Panel>
        </div>
    );
};

export default AvsluttBehandling;
