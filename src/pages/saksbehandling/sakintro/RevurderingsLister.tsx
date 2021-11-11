import { BodyShort, Heading, Label, Panel, Tag } from '@navikt/ds-react';
import { last } from 'fp-ts/lib/Array';
import { toNullable } from 'fp-ts/lib/Option';
import Ikon from 'nav-frontend-ikoner-assets';
import React from 'react';
import { IntlShape } from 'react-intl';

import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import UnderkjenteAttesteringer from '~components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useUserContext } from '~context/userContext';
import { pipe } from '~lib/fp';
import * as Routes from '~lib/routes';
import { Revurdering, RevurderingsStatus } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { Vedtak } from '~types/Vedtak';

import {
    erRevurderingTilAttestering,
    erRevurderingIverksatt,
    erRevurderingSimulert,
    erForhåndsvarselSendt,
    finnNesteRevurderingsteg,
    erRevurderingStans,
    erRevurderingGjenopptak,
    erInformasjonsRevurdering,
} from '../../../utils/revurdering/revurderingUtils';
import { RevurderingSteg } from '../types';

import { AvsluttOgStartFortsettButtons } from './Sakintro';
import styles from './sakintro.module.less';

export const ÅpneRevurderinger = (props: { sak: Sak; åpneRevurderinger: Revurdering[]; intl: IntlShape }) => {
    if (props.åpneRevurderinger.length === 0) return null;

    return (
        <div className={styles.søknadsContainer}>
            <Heading level="2" size="medium" spacing>
                {props.intl.formatMessage({ id: 'revurdering.tittel' })}
            </Heading>
            <ol>
                {props.åpneRevurderinger.map((r) => {
                    const vedtakForBehandling = props.sak.vedtak.find((v) => v.behandlingId === r.id);
                    const underkjenteRevurderinger = r.attesteringer.filter((a) => a.underkjennelse !== null);
                    return (
                        <li key={r.id}>
                            <Panel border className={styles.søknad}>
                                <div className={styles.info}>
                                    <div>
                                        <div className={styles.tittel}>
                                            <Heading level="3" size="small" spacing>
                                                {props.intl.formatMessage({ id: 'revurdering.undertittel' })}
                                            </Heading>
                                            {erInformasjonsRevurdering(r) && erForhåndsvarselSendt(r) && (
                                                <Tag variant="info" className={styles.etikett}>
                                                    {props.intl.formatMessage({
                                                        id: 'revurdering.label.forhåndsvarselSendt',
                                                    })}
                                                </Tag>
                                            )}
                                        </div>
                                        {!erInformasjonsRevurdering(r) && (
                                            <div className={styles.informasjonsTekst}>
                                                <Label>{props.intl.formatMessage({ id: 'revurdering.type' })} </Label>
                                                <BodyShort>
                                                    {props.intl.formatMessage({
                                                        id: 'revurdering.type.stansGjenoppta.label',
                                                    })}
                                                </BodyShort>
                                            </div>
                                        )}
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
                                            erInformasjonsRevurdering(r) &&
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
                        </li>
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
            {erInformasjonsRevurdering(revurdering) &&
                erRevurderingTilAttestering(revurdering) &&
                (!user.isAttestant || user.navIdent === revurdering.saksbehandler) && (
                    <div className={styles.ikonContainer}>
                        <Ikon className={styles.ikon} kind="info-sirkel-fyll" width={'24px'} />
                        <BodyShort>
                            {props.intl.formatMessage({
                                id: 'attestering.tilAttestering',
                            })}
                        </BodyShort>
                    </div>
                )}

            {erInformasjonsRevurdering(revurdering) && erRevurderingIverksatt(revurdering) && vedtak && (
                <LinkAsButton
                    variant="secondary"
                    href={Routes.vedtaksoppsummering.createURL({ sakId: props.sakId, vedtakId: vedtak.id })}
                    size="small"
                >
                    {props.intl.formatMessage({ id: 'revurdering.seOppsummering' })}
                </LinkAsButton>
            )}

            <div className={styles.knapper}>
                {erInformasjonsRevurdering(revurdering) &&
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
                    <AvsluttOgStartFortsettButtons
                        sakId={props.sakId}
                        behandlingsId={revurdering.id}
                        primaryButtonTekst={
                            revurdering.status === RevurderingsStatus.IVERKSATT_STANS
                                ? props.intl.formatMessage({ id: 'revurdering.oppsummering' })
                                : props.intl.formatMessage({ id: 'revurdering.fortsett' })
                        }
                        usePrimaryAsLink={{
                            url: Routes.stansOppsummeringRoute.createURL({
                                sakId: props.sakId,
                                revurderingId: revurdering.id,
                            }),
                        }}
                        hideSecondaryButton={revurdering.status === RevurderingsStatus.IVERKSATT_STANS}
                        intl={props.intl}
                    />
                ) : erRevurderingGjenopptak(revurdering) ? (
                    <AvsluttOgStartFortsettButtons
                        sakId={props.sakId}
                        behandlingsId={revurdering.id}
                        primaryButtonTekst={
                            revurdering.status === RevurderingsStatus.IVERKSATT_GJENOPPTAK
                                ? props.intl.formatMessage({ id: 'revurdering.oppsummering' })
                                : props.intl.formatMessage({ id: 'revurdering.fortsett' })
                        }
                        usePrimaryAsLink={{
                            url: Routes.gjenopptaStansOppsummeringRoute.createURL({
                                sakId: props.sakId,
                                revurderingId: revurdering.id,
                            }),
                        }}
                        hideSecondaryButton={revurdering.status === RevurderingsStatus.IVERKSATT_GJENOPPTAK}
                        intl={props.intl}
                    />
                ) : (
                    erInformasjonsRevurdering(revurdering) &&
                    !erRevurderingTilAttestering(revurdering) &&
                    !erRevurderingIverksatt(revurdering) &&
                    user.navIdent !== pipe(revurdering.attesteringer, last, toNullable)?.attestant && (
                        <AvsluttOgStartFortsettButtons
                            sakId={props.sakId}
                            behandlingsId={revurdering.id}
                            primaryButtonTekst={props.intl.formatMessage({ id: 'revurdering.fortsett' })}
                            usePrimaryAsLink={{
                                url: Routes.revurderValgtRevurdering.createURL({
                                    sakId: props.sakId,
                                    steg: erRevurderingSimulert(revurdering)
                                        ? RevurderingSteg.Oppsummering
                                        : finnNesteRevurderingsteg(revurdering.informasjonSomRevurderes),
                                    revurderingId: revurdering.id,
                                }),
                            }}
                            hideSecondaryButton={false}
                            intl={props.intl}
                        />
                    )
                )}
            </div>
        </div>
    );
};

export const AvsluttedeRevurderinger = (props: { avsluttedeRevurderinger: Revurdering[]; intl: IntlShape }) => {
    if (props.avsluttedeRevurderinger.length === 0) return null;

    return (
        <div className={styles.søknadsContainer}>
            <Heading level="2" size="medium" spacing>
                {props.intl.formatMessage({
                    id: 'revurdering.avsluttede.tittel',
                })}
            </Heading>
            <ol>
                {props.avsluttedeRevurderinger.map((revurdering) => (
                    <li key={revurdering.id}>
                        <Panel border className={styles.søknad}>
                            <div className={styles.info}>
                                <div>
                                    <Heading level="3" size="small" spacing>
                                        {props.intl.formatMessage({ id: 'revurdering.undertittel' })}
                                    </Heading>
                                    <div className={styles.dato}>
                                        <Label>{props.intl.formatMessage({ id: 'revurdering.opprettet' })} </Label>
                                        <BodyShort>{props.intl.formatDate(revurdering.opprettet)}</BodyShort>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </li>
                ))}
            </ol>
        </div>
    );
};
