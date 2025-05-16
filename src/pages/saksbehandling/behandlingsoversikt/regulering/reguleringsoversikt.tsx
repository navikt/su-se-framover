import * as RemoteData from '@devexperts/remote-data-ts';
import { CalculatorIcon } from '@navikt/aksel-icons';
import { Alert, Heading, Table, Tag, Button } from '@navikt/ds-react';
import * as arr from 'fp-ts/Array';
import { contramap } from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import CircleWithIcon from '~src/components/circleWithIcon/CircleWithIcon';
import ContextMenu from '~src/components/contextMenu/ContextMenu';
import * as personSlice from '~src/features/person/person.slice';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { useAppDispatch } from '~src/redux/Store';
import { ReguleringOversiktsstatus } from '~src/types/Regulering';

import messages from './regulering-nb';
import styles from './regulering.module.less';

interface Props {
    reguleringsstatus: ReguleringOversiktsstatus[];
}
const Reguleringsoversikt = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const { Menu, contextMenuVariables, setContextMenuVariables } = ContextMenu();

    const sortByFnr = pipe(
        S.Ord,
        contramap((r: ReguleringOversiktsstatus) => r.fnr),
    );

    const Reguleringstabell = ({ data }: { data: ReguleringOversiktsstatus[] }) => {
        return (
            <div>
                <Table className="tabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{formatMessage('tabell.saksnummer')}</Table.HeaderCell>
                            <Table.HeaderCell>{formatMessage('tabell.fnr')}</Table.HeaderCell>
                            <Table.HeaderCell>{formatMessage('tabell.lenke')}</Table.HeaderCell>
                            <Table.HeaderCell>{formatMessage('tabell.ekstraInformasjon')}</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {pipe(
                            data,
                            arr.sortBy([sortByFnr]),
                            arr.mapWithIndex((index, { saksnummer, fnr, merknader }) => {
                                const [hentSakStatus, hentSak] = useAsyncActionCreator(
                                    sakSlice.fetchSakByIdEllerNummer,
                                );
                                const navigate = useNavigate();
                                const dispatch = useAppDispatch();
                                return (
                                    <Table.Row key={index}>
                                        <Table.DataCell>{saksnummer}</Table.DataCell>
                                        <Table.DataCell>{fnr}</Table.DataCell>
                                        <Table.DataCell
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                setContextMenuVariables({
                                                    pos: { x: e.pageX, y: e.pageY },
                                                    toggled: true,
                                                    onMenuClick: async () => {
                                                        dispatch(personSlice.default.actions.resetSøkerData());
                                                        dispatch(sakSlice.default.actions.resetSak());
                                                        hentSak({ saksnummer: saksnummer.toString() }, (sak) => {
                                                            window.open(
                                                                Routes.saksoversiktValgtSak.createURL({
                                                                    sakId: sak.id,
                                                                }),
                                                                '_blank',
                                                            );
                                                        });
                                                    },
                                                });
                                            }}
                                        >
                                            <Button
                                                variant="tertiary"
                                                onClick={async () => {
                                                    dispatch(personSlice.default.actions.resetSøkerData());
                                                    dispatch(sakSlice.default.actions.resetSak());
                                                    hentSak({ saksnummer: saksnummer.toString() }, (sak) => {
                                                        navigate(
                                                            Routes.saksoversiktValgtSak.createURL({ sakId: sak.id }),
                                                        );
                                                    });
                                                }}
                                                loading={RemoteData.isPending(hentSakStatus)}
                                            >
                                                {formatMessage('tabell.lenke.knapp')}
                                            </Button>
                                            {RemoteData.isFailure(hentSakStatus) && (
                                                <ApiErrorAlert error={hentSakStatus.error} />
                                            )}
                                        </Table.DataCell>
                                        <Table.DataCell>
                                            {merknader.map((m, index) => (
                                                <Tag variant="info" key={index}>
                                                    {formatMessage(m)}
                                                </Tag>
                                            ))}
                                        </Table.DataCell>
                                    </Table.Row>
                                );
                            }),
                        )}
                    </Table.Body>
                </Table>
                {contextMenuVariables.toggled && (
                    <Menu>
                        <button onClick={() => contextMenuVariables.onMenuClick?.()}>Åpne sak i ny fane</button>
                    </Menu>
                )}
            </div>
        );
    };

    return (
        <div className={styles.oversikt}>
            <Alert variant="success">
                {formatMessage('resultat', {
                    antallManuelle: props.reguleringsstatus.length,
                })}
            </Alert>

            <div>
                <Heading size="medium" className={styles.heading}>
                    <CircleWithIcon variant="yellow" icon={<CalculatorIcon />} />
                    {formatMessage('resultat.startManuell')}
                </Heading>
                <Reguleringstabell data={props.reguleringsstatus} />
            </div>
        </div>
    );
};

export default Reguleringsoversikt;
