import { Alert, Box, Heading, HStack, Label, Loader, Table, VStack } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { ApiClientResult } from '~src/api/apiClient.ts';
import {
    AapFradragResponse,
    AlderBeregningsperioderPerPerson,
    HentFradragRequest,
    hentEksterneAAP,
    hentEksterneFradragAlderspensjon,
    hentEksterneFradragUføretrygd,
    ResponseDtoAlder,
    ResponseDtoUføre,
    UføreBeregningsperioderPerPerson,
} from '~src/api/EksterneFradragApi.ts';
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
}

export const EksterneFradrag = ({ sakId, fnr, periode }: Props) => {
    const [alderspensjon, setAlderspensjon] = useState<ApiClientResult<ResponseDtoAlder> | null>(null);
    const [uforetrygd, setUforetrygd] = useState<ApiClientResult<ResponseDtoUføre> | null>(null);
    const [aap, setAap] = useState<ApiClientResult<AapFradragResponse> | null>(null);

    useEffect(() => {
        if (!periode) return;

        const req: HentFradragRequest = { sakId, fnr, periode };

        hentEksterneFradragAlderspensjon(req).then(setAlderspensjon);
        hentEksterneFradragUføretrygd(req).then(setUforetrygd);
        hentEksterneAAP(req).then(setAap);
    }, [sakId, fnr, periode?.fraOgMed, periode?.tilOgMed]);

    return (
        <Box background="surface-subtle" padding="5" borderWidth="1" borderRadius="medium" borderColor="border-subtle">
            <VStack gap="5">
                <Heading size="small">Eksterne fradrag</Heading>
                <AlderspensjonSeksjon resultat={alderspensjon} />
                <UforetrygdSeksjon resultat={uforetrygd} />
                <AapSeksjon resultat={aap} />
            </VStack>
        </Box>
    );
};

const AlderspensjonSeksjon = ({ resultat }: { resultat: ApiClientResult<ResponseDtoAlder> | null }) => (
    <EksternSeksjon tittel="Alderspensjon" resultat={resultat}>
        {resultat?.status === 'ok' && (resultat.data ?? []).length > 0 && (
            <VStack gap="4">
                {(resultat.data ?? []).map((person) => (
                    <AlderPersonTabell
                        key={person.fnr}
                        person={person}
                        visPersonFnr={(resultat.data ?? []).length > 1}
                    />
                ))}
            </VStack>
        )}
    </EksternSeksjon>
);

const AlderPersonTabell = ({
    person,
    visPersonFnr,
}: {
    person: AlderBeregningsperioderPerPerson;
    visPersonFnr: boolean;
}) => (
    <VStack gap="2">
        {visPersonFnr && <Label size="small">Fnr: {person.fnr}</Label>}
        <Table size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Fra og med</Table.HeaderCell>
                    <Table.HeaderCell>Til og med</Table.HeaderCell>
                    <Table.HeaderCell>Netto</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {person.perioder.map((p, i) => (
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

const UforetrygdSeksjon = ({ resultat }: { resultat: ApiClientResult<ResponseDtoUføre> | null }) => (
    <EksternSeksjon tittel="Uføretrygd" resultat={resultat}>
        {resultat?.status === 'ok' && (resultat.data ?? []).length > 0 && (
            <VStack gap="4">
                {(resultat.data ?? []).map((person) => (
                    <UforePersonTabell
                        key={person.fnr}
                        person={person}
                        visPersonFnr={(resultat.data ?? []).length > 1}
                    />
                ))}
            </VStack>
        )}
    </EksternSeksjon>
);

const UforePersonTabell = ({
    person,
    visPersonFnr,
}: {
    person: UføreBeregningsperioderPerPerson;
    visPersonFnr: boolean;
}) => (
    <VStack gap="2">
        {visPersonFnr && <Label size="small">Fnr: {person.fnr}</Label>}
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
                {person.perioder.map((p, i) => (
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

const AapSeksjon = ({ resultat }: { resultat: ApiClientResult<AapFradragResponse> | null }) => (
    <EksternSeksjon tittel="Arbeidsavklaringspenger (AAP)" resultat={resultat}>
        {resultat?.status === 'ok' && (resultat.data ?? []).length > 0 && (
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
                    {(resultat.data ?? []).map((entry, i) => (
                        <Table.Row key={i}>
                            <Table.DataCell>{entry.fraOgMedDato ? formatDate(entry.fraOgMedDato) : '—'}</Table.DataCell>
                            <Table.DataCell>{entry.tilOgMedDato ? formatDate(entry.tilOgMedDato) : '—'}</Table.DataCell>
                            <Table.DataCell>{entry.dagsats.toLocaleString('nb-NO')} kr</Table.DataCell>
                            <Table.DataCell>{entry.barnetillegg.toLocaleString('nb-NO')} kr</Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        )}
    </EksternSeksjon>
);

const EksternSeksjon = ({
    tittel,
    resultat,
    children,
}: {
    tittel: string;
    resultat: ApiClientResult<unknown> | null;
    children?: React.ReactNode;
}) => (
    <Box background="surface-default" padding="4" borderRadius="medium" borderWidth="1" borderColor="border-subtle">
        <VStack gap="3">
            <HStack gap="2" align="center">
                <Heading size="xsmall">{tittel}</Heading>
                {resultat === null && <Loader size="xsmall" title={`Henter ${tittel}`} />}
            </HStack>
            {resultat?.status === 'error' && (
                <Alert variant="error" size="small" inline>
                    Kunne ikke hente {tittel.toLowerCase()}
                </Alert>
            )}
            {children}
        </VStack>
    </Box>
);
