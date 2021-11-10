import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Button, Heading, Label, LinkPanel, Loader, Panel, Tag } from '@navikt/ds-react';
import { isEmpty, last } from 'fp-ts/lib/Array';
import { toNullable } from 'fp-ts/lib/Option';
import Ikon from 'nav-frontend-ikoner-assets';
import React from 'react';
import { IntlShape } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { FeatureToggle } from '~api/featureToggleApi';
import { ÅpentBrev } from '~assets/Illustrations';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import UnderkjenteAttesteringer from '~components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useUserContext } from '~context/userContext';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useFeatureToggle } from '~lib/featureToggles';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator, useNotificationFromLocation } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import Utbetalinger from '~pages/saksbehandling/sakintro/Utbetalinger';
import { Behandling } from '~types/Behandling';
import { AbstraktRevurdering, RevurderingsStatus } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { LukkSøknadBegrunnelse, Søknad } from '~types/Søknad';
import { Vedtak } from '~types/Vedtak';
import { erIverksatt, erTilAttestering, hentSisteVurdertSaksbehandlingssteg } from '~utils/behandling/behandlingUtils';
import {
    getIverksatteInnvilgedeSøknader,
    søknadMottatt,
    getIverksatteAvslåtteSøknader,
} from '~utils/søknad/søknadUtils';

import {
    erRevurderingTilAttestering,
    erRevurderingIverksatt,
    erRevurderingSimulert,
    erForhåndsvarselSendt,
    finnNesteRevurderingsteg,
    erRevurderingStans,
    erRevurderingGjenopptak,
    erRevurdering,
} from '../../../utils/revurdering/revurderingUtils';
import { RevurderingSteg } from '../types';

import messages from './sakintro-nb';
import styles from './sakintro.module.less';

const SuksessStatuser = (props: { locationState: Nullable<Routes.SuccessNotificationState> }) => {
    return (
        <div className={styles.suksessStatuserContainer}>
            {props.locationState?.notification && <Alert variant="success">{props.locationState.notification}</Alert>}
        </div>
    );
};

