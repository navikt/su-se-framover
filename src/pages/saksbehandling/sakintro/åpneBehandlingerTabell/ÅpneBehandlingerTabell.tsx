import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Heading, Modal, Table } from '@navikt/ds-react';
import * as arr from 'fp-ts/Array';
import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as reguleringApi from '~src/api/reguleringApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummeringspanel/Oppsummeringspanel';
import SuTabell, { AriaSortVerdi } from '~src/components/tabell/SuTabell';
import {
    getDataCellInfo,
    isKlage,
    isRegulering,
    isRevurdering,
    isSøknadMedEllerUtenBehandling,
    SøknadMedEllerUtenBehandling,
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
import { Regulering, Reguleringstype } from '~src/types/Regulering';
import { Revurdering } from '~src/types/Revurdering';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { formatDateTime } from '~src/utils/date/dateUtils';
import { erKlageTilAttestering, hentSisteVurderteSteg } from '~src/utils/klage/klageUtils';
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
    mottatt_opprettet_tidspunkt = 'mottatt_opprettet_tidspunkt',
}

const ÅpneBehandlingerTabell = (props: { sakId: string; tabellBehandlinger: TabellBehandlinger }) => {
    const { formatMessage } = useI18n({ messages });

    const sorterTabell = (
        behandlinger: TabellBehandlinger,
        kolonne: ÅpneBehandlingerKolonner,
        sortVerdi: AriaSortVerdi
    ) => {
        return pipe(behandlinger, arr.sortBy([kolonneOgRetning(kolonne, sortVerdi)]));

        function kolonneOgRetning(
            kolonne: ÅpneBehandlingerKolonner,
            sortVerdi: AriaSortVerdi
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
                        case ÅpneBehandlingerKolonner.mottatt_opprettet_tidspunkt:
                            return dataCellInfo.mottattOpprettetTidspunkt;
                    }
                })
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
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {formatMessage(`datacell.status.${dataCellInfo.status}`)}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {formatMessage(`datacell.resultat.${dataCellInfo.resultat}`)}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {formatDateTime(dataCellInfo.mottattOpprettetTidspunkt)}
                                    </Table.DataCell>
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

const SøknadOgSøknadsbehandlingKnapper = (props: { sakId: string; b: SøknadMedEllerUtenBehandling }) => {
    const user = useUserContext();
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [behandlingStatus, startBehandling] = useAsyncActionCreator(SøknadsbehandlingActions.startBehandling);

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
                                    })
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
    const [avsluttModal, setAvsluttModal] = useState(false);
    const [avsluttReguleringStatus, avsluttRegulering] = useApiCall(reguleringApi.avsluttRegulering);

    return (
        <div>
            {props.r.reguleringstype === Reguleringstype.MANUELL && (
                <div className={styles.dataCellButtonsContainer}>
                    <Button variant="secondary" size="small" onClick={() => setAvsluttModal(true)}>
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
            <Modal open={avsluttModal} onClose={() => setAvsluttModal(false)}>
                <Modal.Content>
                    <div className={styles.avsluttReguleringModal}>
                        <Heading level="2" size="medium">
                            {formatMessage('dataCell.info.knapp.regulering.modal.tittel')}
                        </Heading>
                        {RemoteData.isFailure(avsluttReguleringStatus) && (
                            <ApiErrorAlert error={avsluttReguleringStatus.error} />
                        )}
                        <div className={styles.knapper}>
                            <Button variant="tertiary" type="button" onClick={() => setAvsluttModal(false)}>
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
                        </div>
                    </div>
                </Modal.Content>
            </Modal>
        </div>
    );
};
