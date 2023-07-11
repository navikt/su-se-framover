import { Calculator } from '@navikt/ds-icons';
import { Alert, Heading, Table, Tag } from '@navikt/ds-react';
import * as arr from 'fp-ts/Array';
import { contramap } from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import React from 'react';

import CircleWithIcon from '~src/components/circleWithIcon/CircleWithIcon';
import VelgSakKnapp from '~src/components/velgSakKnapp/velgSakKnapp';
import { pipe } from '~src/lib/fp';
import { useI18n } from '~src/lib/i18n';
import { ReguleringOversiktsstatus } from '~src/types/Regulering';

import messages from './regulering-nb';
import * as styles from './regulering.module.less';

interface Props {
    reguleringsstatus: ReguleringOversiktsstatus[];
}
const Reguleringsoversikt = (props: Props) => {
    const { formatMessage } = useI18n({ messages });

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
                                return (
                                    <Table.Row key={index}>
                                        <Table.DataCell>{saksnummer}</Table.DataCell>
                                        <Table.DataCell>{fnr}</Table.DataCell>
                                        <Table.DataCell>
                                            <VelgSakKnapp
                                                saksnummer={saksnummer.toString()}
                                                label={formatMessage('tabell.lenke.knapp')}
                                            />
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
                    <CircleWithIcon variant="yellow" icon={<Calculator />} />
                    {formatMessage('resultat.startManuell')}
                </Heading>
                <Reguleringstabell data={props.reguleringsstatus} />
            </div>
        </div>
    );
};

export default Reguleringsoversikt;