const lukketBegrunnelseResourceId = (type?: LukkSøknadBegrunnelse) => {
    switch (type) {
        case LukkSøknadBegrunnelse.Avvist:
            return 'søknad.lukket.avvist';
        case LukkSøknadBegrunnelse.Bortfalt:
            return 'søknad.lukket.bortfalt';
        case LukkSøknadBegrunnelse.Trukket:
            return 'søknad.lukket.trukket';
        default:
            return 'søknad.lukket.ukjentLukking';
    }
};

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

    const iverksatteInnvilgedeSøknader = getIverksatteInnvilgedeSøknader(props.sak);

    const lukkedeSøknader = props.sak.søknader.filter((søknad) => {
        return søknad.lukket !== null;
    });

    const avslåtteSøknader = getIverksatteAvslåtteSøknader(props.sak);

    const revurderinger = props.sak.revurderinger;
    const kanRevurderes = !isEmpty(props.sak.utbetalinger);

    const revurderingToggle = useFeatureToggle(FeatureToggle.Revurdering) && kanRevurderes;

    return (
        <div className={styles.sakintroContainer}>
            <SuksessStatuser locationState={locationState} />
            <div className={styles.pageHeader}>
                <Heading level="1" size="xlarge" className={styles.tittel}>
                    {intl.formatMessage({ id: 'saksoversikt.tittel' })}: {props.sak.saksnummer}
                </Heading>
                <div className={styles.headerKnapper}>
                    {revurderingToggle && (
                        <LinkAsButton
                            href={Routes.revurderValgtSak.createURL({
                                sakId: props.sak.id,
                            })}
                            className={styles.headerKnapp}
                            variant="secondary"
                        >
                            {intl.formatMessage({ id: 'knapp.revurder' })}
                        </LinkAsButton>
                    )}
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
                    {revurderingToggle && <Revurderinger sak={props.sak} revurderinger={revurderinger} intl={intl} />}
                    <IverksattInnvilgedeSøknader
                        sak={props.sak}
                        iverksatteInnvilgedeSøknader={iverksatteInnvilgedeSøknader}
                        intl={intl}
                    />
                    <AvslåtteSøknader sak={props.sak} avslåtteSøknader={avslåtteSøknader} intl={intl} />
                    <LukkedeSøknader lukkedeSøknader={lukkedeSøknader} intl={intl} />
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

const ÅpneSøknader = (props: {
    åpneSøknader: Søknad[];
    behandlinger: Behandling[];
    sakId: string;
    intl: IntlShape;
}) => {
    if (props.åpneSøknader.length === 0) return null;

    return (
        <div className={styles.søknadsContainer}>
            <Heading level="2" size="medium" spacing>
                {props.intl.formatMessage({ id: 'søknad.åpneSøknader.tittel' })}
            </Heading>
            <ol>
                {props.åpneSøknader.map((s) => {
                    const behandling = props.behandlinger.find((b) => b.søknad.id === s.id);
                    const attesteringer = behandling?.attesteringer ?? [];
                    const senesteAttestering = pipe(attesteringer, last, toNullable);

                    return (
                        <div key={s.id}>
                            <Panel border className={styles.søknad}>
                                <div className={styles.info}>
                                    <div>
                                        <Heading level="3" size="medium">
                                            {props.intl.formatMessage({ id: 'søknad.typeSøknad' })}
                                        </Heading>
                                        <div className={styles.dato}>
                                            <Label>{`${props.intl.formatMessage({ id: 'søknad.mottatt' })}: `}</Label>
                                            <BodyShort>{søknadMottatt(s, props.intl)}</BodyShort>
                                        </div>
                                        {senesteAttestering?.underkjennelse && (
                                            <UnderkjenteAttesteringer attesteringer={attesteringer} />
                                        )}
                                    </div>
                                    <div className={styles.knapper}>
                                        {!behandling ? (
                                            <StartSøknadsbehandlingKnapper
                                                sakId={props.sakId}
                                                søknadId={s.id}
                                                intl={props.intl}
                                            />
                                        ) : (
                                            <SøknadsbehandlingStartetKnapper
                                                sakId={props.sakId}
                                                intl={props.intl}
                                                behandling={behandling}
                                                søknadId={s.id}
                                            />
                                        )}
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    );
                })}
            </ol>
        </div>
    );
};

const Revurderinger = (props: { sak: Sak; revurderinger: AbstraktRevurdering[]; intl: IntlShape }) => {
    if (props.revurderinger.length === 0) return null;

    return (
        <div className={styles.søknadsContainer}>
            <Heading level="2" size="medium" spacing>
                {props.intl.formatMessage({ id: 'revurdering.tittel' })}
            </Heading>
            <ol>
                {props.revurderinger.map((r) => {
                    const vedtakForBehandling = props.sak.vedtak.find((v) => v.behandlingId === r.id);
                    const underkjenteRevurderinger = r.attesteringer.filter((a) => a.underkjennelse !== null);
                    return (
                        <div key={r.id}>
                            <Panel border className={styles.søknad}>
                                <div className={styles.info}>
                                    <div>
                                        <div className={styles.tittel}>
                                            <Heading level="3" size="small" spacing>
                                                {props.intl.formatMessage({ id: 'revurdering.undertittel' })}
                                            </Heading>
                                            {erRevurdering(r) && erForhåndsvarselSendt(r) && (
                                                <Tag variant="info" className={styles.etikett}>
                                                    {props.intl.formatMessage({
                                                        id: 'revurdering.label.forhåndsvarselSendt',
                                                    })}
                                                </Tag>
                                            )}
                                        </div>
                                        <div className={styles.dato}>
                                            <Label>{props.intl.formatMessage({ id: 'revurdering.opprettet' })} </Label>
                                            <BodyShort>{props.intl.formatDate(r.opprettet)}</BodyShort>
                                        </div>
                                        {vedtakForBehandling?.opprettet && (
                                            <div className={styles.dato}>
                                                <Label>
                                                    {props.intl.formatMessage({ id: 'revurdering.iverksattDato' })}{' '}
                                                </Label>
                                                <BodyShort>
                                                    {props.intl.formatDate(vedtakForBehandling.opprettet)}
                                                </BodyShort>
                                            </div>
                                        )}
                                        {underkjenteRevurderinger.length > 0 &&
                                            erRevurdering(r) &&
                                            !erRevurderingIverksatt(r) && (
                                                <div className={styles.underkjenteAttesteringerContainer}>
                                                    <UnderkjenteAttesteringer attesteringer={r.attesteringer} />
                                                </div>
                                            )}
                                    </div>
                                    <div className={styles.knapper}>
                                        <RevurderingStartetKnapper
                                            sakId={props.sak.id}
                                            vedtak={props.sak.vedtak}
                                            revurdering={r}
                                            intl={props.intl}
                                        />
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    );
                })}
            </ol>
        </div>
    );
};

const RevurderingStartetKnapper = (props: {
    sakId: string;
    revurdering: AbstraktRevurdering;
    vedtak: Vedtak[];
    intl: IntlShape;
}) => {
    const user = useUserContext();
    const { revurdering } = props;
    const vedtak = props.vedtak.find((v) => v.behandlingId === revurdering.id);

    return (
        <div className={styles.behandlingContainer}>
            {erRevurdering(revurdering) &&
                erRevurderingTilAttestering(revurdering) &&
                (!user.isAttestant || user.navIdent === revurdering.saksbehandler) && (
                    <div className={styles.ikonContainer}>
                        <Ikon className={styles.ikon} kind="info-sirkel-fyll" width={'24px'} />
                        <p>
                            {props.intl.formatMessage({
                                id: 'attestering.tilAttestering',
                            })}
                        </p>
                    </div>
                )}

            {erRevurdering(revurdering) && erRevurderingIverksatt(revurdering) && vedtak && (
                <LinkAsButton
                    variant="secondary"
                    href={Routes.vedtaksoppsummering.createURL({ sakId: props.sakId, vedtakId: vedtak.id })}
                    size="small"
                >
                    Se oppsummering
                </LinkAsButton>
            )}

            <div className={styles.knapper}>
                {erRevurdering(revurdering) &&
                erRevurderingTilAttestering(revurdering) &&
                user.isAttestant &&
                user.navIdent !== revurdering.saksbehandler ? (
                    <LinkAsButton
                        variant="secondary"
                        size="small"
                        href={Routes.attesterRevurdering.createURL({
                            sakId: props.sakId,
                            revurderingId: revurdering.id,
                        })}
                    >
                        {props.intl.formatMessage({
                            id: 'attestering.attester',
                        })}
                    </LinkAsButton>
                ) : erRevurderingStans(revurdering) ? (
                    <LinkAsButton
                        href={Routes.stansOppsummeringRoute.createURL({
                            sakId: props.sakId,
                            revurderingId: revurdering.id,
                        })}
                        variant="secondary"
                        size="small"
                    >
                        {revurdering.status === RevurderingsStatus.IVERKSATT_STANS
                            ? props.intl.formatMessage({ id: 'revurdering.oppsummering' })
                            : props.intl.formatMessage({ id: 'revurdering.fortsett' })}
                    </LinkAsButton>
                ) : erRevurderingGjenopptak(revurdering) ? (
                    <LinkAsButton
                        href={Routes.gjenopptaStansOppsummeringRoute.createURL({
                            sakId: props.sakId,
                            revurderingId: revurdering.id,
                        })}
                        variant="secondary"
                        size="small"
                    >
                        {revurdering.status === RevurderingsStatus.IVERKSATT_GJENOPPTAK
                            ? props.intl.formatMessage({ id: 'revurdering.oppsummering' })
                            : props.intl.formatMessage({ id: 'revurdering.fortsett' })}
                    </LinkAsButton>
                ) : (
                    erRevurdering(revurdering) &&
                    !erRevurderingTilAttestering(revurdering) &&
                    !erRevurderingIverksatt(revurdering) &&
                    user.navIdent !== pipe(revurdering.attesteringer, last, toNullable)?.attestant && (
                        <div>
                            <LinkAsButton
                                variant="secondary"
                                size="small"
                                href={Routes.avsluttBehandling.createURL({
                                    sakId: props.sakId,
                                    id: revurdering.id,
                                })}
                            >
                                {props.intl.formatMessage({
                                    id: 'behandling.avsluttBehandling',
                                })}
                            </LinkAsButton>
                            <LinkAsButton
                                variant="primary"
                                size="small"
                                href={Routes.revurderValgtRevurdering.createURL({
                                    sakId: props.sakId,
                                    steg: erRevurderingSimulert(revurdering)
                                        ? RevurderingSteg.Oppsummering
                                        : finnNesteRevurderingsteg(revurdering.informasjonSomRevurderes),
                                    revurderingId: revurdering.id,
                                })}
                            >
                                {props.intl.formatMessage({ id: 'revurdering.fortsett' })}
                            </LinkAsButton>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

const IverksattInnvilgedeSøknader = (props: {
    iverksatteInnvilgedeSøknader: Array<{
        iverksattDato: string | undefined;
        søknadensBehandlingsId: string | undefined;
        søknad: Søknad;
    }>;
    sak: Sak;
    intl: IntlShape;
}) => {
    if (props.iverksatteInnvilgedeSøknader.length === 0) return null;

    return (
        <div className={styles.søknadsContainer}>
            <Heading level="2" size="medium" spacing>
                {props.intl.formatMessage({ id: 'søknad.godkjenteSøknader.tittel' })}
            </Heading>
            <ol>
                {props.iverksatteInnvilgedeSøknader.map((s) => {
                    if (!s.søknadensBehandlingsId) {
                        return null;
                    }
                    const vedtak = props.sak.vedtak.find((v) => v.behandlingId === s.søknadensBehandlingsId);
                    if (!vedtak) {
                        return null;
                    }

                    return (
                        <div key={s.søknad.id}>
                            <Panel border className={styles.søknad}>
                                <div className={styles.info}>
                                    <div>
                                        <Heading level="3" size="small" spacing>
                                            {props.intl.formatMessage({ id: 'søknad.typeSøknad' })}
                                        </Heading>
                                        <div className={styles.dato}>
                                            <Label>{`${props.intl.formatMessage({ id: 'søknad.mottatt' })}: `}</Label>
                                            <BodyShort>{søknadMottatt(s.søknad, props.intl)}</BodyShort>
                                        </div>
                                        <div className={styles.dato}>
                                            <Label>
                                                {`${props.intl.formatMessage({
                                                    id: 'søknad.iverksattDato',
                                                })}: `}
                                            </Label>
                                            <BodyShort>{props.intl.formatDate(s.iverksattDato)}</BodyShort>
                                        </div>
                                    </div>
                                    <div className={(styles.knapper, styles.flexColumn)}>
                                        <LinkAsButton
                                            variant="secondary"
                                            href={Routes.vedtaksoppsummering.createURL({
                                                sakId: props.sak.id,
                                                vedtakId: vedtak.id,
                                            })}
                                            size="small"
                                        >
                                            {props.intl.formatMessage({ id: 'behandling.seOppsummering' })}
                                        </LinkAsButton>
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    );
                })}
            </ol>
        </div>
    );
};

const StartSøknadsbehandlingKnapper = (props: { sakId: string; søknadId: string; intl: IntlShape }) => {
    const history = useHistory();
    const [behandlingStatus, startBehandling] = useAsyncActionCreator(sakSlice.startBehandling);

    return (
        <div className={styles.søknadsbehandlingKnapperContainer}>
            <div className={styles.søknadsbehandlingKnapper}>
                <LinkAsButton
                    size="small"
                    variant="secondary"
                    href={Routes.avsluttBehandling.createURL({
                        sakId: props.sakId,
                        id: props.søknadId,
                    })}
                >
                    {props.intl.formatMessage({
                        id: 'behandling.avsluttBehandling',
                    })}
                </LinkAsButton>
                <Button
                    className={styles.startBehandlingKnapp}
                    size="small"
                    onClick={() => {
                        startBehandling(
                            {
                                sakId: props.sakId,
                                søknadId: props.søknadId,
                            },
                            (response) => {
                                history.push(
                                    Routes.saksbehandlingVilkårsvurdering.createURL({
                                        sakId: props.sakId,
                                        behandlingId: response.id,
                                    })
                                );
                            }
                        );
                    }}
                >
                    {props.intl.formatMessage({
                        id: 'behandling.startBehandling',
                    })}
                    {RemoteData.isPending(behandlingStatus) && <Loader />}
                </Button>
            </div>
            {RemoteData.isFailure(behandlingStatus) && (
                <div className={styles.feil}>
                    <ApiErrorAlert error={behandlingStatus.error} />
                </div>
            )}
        </div>
    );
};

const SøknadsbehandlingStartetKnapper = (props: {
    behandling: Behandling;
    sakId: string;
    søknadId: string;
    intl: IntlShape;
}) => {
    const user = useUserContext();
    const { behandling } = props;

    return (
        <div className={styles.søknadsbehandlingKnapperContainer}>
            {erTilAttestering(behandling) && (!user.isAttestant || user.navIdent === behandling.saksbehandler) && (
                <div className={styles.ikonContainer}>
                    <Ikon className={styles.ikon} kind="info-sirkel-fyll" width={'24px'} />
                    <p>
                        {props.intl.formatMessage({
                            id: 'attestering.tilAttestering',
                        })}
                    </p>
                </div>
            )}

            <div className={styles.søknadsbehandlingKnapper}>
                {erTilAttestering(behandling) && user.isAttestant && user.navIdent !== behandling.saksbehandler ? (
                    <LinkAsButton
                        variant="secondary"
                        size="small"
                        href={Routes.attesterSøknadsbehandling.createURL({
                            sakId: props.sakId,
                            behandlingId: behandling.id,
                        })}
                    >
                        {props.intl.formatMessage({
                            id: 'attestering.attester',
                        })}
                    </LinkAsButton>
                ) : (
                    !erTilAttestering(behandling) &&
                    !erIverksatt(behandling) &&
                    user.navIdent !== pipe(behandling.attesteringer ?? [], last, toNullable)?.attestant && (
                        <>
                            <LinkAsButton
                                variant="secondary"
                                size="small"
                                href={Routes.avsluttBehandling.createURL({
                                    sakId: props.sakId,
                                    id: props.søknadId,
                                })}
                            >
                                {props.intl.formatMessage({
                                    id: 'behandling.avsluttBehandling',
                                })}
                            </LinkAsButton>
                            <LinkAsButton
                                size="small"
                                href={Routes.saksbehandlingVilkårsvurdering.createURL({
                                    sakId: props.sakId,
                                    behandlingId: behandling.id,
                                    vilkar: hentSisteVurdertSaksbehandlingssteg(behandling),
                                })}
                            >
                                {props.intl.formatMessage({
                                    id: 'behandling.fortsettBehandling',
                                })}
                            </LinkAsButton>
                        </>
                    )
                )}
            </div>
        </div>
    );
};

const LukkedeSøknader = (props: { lukkedeSøknader: Søknad[]; intl: IntlShape }) => {
    if (props.lukkedeSøknader.length === 0) return null;

    return (
        <div className={styles.søknadsContainer}>
            <Heading level="2" size="medium" spacing>
                {props.intl.formatMessage({
                    id: 'søknad.lukkedeSøknader.tittel',
                })}
            </Heading>
            <ol>
                {props.lukkedeSøknader.map((søknad) => (
                    <li key={søknad.id}>
                        <Panel border className={styles.søknad}>
                            <div className={styles.info}>
                                <div>
                                    <Heading level="3" size="small" spacing>
                                        {props.intl.formatMessage({ id: 'søknad.typeSøknad' })}
                                    </Heading>
                                    <div className={styles.dato}>
                                        <Label>{`${props.intl.formatMessage({ id: 'søknad.mottatt' })}: `}</Label>
                                        <BodyShort>{søknadMottatt(søknad, props.intl)}</BodyShort>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.ikonContainer}>
                                <Ikon className={styles.ikon} kind="feil-sirkel-fyll" width={'24px'} />
                                <p className={styles.ikonTekst}>
                                    {props.intl.formatMessage({
                                        id: lukketBegrunnelseResourceId(søknad.lukket?.type),
                                    })}
                                </p>
                            </div>
                        </Panel>
                    </li>
                ))}
            </ol>
        </div>
    );
};

const AvslåtteSøknader = (props: {
    sak: Sak;
    avslåtteSøknader: Array<{
        iverksattDato: string | undefined;
        søknadensBehandlingsId: string | undefined;
        søknad: Søknad;
    }>;
    intl: IntlShape;
}) => {
    if (props.avslåtteSøknader.length === 0) return null;

    return (
        <div className={styles.søknadsContainer}>
            <Heading level="2" size="medium" spacing>
                {props.intl.formatMessage({
                    id: 'søknad.avslåtteSøknader.tittel',
                })}
            </Heading>
            <ol>
                {props.avslåtteSøknader.map((s) => {
                    if (!s.søknadensBehandlingsId) {
                        return null;
                    }
                    const vedtak = props.sak.vedtak.find((v) => v.behandlingId === s.søknadensBehandlingsId);
                    if (!vedtak) {
                        return null;
                    }

                    return (
                        <li key={s.søknad.id}>
                            <Panel border className={styles.søknad}>
                                <div className={styles.info}>
                                    <div>
                                        <Heading level="3" size="small" spacing>
                                            {props.intl.formatMessage({ id: 'søknad.typeSøknad' })}
                                        </Heading>
                                        <div className={styles.dato}>
                                            <Label>{`${props.intl.formatMessage({ id: 'søknad.mottatt' })}: `}</Label>
                                            <BodyShort>{søknadMottatt(s.søknad, props.intl)}</BodyShort>
                                        </div>
                                        <div className={styles.dato}>
                                            <Label>
                                                {`${props.intl.formatMessage({
                                                    id: 'søknad.iverksattDato',
                                                })}: `}
                                            </Label>
                                            <BodyShort>{props.intl.formatDate(s.iverksattDato)}</BodyShort>
                                        </div>
                                    </div>
                                </div>
                                <div className={(styles.knapper, styles.flexColumn)}>
                                    <LinkAsButton
                                        variant="secondary"
                                        href={Routes.vedtaksoppsummering.createURL({
                                            sakId: props.sak.id,
                                            vedtakId: vedtak.id,
                                        })}
                                        size="small"
                                    >
                                        {props.intl.formatMessage({ id: 'revurdering.oppsummering' })}
                                    </LinkAsButton>
                                </div>
                            </Panel>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default Sakintro;
