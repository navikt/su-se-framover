import { Alert, Button, Loader, VStack } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { Brevtype, hentMottaker } from '~src/api/mottakerClient';
import { MottakerAlert, toMottakerAlert } from '~src/components/mottaker/mottakerUtils';
import { Mottaker } from '~src/pages/saksbehandling/mottaker/Mottaker';

const HISTORISK_REFERANSETYPE = 'HISTORISK_INFOTRYGD_REVURDERING';

const HistoriskInfotrygdMottaker = (props: { sakId: string; revurderingId: string; brevtype: Brevtype }) => {
    const [mottakerFinnes, setMottakerFinnes] = useState<boolean | null>(null);
    const [visMottaker, setVisMottaker] = useState(false);
    const [mottakerFeil, setMottakerFeil] = useState<MottakerAlert | null>(null);

    useEffect(() => {
        let aktiv = true;

        const sjekkMottaker = async () => {
            const resultat = await hentMottaker(
                props.sakId,
                HISTORISK_REFERANSETYPE,
                props.revurderingId,
                props.brevtype,
            );

            if (!aktiv) {
                return;
            }

            if (resultat.status === 'ok') {
                setMottakerFinnes(resultat.data !== null);
                setMottakerFeil(null);
            } else if (resultat.error.statusCode === 404) {
                setMottakerFinnes(false);
                setMottakerFeil(null);
            } else {
                setMottakerFinnes(false);
                setMottakerFeil(toMottakerAlert(resultat.error, 'Kunne ikke hente mottaker.'));
            }
        };

        void sjekkMottaker();
        return () => {
            aktiv = false;
        };
    }, [props.brevtype, props.revurderingId, props.sakId]);

    return (
        <VStack gap="3" align="start">
            {mottakerFeil && (
                <Alert variant={mottakerFeil.variant} size="small">
                    {mottakerFeil.text}
                </Alert>
            )}
            <Button
                variant="secondary"
                type="button"
                size="small"
                disabled={mottakerFinnes === null}
                onClick={() => setVisMottaker((åpen) => !åpen)}
            >
                {visMottaker ? 'Lukk mottaker' : mottakerFinnes ? 'Vis mottaker' : 'Legg til mottaker'}
                {mottakerFinnes === null && <Loader size="small" />}
            </Button>
            {visMottaker && (
                <Mottaker
                    sakId={props.sakId}
                    referanseId={props.revurderingId}
                    referanseType={HISTORISK_REFERANSETYPE}
                    brevtype={props.brevtype}
                    onClose={() => setVisMottaker(false)}
                />
            )}
        </VStack>
    );
};

export default HistoriskInfotrygdMottaker;
