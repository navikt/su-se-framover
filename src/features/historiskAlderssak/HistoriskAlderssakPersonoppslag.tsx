import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Button, Heading, TextField, VStack } from '@navikt/ds-react';
import { FormEvent, useState } from 'react';

import { sjekkOmHistoriskAlderssakFinnes } from '~src/api/historiskAlderssakApi';
import { useApiCall } from '~src/lib/hooks';

import HistoriskAlderssakApiErrorAlert from './HistoriskAlderssakApiErrorAlert';

const HistoriskAlderssakPersonoppslag = (props: { onTreff: (fnr: string) => void }) => {
    const [fnr, setFnr] = useState('');
    const [harForsøktÅSendeInn, setHarForsøktÅSendeInn] = useState(false);
    const [finnesStatus, sjekkOmHistoriskAlderssak, resetFinnesStatus] = useApiCall(sjekkOmHistoriskAlderssakFinnes);
    const harGyldigFormat = /^\d{11}$/.test(fnr);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHarForsøktÅSendeInn(true);

        if (!harGyldigFormat) {
            return;
        }

        const forespurtFnr = fnr;
        sjekkOmHistoriskAlderssak({ fnr: forespurtFnr }, (response) => {
            if (response.harHistoriskAlderssak) {
                props.onTreff(forespurtFnr);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <VStack gap="4" align="start">
                <Heading level="2" size="small">
                    Finn historikk fra Infotrygd
                </Heading>
                <BodyShort>Søk opp en person for å se om det finnes historisk stønad eller vedtak.</BodyShort>
                <TextField
                    label="Fødselsnummer"
                    description="Oppgi personens fødselsnummer (11 siffer)."
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={11}
                    value={fnr}
                    error={
                        harForsøktÅSendeInn && !harGyldigFormat ? 'Oppgi et fødselsnummer med 11 siffer.' : undefined
                    }
                    onChange={(event) => {
                        setFnr(event.target.value);
                        setHarForsøktÅSendeInn(false);
                        resetFinnesStatus();
                    }}
                />
                <Button type="submit" loading={RemoteData.isPending(finnesStatus)}>
                    Søk
                </Button>
                {RemoteData.isSuccess(finnesStatus) && !finnesStatus.value.harHistoriskAlderssak && (
                    <Alert variant="info">Fant ingen historisk alderssak for personen.</Alert>
                )}
                {RemoteData.isFailure(finnesStatus) && <HistoriskAlderssakApiErrorAlert error={finnesStatus.error} />}
            </VStack>
        </form>
    );
};

export default HistoriskAlderssakPersonoppslag;
