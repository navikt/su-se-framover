import { Button, Label, Select, VStack } from '@navikt/ds-react';

import { VelgbareFradragskategorier } from '~src/types/Fradrag';
import {
    HistoriskInfotrygdBeregningsgrunnlagForMåned,
    HistoriskInfotrygdFradragForMåned,
    HistoriskInfotrygdSatskategori,
} from '~src/types/HistoriskInfotrygdRevurdering';

import HistoriskInfotrygdFradrag from './HistoriskInfotrygdFradrag';

interface Props {
    måned: HistoriskInfotrygdBeregningsgrunnlagForMåned;
    kanRedigeres: boolean;
    onOppdatert: (
        oppdater: (måned: HistoriskInfotrygdBeregningsgrunnlagForMåned) => HistoriskInfotrygdBeregningsgrunnlagForMåned,
    ) => void;
}

const satskategorier: { value: HistoriskInfotrygdSatskategori; label: string }[] = [
    { value: 'EN', label: 'Enslig' },
    { value: 'EU', label: 'Ektefelle under 67 år' },
    { value: 'EO', label: 'Ektefelle over 67 år' },
    { value: 'EV', label: 'Enslig med bofellesskap' },
];

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
            label="Satskategori"
            value={måned.satskategori}
            readOnly={!kanRedigeres}
            onChange={(event) =>
                onOppdatert((verdi) => ({
                    ...verdi,
                    satskategori: event.target.value as HistoriskInfotrygdSatskategori,
                }))
            }
        >
            {satskategorier.map((kategori) => (
                <option
                    key={kategori.value}
                    value={kategori.value}
                    disabled={kategori.value === 'EV' && måned.måned < '2016-01'}
                >
                    {kategori.label}
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
