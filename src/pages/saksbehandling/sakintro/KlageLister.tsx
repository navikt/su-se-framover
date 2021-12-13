import { BodyShort, Heading } from '@navikt/ds-react';
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
import { Klage } from '~types/Klage';
import { formatDate } from '~utils/date/dateUtils';
import { erKlageOversendt, erKlageTilAttestering, hentSisteVurderteSteg } from '~utils/klage/klageUtils';

import Oversiktslinje, { Informasjonslinje } from './components/Oversiktslinje';
import messages from './sakintro-nb';
import styles from './sakintro.module.less';

const KlageLister = (props: { sakId: string; klager: Klage[] }) => {
    const { formatMessage } = useI18n({ messages });
    const user = useUserContext();

    return (
        <div>
            <Oversiktslinje kategoriTekst={formatMessage('klage.klager')} entries={props.klager}>
                {{
                    oversiktsinformasjon: (klage) => {
                        const attesteringer = klage?.attesteringer ?? [];
                        const senesteAttestering = pipe(attesteringer, last, toNullable);
                        return (
                            <>
                                <Heading level="3" size="small">
                                    {erKlageOversendt(klage)
                                        ? formatMessage('klage.oversendt')
                                        : formatMessage('klage.åpenKlage')}
                                </Heading>
                                <Informasjonslinje label="Opprettet" value={() => formatDate(klage.opprettet)} />
                                {senesteAttestering?.underkjennelse && (
                                    <UnderkjenteAttesteringer attesteringer={attesteringer} />
                                )}
                            </>
                        );
                    },
                    knapper: (klage) => {
                        if (erKlageOversendt(klage)) {
                            return <></>;
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

export default KlageLister;
