import { Calculator } from '@navikt/ds-icons';
import { Alert, Heading, Table } from '@navikt/ds-react';
import React from 'react';

import CircleWithIcon from '~components/circleWithIcon/CircleWithIcon';
import VelgSakKnapp from '~components/velgSakKnapp/velgSakKnapp';
import { useI18n } from '~lib/i18n';
import { Regulering } from '~types/Regulering';

import messages from './regulering-nb';
import styles from './regulering.module.less';

interface Props {
    automatiske: Regulering[];
    manuelle: Regulering[];
}
const Reguleringsoversikt = (props: Props) => {
    const { automatiske } = props;
    const gjenståendeManuelle = props.manuelle.filter((m) => !m.erFerdigstilt);
    const { formatMessage } = useI18n({ messages });

    const Reguleringstabell = ({ data }: { data: Regulering[] }) => {
        return (
            <div>
                <Table className="tabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{formatMessage('tabell.saksnummer')}</Table.HeaderCell>
                            <Table.HeaderCell>{formatMessage('tabell.lenke')}</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {data.map((d, index) => {
                            return (
                                <Table.Row key={index}>
                                    <Table.DataCell>{d.saksnummer}</Table.DataCell>
                                    <Table.DataCell>
                                        <VelgSakKnapp
                                            saksnummer={d.saksnummer.toString()}
                                            label={formatMessage('tabell.lenke.knapp')}
                                        />
                                    </Table.DataCell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
            </div>
        );
    };

    return (
        <div className={styles.oversikt}>
            <Alert variant="success">
                {formatMessage('resultat', {
                    antallAutomatiske: automatiske.length,
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
