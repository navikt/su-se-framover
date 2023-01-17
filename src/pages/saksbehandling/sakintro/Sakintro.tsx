import { Collapse, Expand } from '@navikt/ds-icons';
import { Alert, Button, LinkPanel, Popover } from '@navikt/ds-react';
import { isEmpty } from 'fp-ts/lib/Array';
import React, { PropsWithChildren, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

import { FeatureToggle } from '~src/api/featureToggleApi';
import { ÅpentBrev } from '~src/assets/Illustrations';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import Vedtakstidslinje from '~src/components/vedtakstidslinje/VedtaksTidslinje';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useFeatureToggle } from '~src/lib/featureToggles';
import { useNotificationFromLocation } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import Utbetalinger from '~src/pages/saksbehandling/sakintro/Utbetalinger';
import { KlageStatus } from '~src/types/Klage';
import { Sakstype } from '~src/types/Sak';
import { erKlageAvsluttet, erKlageÅpen } from '~src/utils/klage/klageUtils';
import { erReguleringAvsluttet, erReguleringÅpen } from '~src/utils/ReguleringUtils';
import { erRevurderingAvsluttet, erRevurderingÅpen } from '~src/utils/revurdering/revurderingUtils';
import { getIverksatteInnvilgedeSøknader, erSøknadLukket, erSøknadÅpen } from '~src/utils/søknad/søknadUtils';
import { erSøknadsbehandlingÅpen } from '~src/utils/SøknadsbehandlingUtils';

import AvsluttedeBehandlingerTabell from './avsluttedeBehandlingerTabell/AvsluttedeBehandlingerTabell';
import messages from './sakintro-nb';
import * as styles from './sakintro.module.less';
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
}

const Sakintro = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const { formatMessage } = useI18n({ messages });
    const locationState = useNotificationFromLocation();

    const nyBehandlingTilRoute = (nyBehandling: NyBehandling): string => {
        switch (nyBehandling) {
            case NyBehandling.REVURDER:
                return Routes.revurderValgtSak.createURL({ sakId: props.sak.id });
            case NyBehandling.KLAGE:
                return Routes.klageOpprett.createURL({ sakId: props.sak.id });
        }
    };

    const iverksatteInnvilgedeSøknader = getIverksatteInnvilgedeSøknader(props.sak);
    const harUtbetalinger = !isEmpty(props.sak.utbetalinger);

    const harVedtak = !isEmpty(props.sak.vedtak);

    const avsluttedeRevurderinger = props.sak.revurderinger.filter(erRevurderingAvsluttet);
    const avsluttedeReguleringer = props.sak.reguleringer.filter(erReguleringAvsluttet);
    const avsluttedeKlager = props.sak.klager.filter(erKlageAvsluttet);
    const lukkedeSøknaderMedEllerUtenBehandling = props.sak.søknader.filter(erSøknadLukket).map((lukketSøknad) => {
        const søknadensbehandling = props.sak.behandlinger.find(
            (behandling) => behandling.søknad.id === lukketSøknad.id
        );
        return { søknad: lukketSøknad, søknadsbehandling: søknadensbehandling };
    });

    const alleAvsluttedeBehandlinger = [
        ...avsluttedeKlager,
        ...avsluttedeReguleringer,
        ...avsluttedeRevurderinger,
        ...lukkedeSøknaderMedEllerUtenBehandling,
    ];

    const åpneRevurderinger = props.sak.revurderinger.filter(erRevurderingÅpen);
    const åpneReguleringer = props.sak.reguleringer.filter(erReguleringÅpen);
    const åpneKlager = props.sak.klager.filter(erKlageÅpen);
    const åpneSøknader = props.sak.søknader
        .filter((søknad) => {
            const søknadsbehandling = props.sak.behandlinger.find((b) => b.søknad.id === søknad.id);
            return erSøknadÅpen(søknad) && (!søknadsbehandling || erSøknadsbehandlingÅpen(søknadsbehandling));
        })
        .map((åpenSøknad) => {
            const søknadsbehandling = props.sak.behandlinger.find((b) => b.søknad.id === åpenSøknad.id);
            return { søknad: åpenSøknad, søknadsbehandling: søknadsbehandling };
        });

    const alleÅpneBehandlinger = [...åpneRevurderinger, ...åpneReguleringer, ...åpneSøknader, ...åpneKlager];

    const utenlandsoppholdToggle = useFeatureToggle(FeatureToggle.Utenlandsopphold);
    const FritekstBrevPåSakToggle = useFeatureToggle(FeatureToggle.FritekstBrevPåSak);

    return (
        <div className={styles.sakintroContainer}>
            <SuksessStatuser locationState={locationState} />
            <div className={styles.pageHeader}>
                <div className={styles.headerKnapper}>
                    {harVedtak && props.sak.sakstype !== Sakstype.Alder && (
                        <NyBehandlingVelger>
                            {iverksatteInnvilgedeSøknader.length > 0 && (
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
                        </NyBehandlingVelger>
                    )}
                    {harUtbetalinger && (
                        <LinkAsButton
                            variant="secondary"
                            href={Routes.kontrollsamtale.createURL({ sakId: props.sak.id })}
                        >
                            {formatMessage('link.kontrollsamtale')}
                        </LinkAsButton>
                    )}
                    {utenlandsoppholdToggle && (
                        <LinkAsButton
                            variant="secondary"
                            href={Routes.utenlandsopphold.createURL({ sakId: props.sak.id })}
                        >
                            {formatMessage('link.utenlandsopphold')}
                        </LinkAsButton>
                    )}
                    {FritekstBrevPåSakToggle && (
                        <LinkAsButton variant="secondary" href={Routes.brevPage.createURL({ sakId: props.sak.id })}>
                            {formatMessage('link.brev')}
                        </LinkAsButton>
                    )}
                </div>
            </div>

            <Vedtakstidslinje vedtakerPåTidslinje={props.sak.vedtakPåTidslinje} />

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
                            as={({ href, ...props }) => <Link to={href ?? ''} {...props} />}
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

const NyBehandlingVelger: React.FC<PropsWithChildren> = (props) => {
    const { formatMessage } = useI18n({ messages });
    const [anchorEl, setAnchorEl] = useState<Nullable<HTMLElement>>(null);

    return (
        <div className={styles.nyBehandlingVelgerContainer}>
            <Button
                variant="secondary"
                onClick={(e) => {
                    return setAnchorEl(anchorEl ? null : e.currentTarget);
                }}
            >
                {formatMessage('popover.default')}
                {anchorEl === null ? <Expand className={styles.chevron} /> : <Collapse className={styles.chevron} />}
            </Button>
            <Popover
                arrow={false}
                placement="bottom"
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                open={anchorEl !== null}
            >
                <div className={styles.popoverOptionsContainer}>{props.children}</div>
            </Popover>
        </div>
    );
};

export default Sakintro;
