import { Alert, Button } from '@navikt/ds-react';
import { useState } from 'react';
import { Brevtype, ReferanseType } from '~src/api/mottakerClient.ts';
import { MottakerAlert } from '~src/components/mottaker/mottakerUtils.ts';
import { Mottaker } from '~src/pages/saksbehandling/mottaker/Mottaker.tsx';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling.ts';

export const MottakerDødsbo = ({
    sakId,
    tilbakekreving,
    harDødsbo,
    setHardødsbo,
    referanseType,
    brevtype,
    mottakerFetchError,
}: {
    sakId: string;
    tilbakekreving: ManuellTilbakekrevingsbehandling;
    referanseType: ReferanseType;
    brevtype: Brevtype;
    harDødsbo: boolean;
    setHardødsbo: (harDødsbo: boolean) => void;
    mottakerFetchError: MottakerAlert | null;
}) => {
    if (process.env.NODE_ENV !== 'development') {
        return;
    }
    const [visDødsbo, setVisDødsbo] = useState(false);

    return (
        <div>
            {!visDødsbo && (
                <Button variant="secondary" type="button" onClick={() => setVisDødsbo(true)}>
                    {harDødsbo ? 'Vis dødsbo' : 'Legg til dødsbo'}
                </Button>
            )}

            {visDødsbo && (
                <>
                    <Mottaker
                        sakId={sakId}
                        referanseId={tilbakekreving.id}
                        referanseType={referanseType}
                        brevtype={brevtype}
                        onClose={() => setVisDødsbo(false)}
                        onDelete={() => setHardødsbo(false)}
                    />

                    {mottakerFetchError && (
                        <Alert variant={mottakerFetchError.variant} size="small">
                            {mottakerFetchError.text}
                        </Alert>
                    )}
                </>
            )}
        </div>
    );
};
