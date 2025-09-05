import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Modal, Table } from '@navikt/ds-react';
import * as arr from 'fp-ts/Array';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import * as behandlingsApi from '~src/api/behandlingApi';
import * as reguleringApi from '~src/api/reguleringApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import SuTabell, { AriaSortVerdi } from '~src/components/tabell/SuTabell';
import {
    getDataCellInfo,
    isKlage,
    isManuellTilbakekrevingsbehandling,
    isRegulering,
    isRevurdering,
    isSøknadMedEllerUtenBehandling,
    SøknadMedEllerUtenBehandlinger,
    TabellBehandling,
    TabellBehandlinger,
} from '~src/components/tabell/SuTabellUtils';
import { useUserContext } from '~src/context/userContext';
import * as SøknadsbehandlingActions from '~src/features/SøknadsbehandlingActions';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Klage } from '~src/types/Klage';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';
import { Regulering, Reguleringstype } from '~src/types/Regulering';
import { Revurdering } from '~src/types/Revurdering';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { erKlageTilAttestering, hentSisteVurderteSteg } from '~src/utils/klage/klageUtils';
import {
    erTilbakekrevingTilAttestering,
    finnNesteTilbakekrevingsstegForSaksbehandling,
} from '~src/utils/ManuellTilbakekrevingsbehandlingUtils';
import {
    erInformasjonsRevurdering,
    erRevurderingGjenopptak,
    erRevurderingStans,
    erRevurderingTilAttestering,
    finnNesteRevurderingsteg,
} from '~src/utils/revurdering/revurderingUtils';
import {
    erSøknadsbehandlingTilAttestering,
    hentSisteVurdertSaksbehandlingssteg,
    kanNavigeresTilOppsummering,
} from '~src/utils/SøknadsbehandlingUtils';

import messages from '../sakintro-nb';

import styles from './ÅpneBehandlingerTabell.module.less';

enum ÅpneBehandlingerKolonner {
    behandlingstype = 'behandlingstype',
    status = 'status',
    resultat = 'resultat',
    periode = 'periode',
    mottatt_opprettet_tidspunkt = 'mottatt_opprettet_tidspunkt',
}

