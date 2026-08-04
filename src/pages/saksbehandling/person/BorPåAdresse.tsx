import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading, Table } from '@navikt/ds-react';
import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchBorPåAdresse } from '~src/api/personApi.ts';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton.tsx';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext.ts';
import { useApiCall } from '~src/lib/hooks.ts';
import * as Routes from '~src/lib/routes';
import { PersonPåAdresse } from '~src/types/Person.ts';
import { formatDate } from '~src/utils/date/dateUtils.ts';
import styles from './BorPåAdresse.module.less';

const BorPåAdresse = () => {
    const sak = useOutletContext<SaksoversiktContext>().sak;
    const [borPåAdresse, hentBorPåAdresse] = useApiCall(fetchBorPåAdresse);

    useEffect(() => {
        hentBorPåAdresse({ fnr: sak.fnr, sakstype: sak.sakstype });
    }, []);

    if (RemoteData.isSuccess(borPåAdresse)) {
        const data = borPåAdresse.value;

        return (
            <div className={styles.pageContainer}>
                <Heading level="2" size={'large'}>
                    Personer registrert på brukers adresse: {data.søktAdresse}
                </Heading>
                <Table className={styles.tabell} size="small">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell scope="col">Identer</Table.HeaderCell>
                            <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                            <Table.HeaderCell scope="col">Adresse</Table.HeaderCell>
                            <Table.HeaderCell scope="col">Gyldig fra og med</Table.HeaderCell>
                            <Table.HeaderCell scope="col">Gyldig til og med</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {data.treff.map((personSomBorPåAdressse: PersonPåAdresse, index: number) => (
                            <Table.Row key={index}>
                                <Table.DataCell>
                                    {personSomBorPåAdressse.identer.map((ident) => `${ident.type}: ${ident.ident}`)}
                                </Table.DataCell>
                                <Table.DataCell>{personSomBorPåAdressse.fulltNavn}</Table.DataCell>
                                <Table.DataCell>{personSomBorPåAdressse.adresse}</Table.DataCell>
                                <Table.DataCell>{formatDate(personSomBorPåAdressse.gyldigFraOgMed)}</Table.DataCell>
                                <Table.DataCell>
                                    {personSomBorPåAdressse.gyldigTilOgMed &&
                                        formatDate(personSomBorPåAdressse.gyldigTilOgMed)}
                                </Table.DataCell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
                <div className={styles.buttonContainer}>
                    <LinkAsButton variant="secondary" href={Routes.saksoversiktValgtSak.createURL({ sakId: sak.id })}>
                        Tilbake
                    </LinkAsButton>
                </div>
            </div>
        );
    }
    return <div>Slår opp boende på adresse</div>;
};

export default BorPåAdresse;
