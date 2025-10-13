import * as RemoteData from '@devexperts/remote-data-ts';
import { EnvelopeClosedIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Table } from '@navikt/ds-react';
import * as arr from 'fp-ts/Array';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import * as VedtakActions from 'src/features/VedtakActions';
import * as DokumentApi from '~src/api/dokumentApi';
import { forhåndsvisVedtaksbrevTilbakekrevingsbehandling } from '~src/api/tilbakekrevingApi';
import { useApiErrorMessages } from '~src/components/apiErrorAlert/ApiErrorAlert';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import SuTabell, { AriaSortVerdi } from '~src/components/tabell/SuTabell';
import { createToast, ToastType, useToast } from '~src/components/toast/Toast';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { OmgjøringModal, Omgjøringsfom } from '~src/pages/saksbehandling/sakintro/Vedtakstabell/OmgjøringModal.tsx';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import { Klage, KlageStatus } from '~src/types/Klage';
import { erOmgjøring, Revurdering } from '~src/types/Revurdering.ts';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling.ts';
import { Vedtak, VedtakType, VedtakTypeMedOmgjøring } from '~src/types/Vedtak';
import { formatDateTime } from '~src/utils/date/dateUtils';
import { getBlob } from '~src/utils/dokumentUtils';
import { formatPeriode } from '~src/utils/periode/periodeUtils';
import {
    erDokumentGenerertEllerSenere,
    erDokumentIkkeGenerertEnda,
    skalDokumentIkkeGenereres,
} from '~src/utils/VedtakUtils';

import messages from '../sakintro-nb';

import styles from './Vedtakstabell.module.less';

enum VedtakstabellKolonner {
    vedtakstype = 'vedtakstype',
    resultat = 'resultat',
    periode = 'periode',
    iverksatt_tidspunkt = 'iverksatt-tidspunkt',
}

type VedtakEllerOversendtKlage = Vedtak | Klage;
type VedtakOgOversendteKlager = Array<Vedtak | Klage>;

const isOversendtKlage = (v: Vedtak | Klage): v is Klage => !('periode' in v);
const isVedtak = (v: VedtakEllerOversendtKlage): v is Vedtak => 'periode' in v;

