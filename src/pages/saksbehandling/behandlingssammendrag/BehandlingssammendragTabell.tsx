import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, HStack, Pagination, Table } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import ContextMenu from '~src/components/contextMenu/ContextMenu';
import { ContextMenuVariables } from '~src/components/contextMenu/ContextMenuUtils';
import SuTabell from '~src/components/tabell/SuTabell';
import * as personSlice from '~src/features/person/person.slice';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { useAppDispatch } from '~src/redux/Store';
import { BehandlingssammendragMedId } from '~src/types/Behandlingssammendrag';
import { Sak } from '~src/types/Sak';
import { formatDateTime } from '~src/utils/date/dateUtils';
import { formatPeriode } from '~src/utils/periode/periodeUtils';

import messages from './Behandlingssammendrag-nb';
import styles from './Behandlingssammendrag.module.less';
import { BehandlingssammendragKolonne, sortTabell } from './BehandlingssammendragUtils';

const pagineringslisteverdier = [10, 20, 30, 40, 50];
const BehandlingssammendragTabell = (props: { tabelldata: BehandlingssammendragMedId[] }) => {
    const { formatMessage } = useI18n({ messages });
    const { Menu, contextMenuVariables, setContextMenuVariables } = ContextMenu();

    const [oppgaverPerSide, setOppgaverPerSide] = useState<number>(10);
    const [side, setSide] = useState<number>(1);
    const antallSider = Math.ceil(props.tabelldata.length / oppgaverPerSide);
    let paginerteOppgaver = props.tabelldata;

    useEffect(() => {
        if (antallSider < side || paginerteOppgaver.length === 0) {
            setSide(1);
        }
    }, [antallSider]);
    if (props.tabelldata.length === 0) {
        return (
            <Alert variant="info" className={styles.ingenResultater}>
                {formatMessage('behandlingssammendrag.ingenBehandlinger')}
            </Alert>
        );
    }

    return (
        <div>
            <HStack gap="4" justify="center" align="center">
                <Pagination page={side} onPageChange={setSide} count={antallSider} size="small" />
                <select
                    value={oppgaverPerSide}
                    onChange={(e) => {
                        const antallOppgaverPerSide = Number(e.target.value);
                        setOppgaverPerSide(antallOppgaverPerSide);
                    }}
                    title="Antall oppgaver som vises"
                >
                    {pagineringslisteverdier.map((rowsPerPage) => (
                        <option key={rowsPerPage} value={rowsPerPage}>
                            Vis {rowsPerPage} oppgaver
                        </option>
                    ))}
                </select>
            </HStack>
            <SuTabell
                kolonnerConfig={{
                    kolonner: BehandlingssammendragKolonne,
                    defaultKolonneSorteresEtter: BehandlingssammendragKolonne.behandlingStartet,
                }}
                tableHeader={() => (
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader sortKey="sakType" sortable>
                                {formatMessage('sak.saktype')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortKey="saksnummer" sortable>
                                {formatMessage('sak.saksnummer')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortKey="typeBehandling" sortable>
                                {formatMessage('behandlingssammendrag.typeBehandling')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortKey="status" sortable>
                                {formatMessage('behandlingssammendrag.status')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortKey="periode" sortable>
                                {formatMessage('behandlingssammendrag.periode')}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader sortKey="behandlingStartet" sortable>
                                {formatMessage('behandlingssammendrag.behandling.startet')}
                            </Table.ColumnHeader>
                            <Table.HeaderCell />
                        </Table.Row>
                    </Table.Header>
                )}
                tableBody={(sortertKolonne, sortVerdi) => {
                    paginerteOppgaver = sortTabell(props.tabelldata, sortertKolonne, sortVerdi);
                    paginerteOppgaver = paginerteOppgaver.slice((side - 1) * oppgaverPerSide, side * oppgaverPerSide);
                    return (
                        <Table.Body>
                            {sortTabell(paginerteOppgaver, sortertKolonne, sortVerdi).map((behandlingssammendrag) => (
                                <BehandlingssamendragTableRow
                                    key={`${behandlingssammendrag.id}${behandlingssammendrag.saksnummer}${behandlingssammendrag.sakType}${behandlingssammendrag.typeBehandling}${behandlingssammendrag.status}`}
                                    behandlingssammendrag={behandlingssammendrag}
                                    setContextMenuVariables={setContextMenuVariables}
                                />
                            ))}
                        </Table.Body>
                    );
                }}
            />
            {contextMenuVariables.toggled && (
                <Menu>
                    <button onClick={() => contextMenuVariables.onMenuClick?.()}>
                        {formatMessage('sak.åpneINyFane')}
                    </button>
                </Menu>
            )}
        </div>
    );
};

const BehandlingssamendragTableRow = ({
    behandlingssammendrag,
    setContextMenuVariables,
}: {
    behandlingssammendrag: BehandlingssammendragMedId;
    setContextMenuVariables: (contextMenuVariables: ContextMenuVariables) => void;
}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { formatMessage } = useI18n({ messages });
    const [hentSakStatus, hentSak] = useAsyncActionCreator(sakSlice.fetchSakByIdEllerNummer);
    const handleOnClick = async (onSuccess: (sak: Sak) => void) => {
        dispatch(personSlice.default.actions.resetSøkerData());
        dispatch(sakSlice.default.actions.resetSak());
        hentSak({ saksnummer: behandlingssammendrag.saksnummer }, (sak) => {
            onSuccess(sak);
        });
    };
    /*
        TODO: Stor forbokstav i saktype..
        TODO: Vise filtreringsboks for saktype i venstre meny
     */

    return (
        <Table.Row key={`${behandlingssammendrag.saksnummer}${behandlingssammendrag.typeBehandling}`}>
            <Table.DataCell>{behandlingssammendrag.sakType}</Table.DataCell>
            <Table.DataCell>{behandlingssammendrag.saksnummer}</Table.DataCell>
            <Table.DataCell>{formatMessage(behandlingssammendrag.typeBehandling)}</Table.DataCell>
            <Table.DataCell>{formatMessage(behandlingssammendrag.status)}</Table.DataCell>
            <Table.DataCell>
                {behandlingssammendrag.periode ? formatPeriode(behandlingssammendrag.periode) : ''}
            </Table.DataCell>
            <Table.DataCell>
                {behandlingssammendrag.behandlingStartet ? formatDateTime(behandlingssammendrag.behandlingStartet) : ''}
            </Table.DataCell>
            <Table.DataCell
                onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenuVariables({
                        pos: { x: e.pageX, y: e.pageY },
                        toggled: true,
                        onMenuClick: () =>
                            handleOnClick((sak) => {
                                window.open(Routes.saksoversiktValgtSak.createURL({ sakId: sak.id }));
                            }),
                    });
                }}
            >
                <Button
                    variant="tertiary"
                    onClick={() =>
                        handleOnClick((sak) => navigate(Routes.saksoversiktValgtSak.createURL({ sakId: sak.id })))
                    }
                    loading={RemoteData.isPending(hentSakStatus)}
                >
                    {formatMessage('sak.seSak')}
                </Button>

                {RemoteData.isFailure(hentSakStatus) && <ApiErrorAlert error={hentSakStatus.error} />}
            </Table.DataCell>
        </Table.Row>
    );
};

export default BehandlingssammendragTabell;
