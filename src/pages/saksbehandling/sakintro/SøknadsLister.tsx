import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Heading, Label, Panel } from '@navikt/ds-react';
import { last } from 'fp-ts/lib/Array';
import { toNullable } from 'fp-ts/lib/Option';
import React from 'react';
import { IntlShape } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { ErrorIcon, InformationIcon } from '~src/components/icons/Icons';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import UnderkjenteAttesteringer from '~src/components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useUserContext } from '~src/context/userContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useAsyncActionCreator } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { Behandling } from '~src/types/Behandling';
import { Sak } from '~src/types/Sak';
import { LukkSøknadBegrunnelse, Søknad } from '~src/types/Søknad';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import {
    erIverksatt,
    erTilAttestering,
    hentSisteVurdertSaksbehandlingssteg,
} from '~src/utils/behandling/behandlingUtils';
import { formatDate } from '~src/utils/date/dateUtils';
import { søknadMottatt } from '~src/utils/søknad/søknadUtils';

import { AvsluttOgStartFortsettButtons } from './Sakintro';
import * as styles from './sakintro.module.less';

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

export const ÅpneSøknader = (props: {
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
                        <li key={s.id}>
                            <Panel border className={styles.søknad}>
                                <div className={styles.info}>
                                    <div>
                                        <Heading level="3" size="medium">
                                            {props.intl.formatMessage({ id: 'søknad.typeSøknad' })}
                                        </Heading>
                                        <div className={styles.dato}>
                                            <Label>{`${props.intl.formatMessage({ id: 'søknad.mottatt' })}: `}</Label>
                                            <BodyShort>{søknadMottatt(s)}</BodyShort>
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
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export const IverksattInnvilgedeSøknader = (props: {
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
                                            <BodyShort>{søknadMottatt(s.søknad)}</BodyShort>
                                        </div>
                                        <div className={styles.dato}>
                                            <Label>
                                                {`${props.intl.formatMessage({
                                                    id: 'søknad.iverksattDato',
                                                })}: `}
                                            </Label>
                                            <BodyShort>{formatDate(s.iverksattDato ?? '')}</BodyShort>
                                        </div>
                                    </div>
                                    <div>
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
    const navigate = useNavigate();
    const [behandlingStatus, startBehandling] = useAsyncActionCreator(sakSlice.startBehandling);

    return (
        <div>
            <AvsluttOgStartFortsettButtons
                sakId={props.sakId}
                behandlingsId={props.søknadId}
                primaryButtonTekst={props.intl.formatMessage({
                    id: 'behandling.startBehandling',
                })}
                usePrimaryAsButton={{
                    onClick: () =>
                        startBehandling(
                            {
                                sakId: props.sakId,
                                søknadId: props.søknadId,
                            },
                            (response) => {
                                navigate(
                                    Routes.saksbehandlingVilkårsvurdering.createURL({
                                        vilkar: Vilkårtype.Virkningstidspunkt,
                                        sakId: props.sakId,
                                        behandlingId: response.id,
                                    })
                                );
                            }
                        ),
                    status: behandlingStatus,
                }}
            />

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
        <div>
            {erTilAttestering(behandling) && (!user.isAttestant || user.navIdent === behandling.saksbehandler) && (
                <div className={styles.ikonContainer}>
                    <InformationIcon className={styles.ikon} />
                    <p>
                        {props.intl.formatMessage({
                            id: 'attestering.tilAttestering',
                        })}
                    </p>
                </div>
            )}

            <div>
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
                        <AvsluttOgStartFortsettButtons
                            sakId={props.sakId}
                            behandlingsId={props.søknadId}
                            primaryButtonTekst={props.intl.formatMessage({
                                id: 'behandling.fortsettBehandling',
                            })}
                            usePrimaryAsLink={{
                                url: Routes.saksbehandlingVilkårsvurdering.createURL({
                                    sakId: props.sakId,
                                    behandlingId: behandling.id,
                                    vilkar: hentSisteVurdertSaksbehandlingssteg(behandling),
                                }),
                            }}
                        />
                    )
                )}
            </div>
        </div>
    );
};

export const LukkedeSøknader = (props: { lukkedeSøknader: Søknad[]; intl: IntlShape }) => {
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
                                        <BodyShort>{søknadMottatt(søknad)}</BodyShort>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.ikonContainer}>
                                <ErrorIcon className={styles.ikon} />
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

export const AvslåtteSøknader = (props: {
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
                                            <BodyShort>{søknadMottatt(s.søknad)}</BodyShort>
                                        </div>
                                        <div className={styles.dato}>
                                            <Label>
                                                {`${props.intl.formatMessage({
                                                    id: 'søknad.iverksattDato',
                                                })}: `}
                                            </Label>
                                            <BodyShort>{s.iverksattDato ? formatDate(s.iverksattDato) : ''}</BodyShort>
                                        </div>
                                    </div>
                                </div>
                                <div>
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
