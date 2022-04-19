import { Calculator } from '@navikt/ds-icons';
import { Alert, Heading, Table } from '@navikt/ds-react';
import * as arr from 'fp-ts/Array';
import { contramap } from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import React from 'react';

import CircleWithIcon from '~src/components/circleWithIcon/CircleWithIcon';
import VelgSakKnapp from '~src/components/velgSakKnapp/velgSakKnapp';
import { pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import { Regulering } from '~src/types/Regulering';

import messages from './regulering-nb';
import * as styles from './regulering.module.less';

interface Props {
    manuelle: Regulering[];
}
const Reguleringsoversikt = (props: Props) => {
    const gjenståendeManuelle = props.manuelle.filter((m) => !m.erFerdigstilt);
    const { formatMessage } = useI18n({ messages });

    const sortByFnr = pipe(
        S.Ord,
        contramap((regulering: Regulering) => regulering.fnr)
    );

    const Reguleringstabell = ({ data }: { data: Regulering[] }) => {
        return (
            <div>
                <Table className="tabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{formatMessage('tabell.saksnummer')}</Table.HeaderCell>
                            <Table.HeaderCell>{formatMessage('tabell.fnr')}</Table.HeaderCell>
                            <Table.HeaderCell>{formatMessage('tabell.lenke')}</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {pipe(
                            data,
                            arr.sortBy([sortByFnr]),
                            arr.mapWithIndex((index, regulering) => {
                                return (
                                    <Table.Row key={index}>
                                        <Table.DataCell>{regulering.saksnummer}</Table.DataCell>
                                        <Table.DataCell>{regulering.fnr}</Table.DataCell>
                                        <Table.DataCell>
                                            <VelgSakKnapp
                                                saksnummer={regulering.saksnummer.toString()}
                                                label={formatMessage('tabell.lenke.knapp')}
                                            />
                                        </Table.DataCell>
                                    </Table.Row>
                                );
                            })
                        )}
                    </Table.Body>
                </Table>
            </div>
        );
    };

    return (
        <div className={styles.oversikt}>
            <Alert variant="success">
                {formatMessage('resultat', {
                    antallManuelle: gjenståendeManuelle.length,
                })}
            </Alert>

            <div>
                <Heading size="medium" className={styles.heading}>
                    <CircleWithIcon variant="yellow" icon={<Calculator />} />
                    {formatMessage('resultat.startManuell')}
                </Heading>
                <Reguleringstabell data={gjenståendeManuelle} />
            </div>
        </div>
    );
};

export default Reguleringsoversikt;
