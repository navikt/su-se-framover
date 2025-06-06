import * as RemoteData from '@devexperts/remote-data-ts';
import { CalculatorIcon } from '@navikt/aksel-icons';
import { Alert, Box, Button, Checkbox, Heading, Label, Loader, Table, Tag } from '@navikt/ds-react';
import * as arr from 'fp-ts/Array';
import { contramap } from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { hentReguleringsstatus } from '~src/api/reguleringApi.ts';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import CircleWithIcon from '~src/components/circleWithIcon/CircleWithIcon';
import ContextMenu from '~src/components/contextMenu/ContextMenu';
import * as personSlice from '~src/features/person/person.slice';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { useAppDispatch } from '~src/redux/Store';
import {
    Fradragskategori,
    fradragTilLabelTag,
    IkkeVelgbareFradragskategorier,
    VelgbareFradragskategorier,
} from '~src/types/Fradrag.ts';
import { ReguleringOversiktsstatus } from '~src/types/Regulering';

import messages from './regulering-nb';
import styles from './regulering.module.less';

const hentFradragskategorierSortertAlfabetisk = () => {
    return [...Object.keys(VelgbareFradragskategorier), ...Object.keys(IkkeVelgbareFradragskategorier)].sort((a, b) =>
        a.localeCompare(b),
    );
};

const Reguleringsoversikt = () => {
    const { formatMessage } = useI18n({ messages });
    const { Menu, contextMenuVariables, setContextMenuVariables } = ContextMenu();
    const [hentSakStatus, hentSak] = useAsyncActionCreator(sakSlice.fetchSakByIdEllerNummer);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [reguleringerOgMerknader, hentReguleringerOgMerknader] = useApiCall(hentReguleringsstatus);

    useEffect(() => {
        hentReguleringerOgMerknader({});
    }, []);

    const [fradragsfilterList, setfradragsFilter] = useState<Set<Fradragskategori>>(new Set());

    if (RemoteData.isFailure(reguleringerOgMerknader)) {
        return <ApiErrorAlert error={reguleringerOgMerknader.error} />;
    }

    if (RemoteData.isPending(reguleringerOgMerknader) || RemoteData.isInitial(reguleringerOgMerknader)) {
        return <Loader />;
    }

    const gjenståendeManuelleReguleringer = RemoteData.isSuccess(reguleringerOgMerknader)
        ? reguleringerOgMerknader.value
        : [];

    const filtrerteReguleringer = fradragsfilterList.size
        ? gjenståendeManuelleReguleringer.filter((regulering) => {
              return regulering.fradragsKategori.length
                  ? regulering.fradragsKategori.every((fradrag) => fradragsfilterList.has(fradrag))
                  : false;
          })
        : gjenståendeManuelleReguleringer;

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
                            <Table.HeaderCell>{formatMessage('tabell.årsakTilManuellRegulering')}</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {pipe(
                            data,
                            arr.sortBy([sortByFnr]),
                            arr.mapWithIndex(
                                (index, { saksnummer, fnr, fradragsKategori, årsakTilManuellRegulering }) => {
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
                                                        await hentSak({ saksnummer: saksnummer.toString() }, (sak) => {
                                                            navigate(
                                                                Routes.saksoversiktValgtSak.createURL({
                                                                    sakId: sak.id,
                                                                }),
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
                                                {fradragsKategori.map((fradrag, index) => (
                                                    <Tag
                                                        variant={fradragTilLabelTag[fradrag]}
                                                        key={`${index}-${fradrag}`}
                                                    >
                                                        {formatMessage(fradrag)}
                                                    </Tag>
                                                ))}
                                            </Table.DataCell>
                                            <Table.DataCell>
                                                {årsakTilManuellRegulering.map((årsak) => formatMessage(årsak))}
                                            </Table.DataCell>
                                        </Table.Row>
                                    );
                                },
                            ),
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
                    antallManuelle: gjenståendeManuelleReguleringer.length,
                })}
            </Alert>

            <div>
                <Heading size="medium" className={styles.heading}>
                    <CircleWithIcon variant="yellow" icon={<CalculatorIcon />} />
                    {formatMessage('resultat.startManuell')}
                </Heading>
                <div className={styles.filterKolonne}>
                    <div className={styles.filtreringsStyling}>
                        <Box padding="2">
                            <Label className={styles.label}>Fradragstyper</Label>
                            {hentFradragskategorierSortertAlfabetisk().map((value) => (
                                <Checkbox
                                    key={value}
                                    onChange={(e) => {
                                        const valgtFradrag = value as Fradragskategori;
                                        const funnet = fradragsfilterList.has(valgtFradrag);
                                        if (funnet) {
                                            if (!e.target.checked) {
                                                setfradragsFilter((prev) => {
                                                    const updated = new Set(prev);
                                                    updated.delete(valgtFradrag);
                                                    return updated;
                                                });
                                            }
                                        } else {
                                            if (e.target.checked) {
                                                setfradragsFilter((prev) => {
                                                    const updated = new Set(prev);
                                                    updated.add(valgtFradrag);
                                                    return updated;
                                                });
                                            }
                                        }
                                    }}
                                >
                                    {formatMessage(value as Fradragskategori)}
                                </Checkbox>
                            ))}
                        </Box>
                    </div>
                    <Reguleringstabell data={filtrerteReguleringer} />
                </div>
            </div>
        </div>
    );
};

export default Reguleringsoversikt;
