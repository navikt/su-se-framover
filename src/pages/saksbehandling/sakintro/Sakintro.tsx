import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, LinkPanel, Loader } from '@navikt/ds-react';
import { isEmpty } from 'fp-ts/lib/Array';
import Chevron from 'nav-frontend-chevron';
import Popover, { PopoverOrientering } from 'nav-frontend-popover';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';

import { FeatureToggle } from '~api/featureToggleApi';
import { ÅpentBrev } from '~assets/Illustrations';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import { useFeatureToggle } from '~lib/featureToggles';
import { ApiResult, useNotificationFromLocation } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import Utbetalinger from '~pages/saksbehandling/sakintro/Utbetalinger';
import { Behandling } from '~types/Behandling';
import { Klage } from '~types/Klage';
import { Sak } from '~types/Sak';
import { Søknad } from '~types/Søknad';
import { erIverksatt } from '~utils/behandling/behandlingUtils';
import { getÅpenKlage, hentSisteVurderteSteg } from '~utils/klage/klageUtils';
import { splittAvsluttedeOgÅpneRevurderinger } from '~utils/revurdering/revurderingUtils';
import { getIverksatteInnvilgedeSøknader, getIverksatteAvslåtteSøknader } from '~utils/søknad/søknadUtils';

import KlageLister from './KlageLister';
import { AvsluttedeRevurderinger, ÅpneRevurderinger } from './RevurderingsLister';
import messages from './sakintro-nb';
import styles from './sakintro.module.less';
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

const Sakintro = (props: { sak: Sak }) => {
    const { intl } = useI18n({ messages });
    const locationState = useNotificationFromLocation();

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

    const kanRevurderes = !isEmpty(props.sak.utbetalinger);
    const revurderingToggle = useFeatureToggle(FeatureToggle.Revurdering) && kanRevurderes;

    const kanOppretteKlage = !isEmpty(props.sak.vedtak);
    const klageToggle = useFeatureToggle(FeatureToggle.Klage) && kanOppretteKlage;

    return (
        <div className={styles.sakintroContainer}>
            <SuksessStatuser locationState={locationState} />
            <div className={styles.pageHeader}>
                <div className={styles.headerKnapper}>
                    <NyBehandlingVelger
                        sakId={props.sak.id}
                        klager={props.sak.klager}
                        klageToggle={klageToggle}
                        intl={intl}
                    />
                </div>
            </div>
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
                    {revurderingToggle && (
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
                    {klageToggle && <KlageLister sakId={props.sak.id} klager={props.sak.klager} />}
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

const NyBehandlingVelger = (props: { sakId: string; klager: Klage[]; klageToggle: boolean; intl: IntlShape }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement>();

    const nyBehandlingTilRoute = (nyBehandling: NyBehandling): string => {
        switch (nyBehandling) {
            case NyBehandling.REVURDER:
                return Routes.revurderValgtSak.createURL({ sakId: props.sakId });
            case NyBehandling.KLAGE: {
                const åpenKlage = getÅpenKlage(props.klager);

                if (åpenKlage) {
                    return Routes.klage.createURL({
                        sakId: props.sakId,
                        klageId: åpenKlage.id,
                        steg: hentSisteVurderteSteg(åpenKlage),
                    });
                }
                return Routes.klageOpprett.createURL({ sakId: props.sakId });
            }
        }
    };
    return (
        <div className={styles.nyBehandlingVelgerContainer}>
            <Button
                variant="secondary"
                onClick={(e) => {
                    if (anchorEl) {
                        setAnchorEl(undefined);
                    } else {
                        setAnchorEl(e.currentTarget);
                    }
                }}
            >
                {props.intl.formatMessage({ id: 'popover.default' })}
                {anchorEl !== null ? <Chevron type="ned" /> : <Chevron type="opp" />}
            </Button>
            <Popover
                ankerEl={anchorEl}
                onRequestClose={() => setAnchorEl(undefined)}
                orientering={PopoverOrientering.Under}
                utenPil
            >
                <div className={styles.popoverOptionsContainer}>
                    <LinkAsButton
                        className={styles.popoverOption}
                        variant="tertiary"
                        href={nyBehandlingTilRoute(NyBehandling.REVURDER)}
                    >
                        {props.intl.formatMessage({ id: 'popover.option.revurder' })}
                    </LinkAsButton>
                    {props.klageToggle && (
                        <LinkAsButton
                            className={styles.popoverOption}
                            variant="tertiary"
                            href={nyBehandlingTilRoute(NyBehandling.KLAGE)}
                        >
                            {props.intl.formatMessage({ id: 'popover.option.klage' })}
                        </LinkAsButton>
                    )}
                </div>
            </Popover>
        </div>
    );
};

export const AvsluttOgStartFortsettButtons = (props: {
    sakId: string;
    behandlingsId: string;
    primaryButtonTekst: string;
    intl: IntlShape;
    usePrimaryAsLink?: {
        url: string;
    };
    usePrimaryAsButton?: {
        onClick: () => Promise<void>;
        status: ApiResult<Behandling, string>;
    };
    hideSecondaryButton?: boolean;
}) => {
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
                    {props.intl.formatMessage({
                        id: 'behandling.avsluttBehandling',
                    })}
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
