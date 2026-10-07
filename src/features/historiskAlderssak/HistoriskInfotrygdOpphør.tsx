import { BodyShort, Select } from '@navikt/ds-react';
import { HistoriskInfotrygdManuellOpphørsgrunn } from '~src/types/HistoriskInfotrygdRevurdering';

interface Props {
    opphørsgrunnForPerioden: HistoriskInfotrygdManuellOpphørsgrunn | null;
    kanRedigeres: boolean;
    valideringsfeil: string | undefined;
    setOpphørsgrunnForPerioden: (grunn: HistoriskInfotrygdManuellOpphørsgrunn | null) => void;
    setValideringsfeil: (feil: string | undefined) => void;
}

const opphørsgrunner: { value: HistoriskInfotrygdManuellOpphørsgrunn; label: string }[] = [
    { value: 'FORMUE', label: 'Formue' },
    { value: 'UTENLANDSOPPHOLD', label: 'Utenlandsopphold' },
    { value: 'MANGLENDE_DOKUMENTASJON', label: 'Manglende dokumentasjon' },
    { value: 'OPPHOLDSTILLATELSE', label: 'Oppholdstillatelse' },
    { value: 'FLYKTNING', label: 'Flyktningstatus' },
    { value: 'BOR_OG_OPPHOLDER_SEG_I_NORGE', label: 'Bor og oppholder seg i Norge' },
    { value: 'PERSONLIG_OPPMØTE', label: 'Personlig oppmøte' },
    { value: 'INNLAGT_PÅ_INSTITUSJON', label: 'Innlagt på institusjon' },
    { value: 'ALDERSPENSJON', label: 'Alderspensjon' },
    { value: 'FAMILIEGJENFORENING', label: 'Familiegjenforening' },
];

export const HistoriskInfotrygdOpphørsgrunnForMåned = ({
    opphørsgrunnForPerioden,
}: Pick<Props, 'opphørsgrunnForPerioden'>) => (
    <BodyShort>
        Opphørsgrunn for måneden:{' '}
        {opphørsgrunner.find((grunn) => grunn.value === opphørsgrunnForPerioden)?.label ??
            'Velg opphørsgrunn for hele perioden'}
    </BodyShort>
);

const HistoriskInfotrygdOpphør = ({
    opphørsgrunnForPerioden,
    kanRedigeres,
    valideringsfeil,
    setOpphørsgrunnForPerioden,
    setValideringsfeil,
}: Props) => (
    <Select
        label="Opphørsgrunn for hele perioden"
        value={opphørsgrunnForPerioden ?? ''}
        readOnly={!kanRedigeres}
        error={valideringsfeil === 'Velg opphørsgrunn for hele perioden.' ? valideringsfeil : undefined}
        onChange={(event) => {
            setOpphørsgrunnForPerioden(event.target.value as HistoriskInfotrygdManuellOpphørsgrunn);
            setValideringsfeil(undefined);
        }}
    >
        <option value="">Velg opphørsgrunn</option>
        {opphørsgrunner.map((grunn) => (
            <option key={grunn.value} value={grunn.value}>
                {grunn.label}
            </option>
        ))}
    </Select>
);

export default HistoriskInfotrygdOpphør;
