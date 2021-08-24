import * as RemoteData from '@devexperts/remote-data-ts';
import classNames from 'classnames';
import { isEmpty, last } from 'fp-ts/lib/Array';
import { toNullable } from 'fp-ts/lib/Option';
import AlertStripe, { AlertStripeSuksess } from 'nav-frontend-alertstriper';
import { EtikettInfo } from 'nav-frontend-etiketter';
import Ikon from 'nav-frontend-ikoner-assets';
import { Hovedknapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import { Element, Ingress, Innholdstittel, Normaltekst, Undertittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import { FeatureToggle } from '~api/featureToggleApi';
import { Person } from '~api/personApi';
import UnderkjenteAttesteringer from '~components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useUserContext } from '~context/userContext';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useFeatureToggle } from '~lib/featureToggles';
import { pipe } from '~lib/fp';
import { useI18n, useNotificationFromLocation } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import Utbetalinger from '~pages/saksbehandling/sakintro/Utbetalinger';
import { useAppDispatch } from '~redux/Store';
import { Behandling } from '~types/Behandling';
import { Revurdering } from '~types/Revurdering';
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
} from '../../../utils/revurdering/revurderingUtils';
import { RevurderingSteg } from '../types';

import messages from './sakintro-nb';
import styles from './sakintro.module.less';

const SuksessStatuser = (props: { locationState: Nullable<Routes.SuccessNotificationState> }) => {
    return (
        <div className={styles.suksessStatuserContainer}>
            {props.locationState?.notification && (
                <AlertStripeSuksess>{props.locationState.notification}</AlertStripeSuksess>
            )}
        </div>
    );
};

const lukketBegrunnelseResourceId = (type?: LukkSøknadBegrunnelse) => {
    switch (type) {
        case LukkSøknadBegrunnelse.Avvist:
            return 'display.søknad.lukket.avvist';
        case LukkSøknadBegrunnelse.Bortfalt:
            return 'display.søknad.lukket.bortfalt';
        case LukkSøknadBegrunnelse.Trukket:
            return 'display.søknad.lukket.trukket';
        default:
            return 'display.søknad.lukket.ukjentLukking';
    }
};

const Sakintro = (props: { sak: Sak; søker: Person }) => {
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
                <Innholdstittel className={styles.tittel}>
                    {intl.formatMessage({ id: 'display.saksoversikt.tittel' })}: {props.sak.saksnummer}
                </Innholdstittel>
                <div className={styles.headerKnapper}>
                    {revurderingToggle && (
                        <Link
                            to={Routes.revurderValgtSak.createURL({
                                sakId: props.sak.id,
                            })}
                            className={classNames('knapp', styles.headerKnapp)}
                        >
                            {intl.formatMessage({ id: 'knapp.revurder' })}
                        </Link>
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
                        søker={props.søker}
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
            <Ingress className={styles.søknadsContainerTittel}>
                {props.intl.formatMessage({ id: 'display.åpneSøknader.tittel' })}
            </Ingress>
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
                                        <Undertittel>
                                            {props.intl.formatMessage({ id: 'display.søknad.typeSøknad' })}
                                        </Undertittel>
                                        <div className={styles.dato}>
                                            <Element>
                                                {`${props.intl.formatMessage({ id: 'display.søknad.mottatt' })}: `}
                                            </Element>
                                            <Normaltekst>{søknadMottatt(s, props.intl)}</Normaltekst>
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
                                                b={behandling}
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

const Revurderinger = (props: { sak: Sak; revurderinger: Revurdering[]; intl: IntlShape }) => {
    if (props.revurderinger.length === 0) return null;

    return (
        <div className={styles.søknadsContainer}>
            <Ingress className={styles.søknadsContainerTittel}>
                {props.intl.formatMessage({ id: 'revurdering.tittel' })}
            </Ingress>
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
                                            <Undertittel>
                                                {props.intl.formatMessage({ id: 'revurdering.undertittel' })}
                                            </Undertittel>
                                            {erForhåndsvarselSendt(r) && (
                                                <EtikettInfo className={styles.etikett}>
                                                    {props.intl.formatMessage({
                                                        id: 'revurdering.label.forhåndsvarselSendt',
                                                    })}
                                                </EtikettInfo>
                                            )}
                                        </div>
                                        <div className={styles.dato}>
                                            <Element>
                                                {props.intl.formatMessage({ id: 'revurdering.opprettet' })}{' '}
                                            </Element>
                                            <Normaltekst>{props.intl.formatDate(r.opprettet)}</Normaltekst>
                                        </div>
                                        {vedtakForBehandling?.opprettet && (
                                            <div className={styles.dato}>
                                                <Element>
                                                    {props.intl.formatMessage({ id: 'revurdering.iverksattDato' })}{' '}
                                                </Element>
                                                <Normaltekst>
                                                    {props.intl.formatDate(vedtakForBehandling.opprettet)}
                                                </Normaltekst>
                                            </div>
                                        )}
                                        {underkjenteRevurderinger.length > 0 && !erRevurderingIverksatt(r) && (
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
    revurdering: Revurdering;
    vedtak: Vedtak[];
    intl: IntlShape;
}) => {
    const user = useUserContext();
    const { revurdering } = props;
    const vedtak = props.vedtak.find((v) => v.behandlingId === revurdering.id);

    return (
        <div className={styles.behandlingContainer}>
            {erRevurderingTilAttestering(revurdering) &&
                (!user.isAttestant || user.navIdent === revurdering.saksbehandler) && (
                    <div className={styles.ikonContainer}>
                        <Ikon className={styles.ikon} kind="info-sirkel-fyll" width={'24px'} />
                        <p>
                            {props.intl.formatMessage({
                                id: 'display.attestering.tilAttestering',
                            })}
                        </p>
                    </div>
                )}

            {erRevurderingIverksatt(revurdering) && vedtak && (
                <Link
                    className="knapp"
                    to={Routes.vedtaksoppsummering.createURL({ sakId: props.sakId, vedtakId: vedtak.id })}
                >
                    Se oppsummering
                </Link>
            )}

            <div className={styles.knapper}>
                {erRevurderingTilAttestering(revurdering) &&
                user.isAttestant &&
                user.navIdent !== revurdering.saksbehandler ? (
                    <Link
                        className="knapp knapp--mini"
                        to={Routes.attesterRevurdering.createURL({
                            sakId: props.sakId,
                            revurderingId: revurdering.id,
                        })}
                    >
                        {props.intl.formatMessage({
                            id: 'display.attestering.attester',
                        })}
                    </Link>
                ) : (
                    !erRevurderingTilAttestering(revurdering) &&
                    !erRevurderingIverksatt(revurdering) &&
                    user.navIdent !== pipe(revurdering.attesteringer, last, toNullable)?.attestant && (
                        <Link
                            className="knapp knapp--mini"
                            to={Routes.revurderValgtRevurdering.createURL({
                                sakId: props.sakId,
                                steg: erRevurderingSimulert(revurdering)
                                    ? RevurderingSteg.Oppsummering
                                    : finnNesteRevurderingsteg(revurdering.informasjonSomRevurderes),
                                revurderingId: revurdering.id,
                            })}
                        >
                            {props.intl.formatMessage({ id: 'revurdering.fortsett' })}
                        </Link>
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
            <Ingress className={styles.søknadsContainerTittel}>
                {props.intl.formatMessage({ id: 'display.godkjenteSøknader.tittel' })}
            </Ingress>
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
                                        <Undertittel>
                                            {props.intl.formatMessage({ id: 'display.søknad.typeSøknad' })}
                                        </Undertittel>
                                        <div className={styles.dato}>
                                            <Element>
                                                {`${props.intl.formatMessage({ id: 'display.søknad.mottatt' })}: `}
                                            </Element>
                                            <Normaltekst>{søknadMottatt(s.søknad, props.intl)}</Normaltekst>
                                        </div>
                                        <div className={styles.dato}>
                                            <Element>
                                                {`${props.intl.formatMessage({
                                                    id: 'display.søknad.iverksattDato',
                                                })}: `}
                                            </Element>
                                            <Normaltekst>{props.intl.formatDate(s.iverksattDato)}</Normaltekst>
                                        </div>
                                    </div>
                                    <div className={(styles.knapper, styles.flexColumn)}>
                                        <Link
                                            className="knapp"
                                            to={Routes.vedtaksoppsummering.createURL({
                                                sakId: props.sak.id,
                                                vedtakId: vedtak.id,
                                            })}
                                        >
                                            {props.intl.formatMessage({ id: 'display.behandling.seOppsummering' })}
                                        </Link>
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
    const [request, setRequest] = useState<RemoteData.RemoteData<ApiError, Behandling>>(RemoteData.initial);
    const dispatch = useAppDispatch();
    const history = useHistory();

    const requestErrorMessageFormatted = (request: RemoteData.RemoteFailure<ApiError>) => {
        if (request.error.body?.message.includes('Fant ikke søknad')) {
            return 'display.behandling.klarteIkkeStarteBehandling.fantIkkeSøknad';
        } else if (request.error.body?.message.includes('mangler oppgave')) {
            return 'display.behandling.klarteIkkeStarteBehandling.manglerOppgave';
        } else if (request.error.body?.message.includes('har allerede en behandling')) {
            return 'display.behandling.klarteIkkeStarteBehandling.harEnBehandling';
        } else if (request.error.body?.message.includes('er lukket')) {
            return 'display.behandling.klarteIkkeStarteBehandling.erLukket';
        } else {
            return 'display.behandling.klarteIkkeStarteBehandling';
        }
    };

    return (
        <div className={styles.startSøknadsbehandlingKnapperContainer}>
            <div className={styles.startSøknadsbehandlingKnapper}>
                <Hovedknapp
                    className={styles.startBehandlingKnapp}
                    mini
                    onClick={async () => {
                        setRequest(RemoteData.pending);
                        const response = await dispatch(
                            sakSlice.startBehandling({
                                sakId: props.sakId,
                                søknadId: props.søknadId,
                            })
                        );

                        if (response.payload && 'id' in response.payload) {
                            return history.push(
                                Routes.saksbehandlingVilkårsvurdering.createURL({
                                    sakId: props.sakId,
                                    behandlingId: response.payload.id,
                                })
                            );
                        }
                        if (response.payload) {
                            setRequest(RemoteData.failure(response.payload));
                        }
                    }}
                    spinner={RemoteData.isPending(request)}
                >
                    {props.intl.formatMessage({
                        id: 'display.behandling.startBehandling',
                    })}
                </Hovedknapp>
                <Link
                    className="knapp knapp--fare knapp--mini"
                    to={Routes.avsluttSøknadsbehandling.createURL({
                        sakId: props.sakId,
                        soknadId: props.søknadId,
                    })}
                >
                    {props.intl.formatMessage({
                        id: 'display.søknad.lukkSøknad',
                    })}
                </Link>
            </div>
            {RemoteData.isFailure(request) && (
                <AlertStripe className={styles.feil} type="feil">
                    {props.intl.formatMessage({
                        id: requestErrorMessageFormatted(request),
                    })}
                </AlertStripe>
            )}
        </div>
    );
};

const SøknadsbehandlingStartetKnapper = (props: { b: Behandling; sakId: string; intl: IntlShape }) => {
    const user = useUserContext();
    const { b } = props;

    return (
        <div className={styles.behandlingContainer}>
            {erTilAttestering(b) && (!user.isAttestant || user.navIdent === b.saksbehandler) && (
                <div className={styles.ikonContainer}>
                    <Ikon className={styles.ikon} kind="info-sirkel-fyll" width={'24px'} />
                    <p>
                        {props.intl.formatMessage({
                            id: 'display.attestering.tilAttestering',
                        })}
                    </p>
                </div>
            )}

            <div className={styles.knapper}>
                {erTilAttestering(b) && user.isAttestant && user.navIdent !== b.saksbehandler ? (
                    <Link
                        className="knapp knapp--mini"
                        to={Routes.attesterSøknadsbehandling.createURL({
                            sakId: props.sakId,
                            behandlingId: b.id,
                        })}
                    >
                        {props.intl.formatMessage({
                            id: 'display.attestering.attester',
                        })}
                    </Link>
                ) : (
                    !erTilAttestering(b) &&
                    !erIverksatt(b) &&
                    user.navIdent !== pipe(b.attesteringer ?? [], last, toNullable)?.attestant && (
                        <Link
                            className="knapp knapp--mini"
                            to={Routes.saksbehandlingVilkårsvurdering.createURL({
                                sakId: props.sakId,
                                behandlingId: b.id,
                                vilkar: hentSisteVurdertSaksbehandlingssteg(b),
                            })}
                        >
                            {props.intl.formatMessage({
                                id: 'display.behandling.fortsettBehandling',
                            })}
                        </Link>
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
            <Ingress className={styles.søknadsContainerTittel}>
                {props.intl.formatMessage({
                    id: 'display.lukkedeSøknader.tittel',
                })}
            </Ingress>
            <ol>
                {props.lukkedeSøknader.map((søknad) => (
                    <li key={søknad.id}>
                        <Panel border className={styles.søknad}>
                            <div className={styles.info}>
                                <div>
                                    <Undertittel>
                                        {props.intl.formatMessage({ id: 'display.søknad.typeSøknad' })}
                                    </Undertittel>
                                    <div className={styles.dato}>
                                        <Element>
                                            {`${props.intl.formatMessage({ id: 'display.søknad.mottatt' })}: `}
                                        </Element>
                                        <Normaltekst>{søknadMottatt(søknad, props.intl)}</Normaltekst>
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
            <Ingress className={styles.søknadsContainerTittel}>
                {props.intl.formatMessage({
                    id: 'display.avslåtteSøknader.tittel',
                })}
            </Ingress>
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
                                        <Undertittel>
                                            {props.intl.formatMessage({ id: 'display.søknad.typeSøknad' })}
                                        </Undertittel>
                                        <div className={styles.dato}>
                                            <Element>
                                                {`${props.intl.formatMessage({ id: 'display.søknad.mottatt' })}: `}
                                            </Element>
                                            <Normaltekst>{søknadMottatt(s.søknad, props.intl)}</Normaltekst>
                                        </div>
                                        <div className={styles.dato}>
                                            <Element>
                                                {`${props.intl.formatMessage({
                                                    id: 'display.søknad.iverksattDato',
                                                })}: `}
                                            </Element>
                                            <Normaltekst>{props.intl.formatDate(s.iverksattDato)}</Normaltekst>
                                        </div>
                                    </div>
                                </div>
                                <div className={(styles.knapper, styles.flexColumn)}>
                                    <Link
                                        className="knapp"
                                        to={Routes.vedtaksoppsummering.createURL({
                                            sakId: props.sak.id,
                                            vedtakId: vedtak.id,
                                        })}
                                    >
                                        {props.intl.formatMessage({ id: 'revurdering.oppsummering' })}
                                    </Link>
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
