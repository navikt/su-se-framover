import { BodyShort, Box, Label } from '@navikt/ds-react';
import historiskStyles from '~src/features/historiskAlderssak/HistoriskAlderssakVisning.module.less';
import { HistoriskInfotrygdRevurdering as HistoriskInfotrygdRevurderingType } from '~src/types/HistoriskInfotrygdRevurdering';
import { formatDate, formatDateTime } from '~src/utils/date/dateUtils';

const statusTekst: Record<HistoriskInfotrygdRevurderingType['status'], string> = {
    OPPRETTET: 'Opprettet',
    BEREGNET: 'Beregnet',
    TIL_ATTESTERING: 'Til attestering',
    ATTESTERT: 'Attestert',
    UNDERKJENT: 'Underkjent',
    AVSLUTTET: 'Avsluttet',
};

const HistoriskInfotrygdRevurderingsdetaljer = (props: { revurdering: HistoriskInfotrygdRevurderingType }) => (
    <Box background="surface-default" borderWidth="1" borderRadius="medium" padding="5">
        <dl className={historiskStyles.detaljer}>
            <div>
                <Label as="dt" size="small">
                    Behandlings-ID
                </Label>
                <BodyShort as="dd">{props.revurdering.id}</BodyShort>
            </div>
            <div>
                <Label as="dt" size="small">
                    Periode
                </Label>
                <BodyShort as="dd">
                    {formatDate(props.revurdering.periode.fraOgMed)}–{formatDate(props.revurdering.periode.tilOgMed)}
                </BodyShort>
            </div>
            <div>
                <Label as="dt" size="small">
                    Status
                </Label>
                <BodyShort as="dd">{statusTekst[props.revurdering.status]}</BodyShort>
            </div>
            <div>
                <Label as="dt" size="small">
                    Opprettet
                </Label>
                <BodyShort as="dd">{formatDateTime(props.revurdering.opprettet)}</BodyShort>
            </div>
            <div>
                <Label as="dt" size="small">
                    Sist oppdatert
                </Label>
                <BodyShort as="dd">{formatDateTime(props.revurdering.oppdatert)}</BodyShort>
            </div>
        </dl>
    </Box>
);

export default HistoriskInfotrygdRevurderingsdetaljer;
