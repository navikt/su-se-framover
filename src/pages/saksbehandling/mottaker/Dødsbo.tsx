import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Box, Heading, VStack } from '@navikt/ds-react';
import { useLocation, useOutletContext } from 'react-router-dom';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton.tsx';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext.ts';
import * as Routes from '~src/lib/routes';
import { useAppSelector } from '~src/redux/Store.ts';
import { KontaktInfoDødsbo, Kontaktinformasjon } from '~src/types/Person';
import styles from './Mottaker.module.less';

const DødsboPage = () => {
    const context = useOutletContext<SaksoversiktContext>();
    const { pathname } = useLocation();
    const { søker } = useAppSelector((s) => ({ søker: s.personopplysninger.søker }));
    const skalViseTilbakeknapp = pathname.includes('/doedsbo');

    if (RemoteData.isSuccess(søker)) {
        const dødsbo = søker.value.dødsbo ?? [];
        return (
            <div className={styles.pageContainer}>
                <Box
                    background="surface-default"
                    padding="6"
                    borderWidth="1"
                    borderRadius="medium"
                    className={styles.panel}
                >
                    <VStack gap="5">
                        <Heading level="2" size="large">
                            Dødsbo
                        </Heading>

                        {dødsbo.length > 0 ? (
                            <VStack gap="6" className={styles.box}>
                                {dødsbo.map((kontaktinfo: KontaktInfoDødsbo, index: number) => (
                                    <VStack key={index} gap="4">
                                        {kontaktinfo.kontaktPerson && (
                                            <KontaktinformasjonVisning
                                                label="Kontaktperson"
                                                kontakt={kontaktinfo.kontaktPerson}
                                            />
                                        )}
                                        {kontaktinfo.kontaktAdvokat && (
                                            <KontaktinformasjonVisning
                                                label="Kontaktadvokat"
                                                kontakt={kontaktinfo.kontaktAdvokat}
                                            />
                                        )}
                                        {kontaktinfo.kontaktOrganisasjon && (
                                            <KontaktinformasjonVisning
                                                label="Kontaktorganisasjon"
                                                kontakt={kontaktinfo.kontaktOrganisasjon}
                                            />
                                        )}
                                        <OppsummeringPar
                                            label="Adresselinje 1"
                                            retning={'vertikal'}
                                            verdi={kontaktinfo.adresselinje1}
                                        />
                                        <OppsummeringPar
                                            label="Adresselinje 2"
                                            retning={'vertikal'}
                                            verdi={kontaktinfo.adresselinje2}
                                        />
                                        <OppsummeringPar
                                            label="Postnummer"
                                            retning={'vertikal'}
                                            verdi={kontaktinfo.postnummer}
                                        />
                                        <OppsummeringPar
                                            label="Poststedsnavn"
                                            retning={'vertikal'}
                                            verdi={kontaktinfo.poststedsnavn}
                                        />
                                        <OppsummeringPar
                                            label="Landkode"
                                            retning={'vertikal'}
                                            verdi={kontaktinfo.landkode}
                                        />
                                    </VStack>
                                ))}
                            </VStack>
                        ) : (
                            <BodyShort>Ingen dødsbo</BodyShort>
                        )}

                        {skalViseTilbakeknapp && (
                            <div className={styles.buttonContainer}>
                                <LinkAsButton
                                    variant="secondary"
                                    href={Routes.saksoversiktValgtSak.createURL({ sakId: context.sak.id })}
                                >
                                    Tilbake
                                </LinkAsButton>
                            </div>
                        )}
                    </VStack>
                </Box>
            </div>
        );
    }
    return (
        <div className={styles.pageContainer}>
            <Box
                background="surface-default"
                padding="6"
                borderWidth="1"
                borderRadius="medium"
                className={styles.panel}
            >
                <VStack gap="5">
                    <BodyShort>Kunne ikke hente søkers informasjon</BodyShort>
                    {skalViseTilbakeknapp && (
                        <div className={styles.buttonContainer}>
                            <LinkAsButton
                                variant="secondary"
                                href={Routes.saksoversiktValgtSak.createURL({ sakId: context.sak.id })}
                            >
                                Tilbake
                            </LinkAsButton>
                        </div>
                    )}
                </VStack>
            </Box>
        </div>
    );
};

const KontaktinformasjonVisning = ({ label, kontakt }: { label: string; kontakt: Kontaktinformasjon }) => (
    <VStack gap="2">
        <Heading level="3" size="small">
            {label}
        </Heading>
        {kontakt.fornavn && <OppsummeringPar label="Fornavn" retning={'vertikal'} verdi={kontakt.fornavn} />}
        {kontakt.mellomnavn && <OppsummeringPar label="Mellomnavn" retning={'vertikal'} verdi={kontakt.mellomnavn} />}
        {kontakt.etternavn && <OppsummeringPar label="Etternavn" retning={'vertikal'} verdi={kontakt.etternavn} />}
        {kontakt.identifikasjonsnummer && (
            <OppsummeringPar label="Identifikasjonsnummer" retning={'vertikal'} verdi={kontakt.identifikasjonsnummer} />
        )}
        {kontakt.organisasjonsnavn && (
            <OppsummeringPar label="Organisasjonsnavn" retning={'vertikal'} verdi={kontakt.organisasjonsnavn} />
        )}
        {kontakt.organisasjonsnummer && (
            <OppsummeringPar label="Organisasjonsnummer" retning={'vertikal'} verdi={kontakt.organisasjonsnummer} />
        )}
    </VStack>
);

export default DødsboPage;