const ÅpneBehandlingerTabell = (props: { sakId: string; tabellBehandlinger: TabellBehandlinger }) => {
    const { formatMessage } = useI18n({ messages });

    const sorterTabell = (
        behandlinger: TabellBehandlinger,
        kolonne: ÅpneBehandlingerKolonner,
        sortVerdi: AriaSortVerdi,
    ) => {
        return pipe(behandlinger, arr.sortBy([kolonneOgRetning(kolonne, sortVerdi)]));

        function kolonneOgRetning(
            kolonne: ÅpneBehandlingerKolonner,
            sortVerdi: AriaSortVerdi,
        ): Ord.Ord<TabellBehandling> {
            return pipe(
                sortVerdi === 'ascending' ? Ord.reverse(S.Ord) : S.Ord,
                Ord.contramap((b: TabellBehandling) => {
                    const dataCellInfo = getDataCellInfo(b);
                    switch (kolonne) {
                        case ÅpneBehandlingerKolonner.behandlingstype:
                            return dataCellInfo.type;
                        case ÅpneBehandlingerKolonner.status:
                            return dataCellInfo.status;
                        case ÅpneBehandlingerKolonner.resultat:
                            return dataCellInfo.resultat;
                        case ÅpneBehandlingerKolonner.periode:
                            return dataCellInfo.periode;
                        case ÅpneBehandlingerKolonner.mottatt_opprettet_tidspunkt:
                            return dataCellInfo.mottattOpprettetTidspunkt;
                    }
                }),
            );
        }
    };

    const DataCellButtons = (props: { sakId: string; b: TabellBehandling }) => {
        return (
            <div>
                {isSøknadMedEllerUtenBehandling(props.b) && (
                    <SøknadOgSøknadsbehandlingKnapper
                        sakId={props.sakId}
                        b={{
                            søknad: props.b.søknad,
                            søknadsbehandling: props.b.søknadsbehandling,
                        }}
                    />
                )}
                {isRevurdering(props.b) && <RevurderingKnapper sakId={props.sakId} r={props.b} />}
                {isKlage(props.b) && <KlageKnapper sakId={props.sakId} k={props.b} />}
                {isRegulering(props.b) && <ReguleringKnapper sakId={props.sakId} r={props.b} />}
                {isManuellTilbakekrevingsbehandling(props.b) && (
                    <TilbakekrevingsKnapper sakId={props.sakId} t={props.b} />
                )}
            </div>
        );
    };

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Task}
            farge={Oppsummeringsfarge.Blå}
            tittel={formatMessage('åpneBehandlinger.table.tittel')}
        >
            <SuTabell
                kolonnerConfig={{
                    kolonner: ÅpneBehandlingerKolonner,
                    defaultKolonneSorteresEtter: ÅpneBehandlingerKolonner.mottatt_opprettet_tidspunkt,
                }}
                tableHeader={() => (
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader sortable sortKey={ÅpneBehandlingerKolonner.behandlingstype}>
                                {formatMessage('header.behandlingstype')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortable sortKey={ÅpneBehandlingerKolonner.status}>
                                {formatMessage('header.status')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortable sortKey={ÅpneBehandlingerKolonner.periode}>
                                {formatMessage('header.periode')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortable sortKey={ÅpneBehandlingerKolonner.resultat}>
                                {formatMessage('header.resultat')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortable sortKey={ÅpneBehandlingerKolonner.mottatt_opprettet_tidspunkt}>
                                {formatMessage('header.mottatOpprettetTidspunkt')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader></Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                )}
                tableBody={(sortertKolonne, sortVerdi) => (
                    <Table.Body>
                        {sorterTabell(props.tabellBehandlinger, sortertKolonne, sortVerdi).map((behandling) => {
                            const dataCellInfo = getDataCellInfo(behandling);
                            return (
                                <Table.Row
                                    key={
                                        isSøknadMedEllerUtenBehandling(behandling)
                                            ? `åpenBehandling.${behandling.søknad.id}`
                                            : `åpenBehandling.${behandling.id}`
                                    }
                                >
                                    <Table.DataCell>
                                        {formatMessage(`datacell.behandlingstype.${dataCellInfo.type}`)}
                                        {dataCellInfo.erOmgjøring &&
                                            ` ${formatMessage('datacell.behandlingstype.omgjøring')}`}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {formatMessage(`datacell.status.${dataCellInfo.status}`)}
                                    </Table.DataCell>
                                    <Table.DataCell>{dataCellInfo.periode}</Table.DataCell>
                                    <Table.DataCell>
                                        {formatMessage(`datacell.resultat.${dataCellInfo.resultat}`)}
                                    </Table.DataCell>
                                    <Table.DataCell>{dataCellInfo.mottattOpprettetTidspunkt}</Table.DataCell>
                                    <Table.DataCell>
                                        <DataCellButtons sakId={props.sakId} b={behandling} />
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

export default ÅpneBehandlingerTabell;

const SøknadOgSøknadsbehandlingKnapper = (props: { sakId: string; b: SøknadMedEllerUtenBehandlinger }) => {
    const user = useUserContext();
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [behandlingStatus, startBehandling] = useAsyncActionCreator(SøknadsbehandlingActions.startBehandling);
    const ref = useRef<HTMLDialogElement>(null);
    const [returStatus, retur] = useApiCall(behandlingsApi.returSak);
    const søknadsbehandling = props.b?.søknadsbehandling;

    if (props.b.søknadsbehandling && erSøknadsbehandlingTilAttestering(props.b.søknadsbehandling)) {
        if (user.isAttestant && user.navIdent !== props.b.søknadsbehandling.saksbehandler) {
            return (
                <LinkAsButton
                    className={styles.dataCellLink}
                    variant="secondary"
                    size="small"
                    href={Routes.attestering.createURL({
                        sakId: props.sakId,
                        behandlingId: props.b.søknadsbehandling.id,
                    })}
                >
                    {formatMessage('attestering.attester')}
                </LinkAsButton>
            );
        }
        if (user.navIdent === props.b.søknadsbehandling.saksbehandler)
            return (
                <div>
                    <Button variant="secondary" size="small" onClick={() => ref.current?.showModal()}>
                        {formatMessage('link.retur')}
                    </Button>

                    <Modal
                        ref={ref}
                        header={{ heading: formatMessage('dataCell.info.knapp.attestering.modal.tittel') }}
                    >
                        <Modal.Body>
                            {RemoteData.isFailure(returStatus) && <ApiErrorAlert error={returStatus.error} />}
                        </Modal.Body>
                        <Modal.Footer className={styles.knapper}>
                            <Button variant="secondary" size="small" onClick={() => ref.current?.close()}>
                                {formatMessage('datacell.info.knapp.avbryt')}
                            </Button>
                            {søknadsbehandling && (
                                <Button
                                    variant="primary"
                                    type="button"
                                    onClick={() =>
                                        retur({ sakId: props.sakId, behandlingId: søknadsbehandling.id }, () => {
                                            ref.current?.close();
                                            location.reload();
                                        })
                                    }
                                >
                                    {formatMessage('datacell.info.knapp.ReturnerSak')}
                                </Button>
                            )}
                        </Modal.Footer>
                    </Modal>
                </div>
            );
        return <></>;
    }
    return (
        <>
            <div className={styles.dataCellButtonsContainer}>
                <LinkAsButton
                    variant="secondary"
                    size="small"
                    href={Routes.avsluttBehandling.createURL({
                        sakId: props.sakId,
                        id: props.b?.søknadsbehandling?.id ?? props.b.søknad.id,
                    })}
                >
                    {formatMessage('datacell.info.knapp.avsluttBehandling')}
                </LinkAsButton>
                {!props.b.søknadsbehandling && (
                    <Button
                        size="small"
                        loading={RemoteData.isPending(behandlingStatus)}
                        onClick={() =>
                            startBehandling({ sakId: props.sakId, søknadId: props.b.søknad.id }, (response) => {
                                navigate(
                                    Routes.saksbehandlingVilkårsvurdering.createURL({
                                        vilkar: Vilkårtype.Virkningstidspunkt,
                                        sakId: props.sakId,
                                        behandlingId: response.id,
                                    }),
                                );
                            })
                        }
                    >
                        {formatMessage('datacell.info.knapp.startBehandling')}
                    </Button>
                )}
                {props.b.søknadsbehandling && (
                    <LinkAsButton
                        variant="primary"
                        size="small"
                        href={
                            kanNavigeresTilOppsummering(props.b.søknadsbehandling)
                                ? Routes.saksbehandlingsOppsummering.createURL({
                                      sakId: props.sakId,
                                      behandlingId: props.b.søknadsbehandling.id,
                                  })
                                : Routes.saksbehandlingVilkårsvurdering.createURL({
                                      sakId: props.sakId,
                                      behandlingId: props.b.søknadsbehandling.id,
                                      vilkar: hentSisteVurdertSaksbehandlingssteg(props.b.søknadsbehandling),
                                  })
                        }
                    >
                        {formatMessage('datacell.info.knapp.fortsettBehandling')}
                    </LinkAsButton>
                )}
            </div>
            {RemoteData.isFailure(behandlingStatus) && <ApiErrorAlert error={behandlingStatus.error} />}
        </>
    );
};

const KlageKnapper = (props: { sakId: string; k: Klage }) => {
    const user = useUserContext();
    const { formatMessage } = useI18n({ messages });

    if (erKlageTilAttestering(props.k)) {
        if (user.isAttestant && user.navIdent !== props.k.saksbehandler) {
            return (
                <LinkAsButton
                    variant="secondary"
                    size="small"
                    href={Routes.attestering.createURL({
                        sakId: props.sakId,
                        behandlingId: props.k.id,
                    })}
                >
                    {formatMessage('attestering.attester')}
                </LinkAsButton>
            );
        }
        return <></>;
    }

    return (
        <div className={styles.dataCellButtonsContainer}>
            <LinkAsButton
                variant="secondary"
                size="small"
                href={Routes.avsluttBehandling.createURL({
                    sakId: props.sakId,
                    id: props.k.id,
                })}
            >
                {formatMessage('datacell.info.knapp.avsluttBehandling')}
            </LinkAsButton>
            <LinkAsButton
                variant="primary"
                size="small"
                href={Routes.klage.createURL({
                    sakId: props.sakId,
                    klageId: props.k.id,
                    steg: hentSisteVurderteSteg(props.k),
                })}
            >
                {formatMessage('datacell.info.knapp.fortsettBehandling')}
            </LinkAsButton>
        </div>
    );
};

const RevurderingKnapper = (props: { sakId: string; r: Revurdering }) => {
    const user = useUserContext();
    const { formatMessage } = useI18n({ messages });

    if (erRevurderingTilAttestering(props.r)) {
        if (user.isAttestant && user.navIdent !== props.r.saksbehandler) {
            return (
                <LinkAsButton
                    variant="secondary"
                    size="small"
                    href={Routes.attestering.createURL({
                        sakId: props.sakId,
                        behandlingId: props.r.id,
                    })}
                >
                    {formatMessage('attestering.attester')}
                </LinkAsButton>
            );
        }
        return <></>;
    }

    return (
        <div className={styles.dataCellButtonsContainer}>
            <LinkAsButton
                variant="secondary"
                size="small"
                href={Routes.avsluttBehandling.createURL({
                    sakId: props.sakId,
                    id: props.r.id,
                })}
            >
                {formatMessage('datacell.info.knapp.avsluttBehandling')}
            </LinkAsButton>
            {erInformasjonsRevurdering(props.r) && (
                <LinkAsButton
                    variant="primary"
                    size="small"
                    href={Routes.revurderingSeksjonSteg.createURL({
                        sakId: props.sakId,
                        seksjon: finnNesteRevurderingsteg(props.r).seksjon,
                        steg: finnNesteRevurderingsteg(props.r).steg,
                        revurderingId: props.r.id,
                    })}
                >
                    {formatMessage('datacell.info.knapp.fortsettBehandling')}
                </LinkAsButton>
            )}
            {erRevurderingStans(props.r) && (
                <LinkAsButton
                    variant="primary"
                    size="small"
                    href={Routes.stansOppsummeringRoute.createURL({
                        sakId: props.sakId,
                        revurderingId: props.r.id,
                    })}
                >
                    {formatMessage('datacell.info.knapp.fortsettBehandling')}
                </LinkAsButton>
            )}
            {erRevurderingGjenopptak(props.r) && (
                <LinkAsButton
                    variant="primary"
                    size="small"
                    href={Routes.gjenopptaOppsummeringRoute.createURL({
                        sakId: props.sakId,
                        revurderingId: props.r.id,
                    })}
                >
                    {formatMessage('datacell.info.knapp.fortsettBehandling')}
                </LinkAsButton>
            )}
        </div>
    );
};

const ReguleringKnapper = (props: { sakId: string; r: Regulering }) => {
    const { formatMessage } = useI18n({ messages });
    const [avsluttReguleringStatus, avsluttRegulering] = useApiCall(reguleringApi.avsluttRegulering);
    const ref = useRef<HTMLDialogElement>(null);

    return (
        <div>
            {props.r.reguleringstype === Reguleringstype.MANUELL && (
                <div className={styles.dataCellButtonsContainer}>
                    <Button variant="secondary" size="small" onClick={() => ref.current?.showModal()}>
                        {formatMessage('datacell.info.knapp.avsluttBehandling')}
                    </Button>
                    <LinkAsButton
                        variant="primary"
                        size="small"
                        href={Routes.manuellRegulering.createURL({
                            sakId: props.sakId,
                            reguleringId: props.r.id,
                        })}
                    >
                        {formatMessage('datacell.info.knapp.regulering.start')}
                    </LinkAsButton>
                </div>
            )}

            <Modal ref={ref} header={{ heading: formatMessage('dataCell.info.knapp.regulering.modal.tittel') }}>
                <Modal.Body>
                    {RemoteData.isFailure(avsluttReguleringStatus) && (
                        <ApiErrorAlert error={avsluttReguleringStatus.error} />
                    )}
                </Modal.Body>
                <Modal.Footer className={styles.knapper}>
                    <Button variant="tertiary" type="button" onClick={() => ref.current?.close()}>
                        {formatMessage('datacell.info.knapp.avbryt')}
                    </Button>
                    <Button
                        variant="danger"
                        type="button"
                        loading={RemoteData.isPending(avsluttReguleringStatus)}
                        onClick={() => avsluttRegulering({ reguleringId: props.r.id }, () => location.reload())}
                    >
                        {formatMessage('datacell.info.knapp.avsluttBehandling')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const TilbakekrevingsKnapper = (props: { sakId: string; t: ManuellTilbakekrevingsbehandling }) => {
    const user = useUserContext();
    const { formatMessage } = useI18n({ messages });

    if (erTilbakekrevingTilAttestering(props.t)) {
        if (user.isAttestant && user.navIdent !== props.t.sendtTilAttesteringAv) {
            return (
                <LinkAsButton
                    variant="secondary"
                    size="small"
                    href={Routes.attestering.createURL({
                        sakId: props.sakId,
                        behandlingId: props.t.id,
                    })}
                >
                    {formatMessage('attestering.attester')}
                </LinkAsButton>
            );
        }
        return <></>;
    }

    return (
        <div className={styles.dataCellButtonsContainer}>
            <LinkAsButton
                variant="secondary"
                size="small"
                href={Routes.avsluttBehandling.createURL({
                    sakId: props.sakId,
                    id: props.t.id,
                })}
            >
                {formatMessage('datacell.info.knapp.avsluttBehandling')}
            </LinkAsButton>

            <LinkAsButton variant="primary" size="small" href={finnNesteTilbakekrevingsstegForSaksbehandling(props.t)}>
                {formatMessage('datacell.info.knapp.fortsettBehandling')}
            </LinkAsButton>
        </div>
    );
};
