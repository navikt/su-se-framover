import { Alert, Button } from '@navikt/ds-react';
import { useState } from 'react';
import { MottakerAlert } from '~src/components/mottaker/mottakerUtils.ts';
import { MottakerForm } from '~src/pages/saksbehandling/mottaker/Mottaker.tsx';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling.ts';

export const MottakerDødsbo = ({
    sakId,
    tilbakekreving,
    harDødsbo,
    setHardødsbo,
    mottakerFetchError,
}: {
    sakId: string;
    tilbakekreving: ManuellTilbakekrevingsbehandling;
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
                    <MottakerForm
                        sakId={sakId}
                        referanseId={tilbakekreving.id}
                        referanseType={'DØDSBO_TILBAKEKREVING'}
                        brevtype={'FORHANDSVARSEL'}
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
