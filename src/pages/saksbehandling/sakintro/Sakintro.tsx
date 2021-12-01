import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, LinkPanel, Loader, Select } from '@navikt/ds-react';
import { isEmpty } from 'fp-ts/lib/Array';
import React from 'react';
import { IntlShape } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

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
import { Sak } from '~types/Sak';
import { Søknad } from '~types/Søknad';
import { erIverksatt } from '~utils/behandling/behandlingUtils';
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
    const locationState = useNotificationFromLocation();
    const { intl } = useI18n({ messages });

    const åpneSøknader = props.sak.søknader
        .filter((søknad) => {
            const behandling = props.sak.behandlinger.find((b) => b.søknad.id === søknad.id);
            return søknad.lukket === null && (!behandling || !erIverksatt(behandling));
        })
        .sort((a: Søknad, b: Søknad) => {
            return Date.parse(a.opprettet) - Date.parse(b.opprettet);
        });
    const history = useHistory();

    const iverksatteInnvilgedeSøknader = getIverksatteInnvilgedeSøknader(props.sak);

    const lukkedeSøknader = props.sak.søknader.filter((søknad) => {
        return søknad.lukket !== null;
    });

    const avslåtteSøknader = getIverksatteAvslåtteSøknader(props.sak);

    const { avsluttedeRevurderinger, åpneRevurderinger } = splittAvsluttedeOgÅpneRevurderinger(props.sak.revurderinger);

    const kanRevurderes = !isEmpty(props.sak.utbetalinger);

    const revurderingToggle = useFeatureToggle(FeatureToggle.Revurdering) && kanRevurderes;

    const klageToggle = useFeatureToggle(FeatureToggle.Klage) && !isEmpty(props.sak.vedtak);

    const nyBehandlingTilRoute = (nyBehandling: NyBehandling): string => {
        switch (nyBehandling) {
            case NyBehandling.REVURDER:
                return Routes.revurderValgtSak.createURL({ sakId: props.sak.id });
            case NyBehandling.KLAGE:
                return Routes.klageOpprett.createURL({ sakId: props.sak.id });
        }
        return assertNever(nyBehandling);
    };

    return (
        <div className={styles.sakintroContainer}>
            <SuksessStatuser locationState={locationState} />
            <div className={styles.pageHeader}>
                <div className={styles.headerKnapper}>
                    <Select
                        label={intl.formatMessage({ id: 'select.label' })}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const val = e.target.value;
                            if (val in NyBehandling) {
                                history.push(nyBehandlingTilRoute(val as NyBehandling));
                            }
                        }}
                    >
                        <option value={undefined}>{intl.formatMessage({ id: 'select.option.default' })}</option>
                        {klageToggle && (
                            <option value={NyBehandling.KLAGE}>
                                {intl.formatMessage({ id: 'select.option.klage' })}
                            </option>
                        )}
                        <option value={NyBehandling.REVURDER}>
                            {intl.formatMessage({ id: 'select.option.revurder' })}
                        </option>
                    </Select>
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

function assertNever(x: never): never {
    throw new Error(`Unexpected object: ${x}`);
}
