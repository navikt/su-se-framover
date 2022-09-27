import * as RemoteData from '@devexperts/remote-data-ts';
import { Collapse, Expand } from '@navikt/ds-icons';
import { Alert, Button, LinkPanel, Loader, Popover } from '@navikt/ds-react';
import { isEmpty } from 'fp-ts/lib/Array';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';
import { Link, useOutletContext } from 'react-router-dom';

import { FeatureToggle } from '~src/api/featureToggleApi';
import { ÅpentBrev } from '~src/assets/Illustrations';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import Vedtakstidslinje from '~src/components/vedtakstidslinje/VedtaksTidslinje';
import { useFeatureToggle } from '~src/lib/featureToggles';
import { ApiResult, useNotificationFromLocation } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import Utbetalinger from '~src/pages/saksbehandling/sakintro/Utbetalinger';
import { Sakstype } from '~src/types/Sak';
import { Søknad } from '~src/types/Søknad';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { erIverksatt } from '~src/utils/behandling/SøknadsbehandlingUtils';
import { splittAvsluttedeOgÅpneRevurderinger } from '~src/utils/revurdering/revurderingUtils';
import { AttesteringContext } from '~src/utils/router/routerUtils';
import { getIverksatteInnvilgedeSøknader, getIverksatteAvslåtteSøknader } from '~src/utils/søknad/søknadUtils';

