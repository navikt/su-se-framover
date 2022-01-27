import { BodyShort, Heading, Tag } from '@navikt/ds-react';
import { last } from 'fp-ts/lib/Array';
import { toNullable } from 'fp-ts/lib/Option';
import Ikon from 'nav-frontend-ikoner-assets';
import React from 'react';

import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import UnderkjenteAttesteringer from '~components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useUserContext } from '~context/userContext';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Klage, KlageStatus, Utfall } from '~types/Klage';
import { Vedtak } from '~types/Vedtak';
import { formatDate } from '~utils/date/dateUtils';
import {
    hentSisteVedtattUtfall,
    erKlageIverksattAvvist,
    erKlageOversendt,
    hentSisteVurderteSteg,
    erKlageFerdigbehandlet,
    erKlageTilAttestering,
} from '~utils/klage/klageUtils';

import Oversiktslinje, { Informasjonslinje } from './components/Oversiktslinje';
import messages from './sakintro-nb';
import styles from './sakintro.module.less';

const KlageLister = (props: { sakId: string; klager: Klage[]; vedtak: Vedtak[] }) => {
    const { formatMessage } = useI18n({ messages });
    const user = useUserContext();

    return (
        <div>
            <Oversiktslinje kategoriTekst={formatMessage('klage.klager')} entries={props.klager}>
                {{
                    oversiktsinformasjon: (klage) => {
                        const attesteringer = klage?.attesteringer ?? [];
                        const senesteAttestering = pipe(attesteringer, last, toNullable);
                        const sisteVedtattUtfall = hentSisteVedtattUtfall(klage.klagevedtakshistorikk);
                        return (
                            <>
                                <Heading level="3" size="small">
                                    {erKlageOversendt(klage)
                                        ? formatMessage('klage.oversendt')
                                        : erKlageIverksattAvvist(klage)
                                        ? formatMessage('klage.avvist')
                                        : formatMessage('klage.åpenKlage')}
                                </Heading>
                                <Informasjonslinje label="Opprettet" value={() => formatDate(klage.opprettet)} />
                                {senesteAttestering?.underkjennelse && (
                                    <UnderkjenteAttesteringer attesteringer={attesteringer} />
                                )}
                                {sisteVedtattUtfall && <UtfallTag utfall={sisteVedtattUtfall.utfall} />}
                            </>
                        );
                    },
                    knapper: (klage) => {
                        if (erKlageFerdigbehandlet(klage)) {
                            return (
                                <LinkAsButton
                                    variant="secondary"
                                    size="small"
                                    href={Routes.vedtaksoppsummering.createURL({
                                        sakId: props.sakId,
                                        vedtakId:
                                            klage.status === KlageStatus.OVERSENDT
                                                ? klage.id
                                                : props.vedtak.find((v) => v.behandlingId === klage.id)?.id ?? '',
                                    })}
                                >
                                    {formatMessage('klage.seOppsummering')}
                                </LinkAsButton>
                            );
                        }
                        if (erKlageTilAttestering(klage)) {
                            return user.isAttestant && user.navIdent !== klage.saksbehandler ? (
                                <LinkAsButton
                                    variant="secondary"
                                    size="small"
                                    href={Routes.attesterKlage.createURL({
                                        sakId: props.sakId,
                                        klageId: klage.id,
                                    })}
                                >
                                    {formatMessage('klage.attester')}
                                </LinkAsButton>
                            ) : (
                                <div className={styles.ikonContainer}>
                                    <Ikon className={styles.ikon} kind="info-sirkel-fyll" width={'24px'} />
                                    <BodyShort>{formatMessage('attestering.tilAttestering')}</BodyShort>
                                </div>
                            );
                        }

                        if (user.navIdent === pipe(klage.attesteringer, last, toNullable)?.attestant) {
                            return (
                                <div className={styles.ikonContainer}>
                                    <Ikon className={styles.ikon} kind="info-sirkel-fyll" width={'24px'} />
                                    <BodyShort>{formatMessage('attestering.sendtTilbakeTilBehandling')}</BodyShort>
                                </div>
                            );
                        }

                        return (
                            <LinkAsButton
                                variant="secondary"
                                size="small"
                                href={Routes.klage.createURL({
                                    sakId: props.sakId,
                                    klageId: klage.id,
                                    steg: hentSisteVurderteSteg(klage),
                                })}
                            >
                                {formatMessage('klage.fortsettBehandling')}
                            </LinkAsButton>
                        );
                    },
                }}
            </Oversiktslinje>
        </div>
    );
};

const UtfallTag = ({ utfall }: { utfall: Utfall }) => {
    switch (utfall) {
        case Utfall.AVVIST:
        case Utfall.TRUKKET:
        case Utfall.STADFESTELSE:
            return (
                <Tag className={styles.utfallTag} variant="info">
                    {utfall}
                </Tag>
            );

        case Utfall.OPPHEVET:
        case Utfall.MEDHOLD:
        case Utfall.DELVIS_MEDHOLD:
        case Utfall.RETUR:
        case Utfall.UGUNST:
            return (
                <Tag className={styles.utfallTag} variant="warning">
                    {utfall}
                </Tag>
            );
    }
};

export default KlageLister;
