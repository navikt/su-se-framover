import * as RemoteData from '@devexperts/remote-data-ts';
import { Box, Heading, VStack } from '@navikt/ds-react';
import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchBorPåAdresse } from '~src/api/personApi.ts';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton.tsx';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar.tsx';
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
                    Bor på adresse: {data.søktAdresse}
                </Heading>
                {data.treff.map((personSomBorPåAdressse: PersonPåAdresse, index: number) => (
                    <Box key={index} className={styles.box} background="bg-default" padding="6">
                        <VStack gap="4">
                            {personSomBorPåAdressse.identer.map((ident, i) => (
                                <OppsummeringPar key={i} label={ident.type} retning={'vertikal'} verdi={ident.ident} />
                            ))}
                            <OppsummeringPar
                                label="Navn"
                                retning={'vertikal'}
                                verdi={personSomBorPåAdressse.fulltNavn}
                            />
                            <OppsummeringPar
                                label="Adresse"
                                retning={'vertikal'}
                                verdi={personSomBorPåAdressse.adresse}
                            />
                            <OppsummeringPar
                                label="Gyldig fra og med"
                                retning={'vertikal'}
                                verdi={formatDate(personSomBorPåAdressse.gyldigFraOgMed)}
                            />
                            {personSomBorPåAdressse.gyldigTilOgMed && (
                                <OppsummeringPar
                                    label="Gyldig til og med"
                                    retning={'vertikal'}
                                    verdi={formatDate(personSomBorPåAdressse.gyldigTilOgMed)}
                                />
                            )}
                            <OppsummeringPar
                                label="MatrikkelId"
                                retning={'vertikal'}
                                verdi={personSomBorPåAdressse.matrikkelId}
                            />
                        </VStack>
                    </Box>
                ))}
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
