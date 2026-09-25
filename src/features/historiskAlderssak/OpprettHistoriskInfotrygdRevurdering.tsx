import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Box, Button, Heading, VStack } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import { FormEvent, useMemo, useState } from 'react';

import { opprettHistoriskInfotrygdRevurdering } from '~src/api/historiskAlderssakApi';
import { ApiErrorCode } from '~src/components/apiErrorAlert/apiErrorCode';
import { RangePickerMonth } from '~src/components/inputs/datePicker/DatePicker';
import { useApiCall } from '~src/lib/hooks';
import { HistoriskVedtaksperiode } from '~src/types/HistoriskAlderssak';
import { NullablePeriode } from '~src/types/Periode';
import {
    parseNonNullableIsoDateOnly,
    sluttenAvMåneden,
    startenPåMnd,
    toIsoDateOnlyString,
} from '~src/utils/date/dateUtils';

import HistoriskAlderssakApiErrorAlert from './HistoriskAlderssakApiErrorAlert';

interface Props {
    fnr: string;
    vedtaksperioder: HistoriskVedtaksperiode[];
    onOpprettet: (revurderingId: string, sakId: string) => void;
}

const finnYttergrenser = (vedtaksperioder: HistoriskVedtaksperiode[]) => {
    const perioderMedDato = vedtaksperioder.flatMap((periode) =>
        periode.fraOgMed && periode.tilOgMed
            ? [
                  {
                      fraOgMed: parseNonNullableIsoDateOnly(periode.fraOgMed),
                      tilOgMed: parseNonNullableIsoDateOnly(periode.tilOgMed),
                  },
              ]
            : [],
    );

    if (perioderMedDato.length === 0) {
        return null;
    }

    return {
        fraOgMed: DateFns.min(perioderMedDato.map((periode) => periode.fraOgMed)),
        tilOgMed: DateFns.max(perioderMedDato.map((periode) => periode.tilOgMed)),
    };
};

const OpprettHistoriskInfotrygdRevurdering = (props: Props) => {
    const yttergrenser = useMemo(() => finnYttergrenser(props.vedtaksperioder), [props.vedtaksperioder]);
    const [periode, setPeriode] = useState<NullablePeriode>({ fraOgMed: null, tilOgMed: null });
    const [valideringsfeil, setValideringsfeil] = useState<{
        fraOgMed?: string;
        tilOgMed?: string;
    }>({});
    const [opprettStatus, opprett] = useApiCall(opprettHistoriskInfotrygdRevurdering);

    if (!yttergrenser) {
        return <Alert variant="info">Ingen vedtaksperioder med gyldige datoer kan revurderes.</Alert>;
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const feil = {
            fraOgMed: periode.fraOgMed ? undefined : 'Velg første måned i perioden.',
            tilOgMed: periode.tilOgMed ? undefined : 'Velg siste måned i perioden.',
        };

        if (periode.fraOgMed && periode.tilOgMed && DateFns.isAfter(periode.fraOgMed, periode.tilOgMed)) {
            feil.tilOgMed = 'Siste måned må være lik eller senere enn første måned.';
        }

        setValideringsfeil(feil);

        if (!periode.fraOgMed || !periode.tilOgMed || feil.tilOgMed) {
            return;
        }

        opprett(
            {
                fnr: props.fnr,
                periode: {
                    fraOgMed: toIsoDateOnlyString(startenPåMnd(periode.fraOgMed)),
                    tilOgMed: toIsoDateOnlyString(sluttenAvMåneden(periode.tilOgMed)),
                },
            },
            (revurdering) => props.onOpprettet(revurdering.id, revurdering.sakId),
            (error) => {
                if (
                    error.body.code === ApiErrorCode.HISTORISK_INFOTRYGD_OVERLAPPER_ÅPEN_BEHANDLING &&
                    error.body.eksisterendeRevurderingId &&
                    error.body.sakId
                ) {
                    props.onOpprettet(error.body.eksisterendeRevurderingId, error.body.sakId);
                }
            },
        );
    };

    return (
        <Box background="surface-subtle" borderWidth="1" borderRadius="medium" padding="5">
            <form onSubmit={handleSubmit}>
                <VStack gap="5" align="start">
                    <div>
                        <Heading level="2" size="medium" spacing>
                            Start historisk revurdering
                        </Heading>
                        <BodyShort>
                            Velg en sammenhengende periode med hele måneder. Alle månedene må være dekket av historiske
                            Infotrygd-vedtak.
                        </BodyShort>
                    </div>

                    <RangePickerMonth
                        name="periode"
                        value={periode}
                        fromDate={yttergrenser.fraOgMed}
                        toDate={yttergrenser.tilOgMed}
                        onChange={setPeriode}
                        error={valideringsfeil}
                    />

                    {RemoteData.isFailure(opprettStatus) && (
                        <HistoriskAlderssakApiErrorAlert error={opprettStatus.error} />
                    )}

                    <Button type="submit" loading={RemoteData.isPending(opprettStatus)}>
                        Start revurdering
                    </Button>
                </VStack>
            </form>
        </Box>
    );
};

export default OpprettHistoriskInfotrygdRevurdering;
