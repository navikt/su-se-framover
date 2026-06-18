import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Box, Loader, VStack } from '@navikt/ds-react';
import { useEffect } from 'react';

import { NorskPostadresse, SjekkAdresseResponse, sjekkAdresse } from '~src/api/adresseOppslagApi.ts';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { ApiResult, useApiCall } from '~src/lib/hooks.ts';

interface Props {
    sakId: string;
    fnr: string | undefined;
}

const harGyldigFnr = (fnr: string | undefined) => Boolean(fnr?.trim().match(/^\d{11}$/));

const formatAdresse = (adresse: NorskPostadresse) =>
    [
        adresse.adresselinje1,
        adresse.adresselinje2 ?? undefined,
        adresse.adresselinje3 ?? undefined,
        [adresse.postnummer, adresse.poststed].filter(Boolean).join(' '),
        adresse.landkode !== 'NO' ? adresse.land : undefined,
    ]
        .filter(Boolean)
        .join(', ');

export const AdresseOppslag = ({ sakId, fnr }: Props) => {
    const [status, hentAdresse, resetStatus] = useApiCall(sjekkAdresse);

    const trimmedFnr = fnr?.trim();

    useEffect(() => {
        if (!harGyldigFnr(trimmedFnr)) {
            resetStatus();
            return;
        }

        hentAdresse({ sakId, fnr: trimmedFnr! });
    }, [sakId]);

    return (
        <VStack gap="3">
            {RemoteData.isPending(status) && <Loader size="small" title="Henter adresse" />}
            <AdresseOppslagResultat status={status} />
        </VStack>
    );
};

const AdresseOppslagResultat = ({ status }: { status: ApiResult<SjekkAdresseResponse> }) => {
    if (RemoteData.isInitial(status) || RemoteData.isPending(status)) {
        return null;
    }

    if (RemoteData.isFailure(status)) {
        return <ApiErrorAlert error={status.error} size="small" />;
    }

    if (status.value.type === 'INGEN_ADRESSE') {
        return (
            <VStack gap="3">
                {status.value.melding && (
                    <Alert variant="warning" size="small">
                        {status.value.melding}
                    </Alert>
                )}
                {status.value.aarsak === 'PERSON_ER_DOD' && (
                    <Alert variant="info" size="small">
                        Personen er registrert død.
                    </Alert>
                )}
            </VStack>
        );
    }

    return (
        <Alert variant="success" size="small">
            <VStack gap="2">
                <BodyShort>Fant navn og adresse.</BodyShort>
                <Box>
                    <BodyShort weight="semibold">{status.value.navn}</BodyShort>
                    <BodyShort>{formatAdresse(status.value.adresse)}</BodyShort>
                </Box>
            </VStack>
        </Alert>
    );
};
