import { ChevronUpIcon, ChevronDownIcon } from '@navikt/aksel-icons';
import { Alert, Button, LinkPanel, Popover } from '@navikt/ds-react';
import { partition, isEmpty } from 'fp-ts/Array';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { ÅpentBrev } from '~src/assets/Illustrations';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import Vedtakstidslinje from '~src/components/vedtakstidslinje/VedtaksTidslinje';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useNotificationFromLocation } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import Utbetalinger from '~src/pages/saksbehandling/sakintro/Utbetalinger';
import { KlageStatus } from '~src/types/Klage';
import { erKlageAvsluttet, erKlageÅpen } from '~src/utils/klage/klageUtils';
import {
    erTilbakekrevingAvbrutt,
    erTilbakekrevingsbehandlingÅpen,
} from '~src/utils/ManuellTilbakekrevingsbehandlingUtils';
import { erReguleringAvsluttet, erReguleringÅpen } from '~src/utils/ReguleringUtils';
import { erRevurderingAvsluttet, erRevurderingÅpen } from '~src/utils/revurdering/revurderingUtils';
import { getIverksatteInnvilgedeSøknader, erSøknadLukket, erSøknadÅpen } from '~src/utils/søknad/søknadUtils';
import { erSøknadsbehandlingÅpen } from '~src/utils/SøknadsbehandlingUtils';

import AvsluttedeBehandlingerTabell from './avsluttedeBehandlingerTabell/AvsluttedeBehandlingerTabell';
import messages from './sakintro-nb';
import styles from './sakintro.module.less';
import Vedtakstabell from './Vedtakstabell/Vedtakstabell';
import ÅpneBehandlingerTabell from './åpneBehandlingerTabell/ÅpneBehandlingerTabell';

const SuksessStatuser = (props: { locationState: Nullable<Routes.SuccessNotificationState> }) => {
    return (
        <div className={styles.suksessStatuserContainer}>
            {props.locationState?.notification && <Alert variant="success">{props.locationState.notification}</Alert>}
        </div>
    );
};

enum NyBehandling {
    REVURDER = 'REVURDER',
    KLAGE = 'KLAGE',
    TILBAKEKREVING = 'TILBAKEKREVING',
}