const Vedtakstabell = (props: {
    sakId: string;
    vedtakOgOversendteKlager: VedtakOgOversendteKlager;
    behandlinger: Søknadsbehandling[];
    revurderinger: Revurdering[];
    klager: Klage[];
}) => {
    const { insert } = useToast();
    const apiErrorMessages = useApiErrorMessages();
    const { formatMessage } = useI18n({ messages });
    const [åpenModal, setÅpenModal] = useState<boolean>(false);

    const sorterTabell = (
        vedtak: VedtakOgOversendteKlager,
        kolonne: VedtakstabellKolonner,
        sortVerdi: AriaSortVerdi,
    ) => {
        return pipe(vedtak, arr.sortBy([kolonneOgRetning(kolonne, sortVerdi)]));

        function kolonneOgRetning(
            kolonne: VedtakstabellKolonner,
            sortVerdi: AriaSortVerdi,
        ): Ord.Ord<VedtakEllerOversendtKlage> {
            return pipe(
                sortVerdi === 'ascending' ? Ord.reverse(S.Ord) : S.Ord,
                Ord.contramap((v: VedtakEllerOversendtKlage) => {
                    switch (kolonne) {
                        case VedtakstabellKolonner.iverksatt_tidspunkt:
                            return v.opprettet;
                        case VedtakstabellKolonner.periode:
                            return isOversendtKlage(v) ? '-' : `${v?.periode?.fraOgMed} - ${v?.periode?.tilOgMed}`;
                        case VedtakstabellKolonner.resultat:
                            return isOversendtKlage(v)
                                ? formatMessage(`datacell.vedtakstype.${v.status as KlageStatus.OVERSENDT}`)
                                : formatMessage(`datacell.vedtakstype.${v.type}`);
                        case VedtakstabellKolonner.vedtakstype:
                            return isOversendtKlage(v)
                                ? formatMessage(`datacell.vedtakstype.${v.status as KlageStatus.OVERSENDT}`)
                                : formatMessage(`datacell.vedtakstype.${v.type}`);
                    }
                }),
            );
        }
    };

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Liste}
            farge={Oppsummeringsfarge.Grønn}
            tittel={formatMessage('vedtak.table.tittel')}
        >
            <SuTabell
                kolonnerConfig={{
                    kolonner: VedtakstabellKolonner,
                    defaultKolonneSorteresEtter: VedtakstabellKolonner.iverksatt_tidspunkt,
                }}
                tableHeader={() => (
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader sortable sortKey={VedtakstabellKolonner.vedtakstype}>
                                {formatMessage('header.vedtakstype')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortable sortKey={VedtakstabellKolonner.resultat}>
                                {formatMessage('header.resultat')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortable sortKey={VedtakstabellKolonner.periode}>
                                {formatMessage('header.periode')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortable sortKey={VedtakstabellKolonner.iverksatt_tidspunkt}>
                                {formatMessage('header.iverksattidspunkt')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader></Table.ColumnHeader>
                            <Table.ColumnHeader></Table.ColumnHeader>
                            <Table.ColumnHeader></Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                )}
                tableBody={(sortertKolonne, sortVerdi) => (
                    <Table.Body>
                        {sorterTabell(props.vedtakOgOversendteKlager, sortertKolonne, sortVerdi).map((vedtak) => {
                            const [hentDokumenterStatus, hentDokumenter] = useApiCall(DokumentApi.hentDokumenter);
                            //brevet for vedtak på tilbakekreving ligger ikke som et dokument i basen på samme måte som andre vedtak.
                            //og kan derfor ikke hentes gjennom hentDokumenter
                            const [tilbakekrevingsbrevStatus, hentTilbakekrevingsbrev] = useApiCall(
                                forhåndsvisVedtaksbrevTilbakekrevingsbehandling,
                            );
                            const [startNysøknadsbehandlingStatus, startNySøknadsbehandling] = useAsyncActionCreator(
                                VedtakActions.startNySøknadsbehandling,
                            );

                            //pakker hver status inn i egen useEffect, så flere feil ikke blir vist samtidig i toasts
                            useEffect(() => {
                                if (RemoteData.isFailure(startNysøknadsbehandlingStatus)) {
                                    insert(
                                        createToast({
                                            type: ToastType.ERROR,
                                            duration: 5000,
                                            message: apiErrorMessages(startNysøknadsbehandlingStatus.error),
                                        }),
                                    );
                                }
                            }, [startNysøknadsbehandlingStatus]);

                            useEffect(() => {
                                if (RemoteData.isFailure(tilbakekrevingsbrevStatus)) {
                                    insert(
                                        createToast({
                                            type: ToastType.ERROR,
                                            duration: 5000,
                                            message: apiErrorMessages(tilbakekrevingsbrevStatus.error),
                                        }),
                                    );
                                }
                            }, [tilbakekrevingsbrevStatus]);

                            useEffect(() => {
                                if (RemoteData.isFailure(hentDokumenterStatus)) {
                                    insert(
                                        createToast({
                                            type: ToastType.ERROR,
                                            duration: 5000,
                                            message: apiErrorMessages(hentDokumenterStatus.error),
                                        }),
                                    );
                                }
                            }, [hentDokumenterStatus]);

                            const hentVedtakstype = (vedtak: Vedtak): VedtakType | VedtakTypeMedOmgjøring => {
                                if (vedtak.type === VedtakType.ENDRING) {
                                    const revurdering = props.revurderinger.find((r) => r.id === vedtak.behandlingId);
                                    if (revurdering) {
                                        if (erOmgjøring(revurdering.årsak)) {
                                            return VedtakTypeMedOmgjøring.REVURDERING_OMGJØRING;
                                        } else {
                                            return vedtak.type;
                                        }
                                    } else {
                                        return vedtak.type;
                                    }
                                }
                                if (vedtak.type === VedtakType.SØKNAD) {
                                    const behandling = props.behandlinger.find((b) => b.id === vedtak.behandlingId);
                                    if (behandling) {
                                        if (behandling.omgjøringsårsak) {
                                            return VedtakTypeMedOmgjøring.SØKNAD_OMGJØRING;
                                        } else {
                                            return vedtak.type;
                                        }
                                    } else {
                                        return vedtak.type;
                                    }
                                }
                                return vedtak.type;
                            };

                            return (
                                <Table.Row key={vedtak.id}>
                                    <Table.DataCell>
                                        {isOversendtKlage(vedtak)
                                            ? formatMessage(
                                                  `datacell.vedtakstype.${vedtak.status as KlageStatus.OVERSENDT}`,
                                              )
                                            : formatMessage(`datacell.vedtakstype.${hentVedtakstype(vedtak)}`)}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {isOversendtKlage(vedtak)
                                            ? formatMessage(
                                                  `datacell.resultat.${vedtak.status as KlageStatus.OVERSENDT}`,
                                              )
                                            : formatMessage(`datacell.resultat.${vedtak.type}`)}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {'periode' in vedtak && vedtak.periode ? formatPeriode(vedtak.periode) : '-'}
                                    </Table.DataCell>
                                    <Table.DataCell>{formatDateTime(vedtak.opprettet)}</Table.DataCell>
                                    <Table.DataCell>
                                        <Link
                                            to={Routes.vedtakEllerKlageOppsummering.createURL({
                                                sakId: props.sakId,
                                                vedtakEllerKlageId: vedtak.id,
                                            })}
                                        >
                                            {formatMessage('dataCell.seOppsummering')}
                                        </Link>
                                    </Table.DataCell>
                                    <Table.DataCell className={styles.vedtaksbrevDataCell}>
                                        {!isOversendtKlage(vedtak) && skalDokumentIkkeGenereres(vedtak) && (
                                            <BodyShort>{formatMessage('datacell.brev.skalIkkeGenerere')}</BodyShort>
                                        )}
                                        {!isOversendtKlage(vedtak) && erDokumentIkkeGenerertEnda(vedtak) && (
                                            <BodyShort>{formatMessage('datacell.brev.ikkeGenerert')}</BodyShort>
                                        )}

                                        {(isOversendtKlage(vedtak) || erDokumentGenerertEllerSenere(vedtak)) && (
                                            <Button
                                                className={styles.seBrevButton}
                                                variant="secondary"
                                                size={'small'}
                                                loading={
                                                    RemoteData.isPending(hentDokumenterStatus) ||
                                                    RemoteData.isPending(tilbakekrevingsbrevStatus)
                                                }
                                                onClick={() => {
                                                    if (isVedtak(vedtak) && vedtak.type === VedtakType.TILBAKEKREVING) {
                                                        hentTilbakekrevingsbrev(
                                                            {
                                                                sakId: props.sakId,
                                                                behandlingId: vedtak.behandlingId,
                                                            },
                                                            (res) => window.open(URL.createObjectURL(res)),
                                                        );
                                                    } else {
                                                        hentDokumenter(
                                                            {
                                                                id: vedtak.id,
                                                                idType: isOversendtKlage(vedtak)
                                                                    ? DokumentIdType.Klage
                                                                    : DokumentIdType.Vedtak,
                                                            },
                                                            (dokumenter) =>
                                                                window.open(
                                                                    URL.createObjectURL(getBlob(dokumenter[0])),
                                                                ),
                                                        );
                                                    }
                                                }}
                                            >
                                                <EnvelopeClosedIcon />
                                            </Button>
                                        )}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {isVedtak(vedtak) && vedtak.kanStarteNyBehandling && (
                                            <>
                                                <Button
                                                    size="small"
                                                    variant="tertiary"
                                                    onClick={() => setÅpenModal(true)}
                                                >
                                                    {formatMessage('dataCell.startNyBehandling')}
                                                </Button>
                                                <OmgjøringModal
                                                    klager={props.klager}
                                                    åpenModal={åpenModal}
                                                    setÅpenModal={(åpen: boolean) => setÅpenModal(åpen)}
                                                    startNysøknadsbehandlingStatus={startNysøknadsbehandlingStatus}
                                                    startNyBehandling={(form: Omgjøringsfom) =>
                                                        startNySøknadsbehandling({
                                                            sakId: props.sakId,
                                                            vedtakId: vedtak.id,
                                                            body: form,
                                                        })
                                                    }
                                                />
                                            </>
                                        )}
                                    </Table.DataCell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                )}
            />
        </Oppsummeringspanel>
    );
};

export default Vedtakstabell;