import KlageLister from './KlageLister';
import ReguleringLister from './ReguleringLister';
import { AvsluttedeRevurderinger, ÅpneRevurderinger } from './RevurderingsLister';
import messages from './sakintro-nb';
import * as styles from './sakintro.module.less';
import { AvslåtteSøknader, IverksattInnvilgedeSøknader, LukkedeSøknader, ÅpneSøknader } from './SøknadsLister';

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
    const props = useOutletContext<AttesteringContext>();
    const { intl } = useI18n({ messages });
    const locationState = useNotificationFromLocation();

    const nyBehandlingTilRoute = (nyBehandling: NyBehandling): string => {
        switch (nyBehandling) {
            case NyBehandling.REVURDER:
                return Routes.revurderValgtSak.createURL({ sakId: props.sak.id });
            case NyBehandling.KLAGE:
                return Routes.klageOpprett.createURL({ sakId: props.sak.id });
        }
    };

    const åpneSøknader = props.sak.søknader
        .filter((søknad) => {
            const behandling = props.sak.behandlinger.find((b) => b.søknad.id === søknad.id);
            return søknad.lukket === null && (!behandling || !erIverksatt(behandling));
        })
        .sort((a: Søknad, b: Søknad) => {
            return Date.parse(a.opprettet) - Date.parse(b.opprettet);
        });

    const iverksatteInnvilgedeSøknader = getIverksatteInnvilgedeSøknader(props.sak);

    const lukkedeSøknader = props.sak.søknader.filter((søknad) => {
        return søknad.lukket !== null;
    });

    const avslåtteSøknader = getIverksatteAvslåtteSøknader(props.sak);

    const { avsluttedeRevurderinger, åpneRevurderinger } = splittAvsluttedeOgÅpneRevurderinger(props.sak.revurderinger);

    const harUtbetalinger = !isEmpty(props.sak.utbetalinger);

    const harVedtak = !isEmpty(props.sak.vedtak);
    const klageToggle = useFeatureToggle(FeatureToggle.Klage);

    return (
        <div className={styles.sakintroContainer}>
            <SuksessStatuser locationState={locationState} />
            <div className={styles.pageHeader}>
                <div className={styles.headerKnapper}>
                    {harVedtak && props.sak.sakstype !== Sakstype.Alder && (
                        <NyBehandlingVelger intl={intl}>
                            {iverksatteInnvilgedeSøknader.length > 0 && (
                                <LinkAsButton
                                    className={styles.popoverOption}
                                    variant="tertiary"
                                    href={nyBehandlingTilRoute(NyBehandling.REVURDER)}
                                >
                                    {intl.formatMessage({ id: 'popover.option.revurder' })}
                                </LinkAsButton>
                            )}
                            {klageToggle && (
                                <LinkAsButton
                                    className={styles.popoverOption}
                                    variant="tertiary"
                                    href={nyBehandlingTilRoute(NyBehandling.KLAGE)}
                                >
                                    {intl.formatMessage({ id: 'popover.option.klage' })}
                                </LinkAsButton>
                            )}
                        </NyBehandlingVelger>
                    )}
                    {harUtbetalinger && (
                        <LinkAsButton
                            variant="secondary"
                            href={Routes.kontrollsamtale.createURL({ sakId: props.sak.id })}
                        >
                            {intl.formatMessage({ id: 'link.kontrollsamtale' })}
                        </LinkAsButton>
                    )}
                </div>
            </div>

            <Vedtakstidslinje vedtakerPåTidslinje={props.sak.vedtakPåTidslinje} />

            {props.sak.søknader.length > 0 ? (
                <div className={styles.søknadOgUtbetalingContainer}>
                    <ÅpneSøknader
                        sakId={props.sak.id}
                        åpneSøknader={åpneSøknader}
                        behandlinger={props.sak.behandlinger}
                        intl={intl}
                    />
                    <Utbetalinger
                        sakId={props.sak.id}
                        utbetalingsperioder={props.sak.utbetalinger}
                        kanStansesEllerGjenopptas={props.sak.utbetalingerKanStansesEllerGjenopptas}
                    />
                    {harUtbetalinger && (
                        <ÅpneRevurderinger sak={props.sak} åpneRevurderinger={åpneRevurderinger} intl={intl} />
                    )}
                    <IverksattInnvilgedeSøknader
                        sak={props.sak}
                        iverksatteInnvilgedeSøknader={iverksatteInnvilgedeSøknader}
                        intl={intl}
                    />
                    <AvslåtteSøknader sak={props.sak} avslåtteSøknader={avslåtteSøknader} intl={intl} />
                    <LukkedeSøknader lukkedeSøknader={lukkedeSøknader} intl={intl} />
                    <AvsluttedeRevurderinger avsluttedeRevurderinger={avsluttedeRevurderinger} intl={intl} />
                    {klageToggle && (
                        <KlageLister sakId={props.sak.id} klager={props.sak.klager} vedtak={props.sak.vedtak} />
                    )}
                    <ReguleringLister
                        sakId={props.sak.id}
                        reguleringer={props.sak.reguleringer}
                        vedtak={props.sak.vedtak}
                    />
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
                                <LinkPanel.Title>{intl.formatMessage({ id: 'link.dokumenter' })}</LinkPanel.Title>
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

const NyBehandlingVelger: React.FC<{ intl: IntlShape }> = (props) => {
    const [anchorEl, setAnchorEl] = useState<Nullable<HTMLElement>>(null);

    return (
        <div className={styles.nyBehandlingVelgerContainer}>
            <Button
                variant="secondary"
                onClick={(e) => {
                    return setAnchorEl(anchorEl ? null : e.currentTarget);
                }}
            >
                {props.intl.formatMessage({ id: 'popover.default' })}
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

export const AvsluttOgStartFortsettButtons = (props: {
    sakId: string;
    behandlingsId: string;
    primaryButtonTekst: string;
    usePrimaryAsLink?: {
        url: string;
    };
    usePrimaryAsButton?: {
        onClick: () => Promise<void>;
        status: ApiResult<Søknadsbehandling>;
    };
    hideSecondaryButton?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.avsluttOgStartFortsettKnapperContainer}>
            {!props.hideSecondaryButton && (
                <LinkAsButton
                    variant="secondary"
                    size="small"
                    href={Routes.avsluttBehandling.createURL({
                        sakId: props.sakId,
                        id: props.behandlingsId,
                    })}
                >
                    {formatMessage('behandling.avsluttBehandling')}
                </LinkAsButton>
            )}
            {props.usePrimaryAsButton ? (
                <Button size="small" onClick={props.usePrimaryAsButton.onClick}>
                    {props.primaryButtonTekst}
                    {RemoteData.isPending(props.usePrimaryAsButton.status) && <Loader />}
                </Button>
            ) : (
                <LinkAsButton href={props.usePrimaryAsLink?.url ?? ''} variant="primary" size="small">
                    {props.primaryButtonTekst}
                </LinkAsButton>
            )}
        </div>
    );
};

export default Sakintro;