const Sakintro = () => {
    const props = useOutletContext<SaksoversiktContext>();

    const { formatMessage } = useI18n({ messages });
    const locationState = useNotificationFromLocation();

    const iverksatteInnvilgedeSøknader = getIverksatteInnvilgedeSøknader(props.sak);
    const harUtbetalinger = !isEmpty(props.sak.utbetalinger);

    const harVedtak = !isEmpty(props.sak.vedtak);

    const avsluttedeRevurderinger = props.sak.revurderinger.filter(erRevurderingAvsluttet);
    const avsluttedeReguleringer = props.sak.reguleringer.filter(erReguleringAvsluttet);
    const avsluttedeKlager = props.sak.klager.filter(erKlageAvsluttet);
    const lukkedeSøknaderMedEllerUtenBehandling = props.sak.søknader.filter(erSøknadLukket).map((lukketSøknad) => {
        const søknadensbehandling = props.sak.behandlinger.find(
            (behandling) => behandling.søknad.id === lukketSøknad.id,
        );
        return { søknad: lukketSøknad, søknadsbehandling: søknadensbehandling };
    });
    const avsluttedeTilbakekrevinger = props.sak.tilbakekrevinger.filter(erTilbakekrevingAvbrutt);

    const alleAvsluttedeBehandlinger = [
        ...avsluttedeKlager,
        ...avsluttedeReguleringer,
        ...avsluttedeRevurderinger,
        ...lukkedeSøknaderMedEllerUtenBehandling,
        ...avsluttedeTilbakekrevinger,
    ];

    const åpneRevurderinger = props.sak.revurderinger.filter(erRevurderingÅpen);
    const åpneReguleringer = props.sak.reguleringer.filter(erReguleringÅpen);
    const åpneKlager = props.sak.klager.filter(erKlageÅpen);

    const åpneSøknader = props.sak.søknader
        .filter((søknad) => {
            const søknadsbehandlinger = props.sak.behandlinger.filter((b) => b.søknad.id === søknad.id && !b.erLukket);
            const parts = partition(erSøknadsbehandlingÅpen)(søknadsbehandlinger);

            const harÅpenSøknad = erSøknadÅpen(søknad);
            const harÅpenSøknadsbehandling = parts.right.length > 0;
            const harIkkeÅpenSøknadsbehandling = parts.right.length === 0;
            //ferdig i denne betydningen alt som ikke er åpen
            const harFerdigBehandling = parts.left.length > 0;
            const harIkkeFerdigBehandling = parts.left.length === 0;
            const harIkkeSøknadsbehandling = harIkkeFerdigBehandling && harIkkeÅpenSøknadsbehandling;

            const harSøknadMenIngenBehandling = harÅpenSøknad && harIkkeSøknadsbehandling;
            const harSøknadMedEnBehandling = harÅpenSøknad && (harÅpenSøknadsbehandling || harFerdigBehandling);
            const harSøknadMedFlereBehandlinger = harÅpenSøknad && harÅpenSøknadsbehandling && harFerdigBehandling;

            if (harSøknadMenIngenBehandling) {
                return true;
            } else if (harSøknadMedEnBehandling) {
                if (harÅpenSøknadsbehandling) {
                    return true;
                } else if (harFerdigBehandling) {
                    return false;
                }
            } else if (harSøknadMedFlereBehandlinger) {
                return true;
            }

            return false;
        })
        .flatMap((åpenSøknad) => {
            const søknadsbehandlinger = props.sak.behandlinger.filter((b) => b.søknad.id === åpenSøknad.id);

            const åpneSøknadsbehandlinger = søknadsbehandlinger.filter(erSøknadsbehandlingÅpen);

            return åpneSøknadsbehandlinger.length > 0
                ? åpneSøknadsbehandlinger.map((b) => ({ søknad: åpenSøknad, søknadsbehandling: b }))
                : { søknad: åpenSøknad };
        });

    const åpneTilbakekrevingsbehandlinger = props.sak.tilbakekrevinger.filter(erTilbakekrevingsbehandlingÅpen);

    const alleÅpneBehandlinger = [
        ...åpneRevurderinger,
        ...åpneReguleringer,
        ...åpneSøknader,
        ...åpneKlager,
        ...åpneTilbakekrevingsbehandlinger,
    ];

    return (
        <div className={styles.sakintroContainer}>
            <SuksessStatuser locationState={locationState} />
            <div className={styles.pageHeader}>
                <div className={styles.headerKnapper}>
                    {harVedtak && (
                        <NyBehandlingVelger
                            sakId={props.sak.id}
                            kanRevurdere={iverksatteInnvilgedeSøknader.length > 0}
                        />
                    )}
                    {harUtbetalinger && (
                        <LinkAsButton
                            variant="secondary"
                            href={Routes.kontrollsamtale.createURL({ sakId: props.sak.id })}
                        >
                            {formatMessage('link.kontrollsamtale')}
                        </LinkAsButton>
                    )}

                    <LinkAsButton variant="secondary" href={Routes.utenlandsopphold.createURL({ sakId: props.sak.id })}>
                        {formatMessage('link.utenlandsopphold')}
                    </LinkAsButton>

                    <LinkAsButton variant="secondary" href={Routes.brevPage.createURL({ sakId: props.sak.id })}>
                        {formatMessage('link.brev')}
                    </LinkAsButton>
                </div>
            </div>
            <div className={styles.vedtaksTidslinjeContainer}>
                <Vedtakstidslinje vedtakerPåTidslinje={props.sak.vedtakPåTidslinje} />
            </div>
            {props.sak.søknader.length > 0 ? (
                <div className={styles.contentContainer}>
                    <Utbetalinger
                        sakId={props.sak.id}
                        utbetalingsperioder={props.sak.utbetalinger}
                        kanStansesEllerGjenopptas={props.sak.utbetalingerKanStansesEllerGjenopptas}
                    />
                    <div className={styles.behandlingstabellContainer}>
                        {alleÅpneBehandlinger.length > 0 && (
                            <ÅpneBehandlingerTabell sakId={props.sak.id} tabellBehandlinger={alleÅpneBehandlinger} />
                        )}

                        {props.sak.vedtak.length > 0 && (
                            <Vedtakstabell
                                revurderinger={props.sak.revurderinger}
                                behandlinger={props.sak.behandlinger}
                                sakId={props.sak.id}
                                vedtakOgOversendteKlager={[
                                    ...props.sak.vedtak,
                                    ...props.sak.klager.filter((it) => it.status === KlageStatus.OVERSENDT),
                                ]}
                            />
                        )}

                        {alleAvsluttedeBehandlinger.length > 0 && (
                            <AvsluttedeBehandlingerTabell tabellBehandlinger={alleAvsluttedeBehandlinger} />
                        )}
                    </div>

                    <div>
                        <LinkPanel
                            href={Routes.alleDokumenterForSak.createURL({ sakId: props.sak.id })}
                            className={styles.dokumenterLinkpanel}
                        >
                            <div className={styles.dokumenterLink}>
                                <span className={styles.dokumenterLinkIcon}>
                                    <ÅpentBrev />
                                </span>
                                <LinkPanel.Title>{formatMessage('link.dokumenter')}</LinkPanel.Title>
                            </div>
                        </LinkPanel>
                    </div>
                </div>
            ) : (
                'Ingen søknader'
            )}
        </div>
    );
};

