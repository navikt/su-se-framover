import * as RemoteData from '@devexperts/remote-data-ts';
import { Box, Button, Heading, Textarea, VStack } from '@navikt/ds-react';
import { FormEvent, useState } from 'react';
import { avsluttHistoriskInfotrygdRevurdering } from '~src/api/historiskAlderssakApi';
import HistoriskAlderssakApiErrorAlert from '~src/features/historiskAlderssak/HistoriskAlderssakApiErrorAlert';
import { useApiCall } from '~src/lib/hooks';

const AvsluttHistoriskInfotrygdRevurdering = (props: {
    revurderingId: string;
    onAvsluttet: () => void;
    disabled: boolean;
}) => {
    const [begrunnelse, setBegrunnelse] = useState('');
    const [begrunnelseFeil, setBegrunnelseFeil] = useState<string>();
    const [avsluttStatus, avslutt] = useApiCall(avsluttHistoriskInfotrygdRevurdering);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (props.disabled || RemoteData.isPending(avsluttStatus)) return;
        const trimmetBegrunnelse = begrunnelse.trim();

        if (!trimmetBegrunnelse) {
            setBegrunnelseFeil('Skriv hvorfor behandlingen skal avsluttes.');
            return;
        }

        setBegrunnelseFeil(undefined);
        avslutt(
            {
                revurderingId: props.revurderingId,
                body: { begrunnelse: trimmetBegrunnelse },
            },
            props.onAvsluttet,
        );
    };

    return (
        <Box background="surface-default" borderWidth="1" borderRadius="medium" padding="5">
            <form onSubmit={handleSubmit}>
                <VStack gap="4" align="start">
                    <Heading level="2" size="medium">
                        Avslutt behandlingen
                    </Heading>
                    <Textarea
                        label="Begrunnelse"
                        description="Forklar hvorfor behandlingen skal avsluttes."
                        value={begrunnelse}
                        onChange={(event) => setBegrunnelse(event.target.value)}
                        error={begrunnelseFeil}
                        readOnly={props.disabled || RemoteData.isPending(avsluttStatus)}
                    />
                    {RemoteData.isFailure(avsluttStatus) && (
                        <HistoriskAlderssakApiErrorAlert error={avsluttStatus.error} />
                    )}
                    <Button
                        type="submit"
                        variant="danger"
                        loading={RemoteData.isPending(avsluttStatus)}
                        disabled={props.disabled}
                    >
                        Avslutt behandlingen
                    </Button>
                </VStack>
            </form>
        </Box>
    );
};

export default AvsluttHistoriskInfotrygdRevurdering;
