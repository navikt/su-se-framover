import { Button, Label, Select, VStack } from '@navikt/ds-react';

import { VelgbareFradragskategorier } from '~src/types/Fradrag';
import {
    HistoriskInfotrygdFradragForMåned,
    HistoriskInfotrygdMånedsutkast,
    HistoriskInfotrygdRevurderingsbosituasjon,
} from '~src/types/HistoriskInfotrygdRevurdering';

import HistoriskInfotrygdFradrag from './HistoriskInfotrygdFradrag';

interface Props {
    måned: HistoriskInfotrygdMånedsutkast;
    kanRedigeres: boolean;
    onOppdatert: (oppdater: (måned: HistoriskInfotrygdMånedsutkast) => HistoriskInfotrygdMånedsutkast) => void;
}

const bosituasjoner: { value: HistoriskInfotrygdRevurderingsbosituasjon; label: string }[] = [
    { value: 'ENSLIG', label: 'Enslig' },
    { value: 'EPS_UNDER_67', label: 'EPS under 67 år' },
    { value: 'EPS_OVER_67', label: 'EPS 67 år eller eldre' },
    { value: 'ENSLIG_MED_BOFELLESSKAP', label: 'Enslig med bofellesskap' },
    { value: 'EPS_UNDER_67_UFØR_FLYKTNING', label: 'EPS under 67 år, ufør flyktning' },
];

const bosituasjonerForMåned = (måned: string) =>
    bosituasjoner.filter((bosituasjon) => bosituasjon.value !== 'EPS_UNDER_67_UFØR_FLYKTNING' || måned >= '2021-01');

const tomtFradrag = (): HistoriskInfotrygdFradragForMåned => ({
    type: VelgbareFradragskategorier.Alderspensjon,
    beskrivelse: null,
    månedsbeløp: 0,
    utenlandskInntekt: null,
    tilhører: 'BRUKER',
});

const HistoriskInfotrygdYtelse = ({ måned, kanRedigeres, onOppdatert }: Props) => (
    <>
        <Select
            label="Bosituasjon"
            value={måned.bosituasjon ?? ''}
            readOnly={!kanRedigeres}
            onChange={(event) =>
                onOppdatert((verdi) => ({
                    ...verdi,
                    bosituasjon:
                        bosituasjonerForMåned(måned.måned).find(
                            (bosituasjon) => bosituasjon.value === event.target.value,
                        )?.value ?? null,
                }))
            }
        >
            <option value="">Velg bosituasjon</option>
            {bosituasjonerForMåned(måned.måned).map((bosituasjon) => (
                <option key={bosituasjon.value} value={bosituasjon.value}>
                    {bosituasjon.label}
                </option>
            ))}
        </Select>
        <VStack gap="3">
            <Label>Fradrag</Label>
            {måned.fradrag.map((fradrag, fradragIndex) => (
                <HistoriskInfotrygdFradrag
                    key={`${måned.måned}-${fradragIndex}`}
                    fradrag={fradrag}
                    kanRedigeres={kanRedigeres}
                    onOppdatert={(oppdater) =>
                        onOppdatert((verdi) => ({
                            ...verdi,
                            fradrag: verdi.fradrag.map((gjeldende, i) =>
                                i === fradragIndex ? oppdater(gjeldende) : gjeldende,
                            ),
                        }))
                    }
                    onFjern={() =>
                        onOppdatert((verdi) => ({
                            ...verdi,
                            fradrag: verdi.fradrag.filter((_, i) => i !== fradragIndex),
                        }))
                    }
                />
            ))}
            {kanRedigeres && (
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                        onOppdatert((verdi) => ({
                            ...verdi,
                            fradrag: [...verdi.fradrag, tomtFradrag()],
                        }))
                    }
                >
                    Legg til fradrag
                </Button>
            )}
        </VStack>
    </>
);

export default HistoriskInfotrygdYtelse;