const NyBehandlingVelger = (props: { sakId: string; kanRevurdere: boolean }) => {
    const { formatMessage } = useI18n({ messages });
    const [anchorEl, setAnchorEl] = useState<Nullable<HTMLElement>>(null);

    const nyBehandlingTilRoute = (nyBehandling: NyBehandling): string => {
        switch (nyBehandling) {
            case NyBehandling.REVURDER:
                return Routes.revurderValgtSak.createURL({ sakId: props.sakId });
            case NyBehandling.KLAGE:
                return Routes.klageOpprett.createURL({ sakId: props.sakId });
            case NyBehandling.TILBAKEKREVING:
                return Routes.tilbakekrevValgtSak.createURL({ sakId: props.sakId });
        }
    };

    return (
        <div className={styles.nyBehandlingVelgerContainer}>
            <Button
                variant="secondary"
                onClick={(e) => {
                    return setAnchorEl(anchorEl ? null : e.currentTarget);
                }}
            >
                {formatMessage('popover.default')}
                {anchorEl === null ? (
                    <ChevronDownIcon className={styles.chevron} />
                ) : (
                    <ChevronUpIcon className={styles.chevron} />
                )}
            </Button>
            <Popover
                arrow={false}
                placement="bottom"
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                open={anchorEl !== null}
            >
                <div className={styles.popoverOptionsContainer}>
                    {props.kanRevurdere && (
                        <LinkAsButton
                            className={styles.popoverOption}
                            variant="tertiary"
                            href={nyBehandlingTilRoute(NyBehandling.REVURDER)}
                        >
                            {formatMessage('popover.option.revurder')}
                        </LinkAsButton>
                    )}
                    <LinkAsButton
                        className={styles.popoverOption}
                        variant="tertiary"
                        href={nyBehandlingTilRoute(NyBehandling.KLAGE)}
                    >
                        {formatMessage('popover.option.klage')}
                    </LinkAsButton>
                    <LinkAsButton
                        className={styles.popoverOption}
                        variant="tertiary"
                        href={nyBehandlingTilRoute(NyBehandling.TILBAKEKREVING)}
                    >
                        {formatMessage('popover.option.tilbakekreving')}
                    </LinkAsButton>
                </div>
            </Popover>
        </div>
    );
};

export default Sakintro;
