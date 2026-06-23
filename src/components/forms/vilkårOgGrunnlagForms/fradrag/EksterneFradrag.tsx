import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Box, Heading, HStack, Label, Loader, Table, VStack } from '@navikt/ds-react';
import { useEffect } from 'react';
import {
    AapFradragResponse,
    AlderBeregningsperiode,
    HentFradragRequest,
    hentEksterneAAP,
    hentEksterneFradragAlderspensjon,
    hentEksterneFradragUføretrygd,
    ResponseDtoAlder,
    ResponseDtoUføre,
    UføreBeregningsperiode,
} from '~src/api/EksterneFradragApi.ts';
import { ApiResult, useApiCall } from '~src/lib/hooks.ts';
import { formatDate } from '~src/utils/date/dateUtils.ts';

interface Props {
    sakId: string;
    fnr: string;
    periode:
        | {
              fraOgMed: string;
              tilOgMed: string;
          }
        | undefined;
    tittel: string;
}

export const EksterneFradrag = ({ sakId, fnr, periode, tittel }: Props) => {
    const [alderspensjon, hentAlderspensjon] = useApiCall(hentEksterneFradragAlderspensjon);
    const [uforetrygd, hentUforetrygd] = useApiCall(hentEksterneFradragUføretrygd);
    const [aap, hentAap] = useApiCall(hentEksterneAAP);

    useEffect(() => {
        if (!periode) return;

        const req: HentFradragRequest = { sakId, fnr, periode };

        hentAlderspensjon(req);
        hentUforetrygd(req);
        hentAap(req);
    }, [sakId, fnr, periode?.fraOgMed, periode?.tilOgMed]);

    return (
        <Box background="surface-subtle" padding="5" borderWidth="1" borderRadius="medium" borderColor="border-subtle">
            <VStack gap="5">
                <Heading size="small">{tittel}</Heading>
                <AlderspensjonSeksjon resultat={alderspensjon} />
                <UforetrygdSeksjon resultat={uforetrygd} />
                <AapSeksjon resultat={aap} />
            </VStack>
        </Box>
    );
};

const AlderspensjonSeksjon = ({ resultat }: { resultat: ApiResult<ResponseDtoAlder> }) => (
    <EksternSeksjon tittel="Alderspensjon" resultat={resultat}>
        {RemoteData.isSuccess(resultat) &&
            (resultat.value.perioder.length === 0 ? (
                <BodyShort>Ingen fradrag</BodyShort>
            ) : (
                <VStack gap="4">
                    <AlderPersonTabell
                        key={resultat.value.fnr}
                        fnr={resultat.value.fnr}
                        perioder={resultat.value.perioder}
                    />
                </VStack>
            ))}
    </EksternSeksjon>
);

const AlderPersonTabell = ({ perioder, fnr }: { perioder: AlderBeregningsperiode[]; fnr: string }) => (
    <VStack gap="2">
        <Label size="small">Fnr: {fnr}</Label>
        <Table size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Fra og med</Table.HeaderCell>
                    <Table.HeaderCell>Til og med</Table.HeaderCell>
                    <Table.HeaderCell>Netto</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {perioder.map((p, i) => (
                    <Table.Row key={i}>
                        <Table.DataCell>{formatDate(p.fom)}</Table.DataCell>
                        <Table.DataCell>{p.tom ? formatDate(p.tom) : '—'}</Table.DataCell>
                        <Table.DataCell>{p.netto.toLocaleString('nb-NO')} kr</Table.DataCell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    </VStack>
);

const UforetrygdSeksjon = ({ resultat }: { resultat: ApiResult<ResponseDtoUføre> }) => (
    <EksternSeksjon tittel="Uføretrygd" resultat={resultat}>
        {RemoteData.isSuccess(resultat) &&
            (resultat.value.perioder.length === 0 ? (
                <BodyShort>Ingen fradrag</BodyShort>
            ) : (
                <VStack gap="4">
                    <UforePersonTabell
                        key={resultat.value.fnr}
                        perioder={resultat.value.perioder}
                        fnr={resultat.value.fnr}
                    />
                </VStack>
            ))}
    </EksternSeksjon>
);

const UforePersonTabell = ({ perioder, fnr }: { perioder: UføreBeregningsperiode[]; fnr: string }) => (
    <VStack gap="2">
        <Label size="small">Fnr: {fnr}</Label>
        <Table size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Fra og med</Table.HeaderCell>
                    <Table.HeaderCell>Til og med</Table.HeaderCell>
                    <Table.HeaderCell>Netto</Table.HeaderCell>
                    <Table.HeaderCell>Oppjustert inntekt etter uføre</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {perioder.map((p, i) => (
                    <Table.Row key={i}>
                        <Table.DataCell>{formatDate(p.fom)}</Table.DataCell>
                        <Table.DataCell>{p.tom ? formatDate(p.tom) : '—'}</Table.DataCell>
                        <Table.DataCell>{p.netto.toLocaleString('nb-NO')} kr</Table.DataCell>
                        <Table.DataCell>
                            {p.oppjustertInntektEtterUfore !== null
                                ? `${p.oppjustertInntektEtterUfore.toLocaleString('nb-NO')} kr`
                                : '—'}
                        </Table.DataCell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    </VStack>
);

const AapSeksjon = ({ resultat }: { resultat: ApiResult<AapFradragResponse> }) => (
    <EksternSeksjon tittel="Arbeidsavklaringspenger (AAP)" resultat={resultat}>
        {RemoteData.isSuccess(resultat) &&
            (resultat.value.length === 0 ? (
                <BodyShort>Ingen fradrag</BodyShort>
            ) : (
                <Table size="small">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Fra og med</Table.HeaderCell>
                            <Table.HeaderCell>Til og med</Table.HeaderCell>
                            <Table.HeaderCell>Dagsats</Table.HeaderCell>
                            <Table.HeaderCell>Barnetillegg</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {resultat.value.map((entry, i) => (
                            <Table.Row key={i}>
                                <Table.DataCell>
                                    {entry.fraOgMedDato ? formatDate(entry.fraOgMedDato) : '—'}
                                </Table.DataCell>
                                <Table.DataCell>
                                    {entry.tilOgMedDato ? formatDate(entry.tilOgMedDato) : '—'}
                                </Table.DataCell>
                                <Table.DataCell>{entry.dagsats.toLocaleString('nb-NO')} kr</Table.DataCell>
                                <Table.DataCell>{entry.barnetillegg.toLocaleString('nb-NO')} kr</Table.DataCell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            ))}
    </EksternSeksjon>
);

const EksternSeksjon = ({
    tittel,
    resultat,
    children,
}: {
    tittel: string;
    resultat: ApiResult<unknown>;
    children?: React.ReactNode;
}) => (
    <Box background="surface-default" padding="4" borderRadius="medium" borderWidth="1" borderColor="border-subtle">
        <VStack gap="3">
            <HStack gap="2" align="center">
                <Heading size="xsmall">{tittel}</Heading>
                {RemoteData.isPending(resultat) && <Loader size="xsmall" title={`Henter ${tittel}`} />}
            </HStack>
            {RemoteData.isFailure(resultat) && (
                <Alert variant="error" size="small" inline>
                    Kunne ikke hente {tittel.toLowerCase()}
                </Alert>
            )}
            {children}
        </VStack>
    </Box>
);
