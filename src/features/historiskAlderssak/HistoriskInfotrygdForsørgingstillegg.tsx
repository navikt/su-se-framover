import { Alert, BodyShort, Heading, VStack } from '@navikt/ds-react';
import { HistoriskInfotrygdMånedsgrunnlag } from '~src/types/HistoriskInfotrygdRevurdering';
import { formatCurrency } from '~src/utils/format/formatUtils';

const HistoriskInfotrygdForsørgingstillegg = (props: { grunnlag: HistoriskInfotrygdMånedsgrunnlag }) => {
    const berørteMåneder = props.grunnlag.måneder.filter((måned) => måned.kreverKontrollAvHistoriskForsørgingstillegg);

    // Varselet styres av månedsflaggene fra backend, ikke av et samlet flagg på grunnlaget.
    if (berørteMåneder.length === 0) {
        return null;
    }

    return (
        <Alert variant="info">
            <VStack gap="4" align="start">
                <div>
                    <Heading level="2" size="small" spacing>
                        Mulig forsørgingstillegg i historiske beløp
                    </Heading>
                    <BodyShort spacing>
                        Denne stønadsperioden startet før 1. januar 2015. Etter reglene som gjaldt da, kunne supplerende
                        stønad inneholde forsørgingstillegg for barn under 18 år. Historiske data viser ikke om det
                        utbetalte beløpet inneholdt et slikt tillegg.
                    </BodyShort>
                </div>
                <ul>
                    {berørteMåneder.map((måned) => (
                        <li key={måned.måned}>
                            {måned.måned}:{' '}
                            {måned.historiskBeløp === null ? 'Beløp mangler' : formatCurrency(måned.historiskBeløp)}
                        </li>
                    ))}
                </ul>
                <BodyShort size="small">
                    Etter tidligere § 5 ble ytelsen økt med 40 prosent av grunnbeløpet per barn under 18 år som
                    mottakeren forsørget og bodde sammen med. Før avviklingen var tillegget 20 prosent av minste
                    pensjonsnivå med høy sats per barn. Kilde: Prop. 14 L (2014–2015), kapittel 7.
                </BodyShort>
            </VStack>
        </Alert>
    );
};

export default HistoriskInfotrygdForsørgingstillegg;
