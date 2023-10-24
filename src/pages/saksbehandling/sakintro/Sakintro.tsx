import * as RemoteData from '@devexperts/remote-data-ts';
import { ChevronUpIcon, ChevronDownIcon } from '@navikt/aksel-icons';
import { Alert, Button, LinkPanel, Modal, Popover } from '@navikt/ds-react';
import { isEmpty } from 'fp-ts/lib/Array';
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { ÅpentBrev } from '~src/assets/Illustrations';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import Vedtakstidslinje from '~src/components/vedtakstidslinje/VedtaksTidslinje';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { bekreftFnrEndring } from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator, useNotificationFromLocation } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import Utbetalinger from '~src/pages/saksbehandling/sakintro/Utbetalinger';
import { KlageStatus } from '~src/types/Klage';
import { Sakstype } from '~src/types/Sak';
import { erKlageAvsluttet, erKlageÅpen } from '~src/utils/klage/klageUtils';
import { erTilbakekrevingsbehandlingÅpen } from '~src/utils/ManuellTilbakekrevingsbehandlingUtils';
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
    TILBAKEKREVING = 'TILBAKEKREVING',
}

const BekreftFnrEndringModal = (props: {
    open: boolean;
    onClose: () => void;
    sakId: string;
    nyttFnr: string;
    forrigeFnr: string;
}) => {
    const [bekreftStatus, bekreft] = useAsyncActionCreator(bekreftFnrEndring);

    return (
        <Modal
            className={styles.fnrEndringsModal}
            open={props.open}
            onClose={props.onClose}
            header={{ heading: 'Bekreft fødselsnummerendring' }}
        >
            <Modal.Body>
                <OppsummeringPar label={'Nytt fødselsnummer'} verdi={props.nyttFnr} />
                <OppsummeringPar label={'Forrige fødselsnummer'} verdi={props.forrigeFnr} />
            </Modal.Body>
            <Modal.Footer className={styles.modalFooter}>
                <div className={styles.modalFooterButtonsContainer}>
                    <Button variant="secondary" onClick={props.onClose}>
                        Bekreft senere
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() =>
                            bekreft({ sakId: props.sakId, nyttFnr: props.nyttFnr, forrigeFnr: props.forrigeFnr })
                        }
                    >
                        Bekreft
                    </Button>
                </div>

                {RemoteData.isFailure(bekreftStatus) && <ApiErrorAlert error={bekreftStatus.error} />}
            </Modal.Footer>
        </Modal>
    );
};

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

    const åpneTilbakekrevingsbehandlinger = props.sak.tilbakekrevinger.filter(erTilbakekrevingsbehandlingÅpen);

    const alleÅpneBehandlinger = [
        ...åpneRevurderinger,
        ...åpneReguleringer,
        ...åpneSøknader,
        ...åpneKlager,
        ...åpneTilbakekrevingsbehandlinger,
    ];

    const [bekrefterFnrEndring, setBekrefterFnrEndring] = useState(false);

    return (
        <div className={styles.sakintroContainer}>
            {props.sak.fnr !== props.søker.fnr && (
                <Alert variant={'warning'} className={styles.fnrEndringsAlert}>
                    Det er registrert en fødselsnummersendring.
                    <Button variant="tertiary" className={styles.button} onClick={() => setBekrefterFnrEndring(true)}>
                        Klikk meg for å bekrefte endringen
                    </Button>
                </Alert>
            )}

            <BekreftFnrEndringModal
                open={bekrefterFnrEndring}
                onClose={() => setBekrefterFnrEndring(false)}
                sakId={props.sak.id}
                nyttFnr={props.søker.fnr}
                forrigeFnr={props.sak.fnr}
            />

            <SuksessStatuser locationState={locationState} />
            <div className={styles.pageHeader}>
                <div className={styles.headerKnapper}>
                    {harVedtak && props.sak.sakstype !== Sakstype.Alder && (
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
