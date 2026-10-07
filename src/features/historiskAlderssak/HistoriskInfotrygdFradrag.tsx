import { Box, Button, Checkbox, HStack, Select, TextField, VStack } from '@navikt/ds-react';

import { VelgbareFradragskategorier } from '~src/types/Fradrag';
import {
    HistoriskInfotrygdFradragForMåned,
    HistoriskInfotrygdFradragTilhører,
} from '~src/types/HistoriskInfotrygdRevurdering';

interface Props {
    fradrag: HistoriskInfotrygdFradragForMåned;
    kanRedigeres: boolean;
    onOppdatert: (oppdater: (fradrag: HistoriskInfotrygdFradragForMåned) => HistoriskInfotrygdFradragForMåned) => void;
    onFjern: () => void;
}

const HistoriskInfotrygdFradrag = ({ fradrag, kanRedigeres, onOppdatert, onFjern }: Props) => (
    <Box background="surface-default" padding="4">
        <VStack gap="3">
            <HStack gap="4" wrap>
                <Select
                    label="Type"
                    value={fradrag.type}
                    readOnly={!kanRedigeres}
                    onChange={(event) => onOppdatert((verdi) => ({ ...verdi, type: event.target.value }))}
                >
                    {Object.values(VelgbareFradragskategorier).map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </Select>
                <TextField
                    label="Månedsbeløp"
                    inputMode="decimal"
                    value={fradrag.månedsbeløp}
                    readOnly={!kanRedigeres}
                    onChange={(event) =>
                        onOppdatert((verdi) => ({ ...verdi, månedsbeløp: Number(event.target.value) }))
                    }
                />
                <Select
                    label="Tilhører"
                    value={fradrag.tilhører}
                    readOnly={!kanRedigeres}
                    onChange={(event) =>
                        onOppdatert((verdi) => ({
                            ...verdi,
                            tilhører: event.target.value as HistoriskInfotrygdFradragTilhører,
                        }))
                    }
                >
                    <option value="BRUKER">Brukeren</option>
                    <option value="EPS">Ektefellen</option>
                </Select>
            </HStack>
            {fradrag.type === VelgbareFradragskategorier.Annet && (
                <TextField
                    label="Beskrivelse"
                    value={fradrag.beskrivelse ?? ''}
                    readOnly={!kanRedigeres}
                    onChange={(event) => onOppdatert((verdi) => ({ ...verdi, beskrivelse: event.target.value }))}
                />
            )}
            <Checkbox
                checked={fradrag.utenlandskInntekt !== null}
                readOnly={!kanRedigeres}
                onChange={(event) =>
                    onOppdatert((verdi) => ({
                        ...verdi,
                        utenlandskInntekt: event.target.checked
                            ? { beløpIUtenlandskValuta: 0, valuta: '', kurs: 0 }
                            : null,
                    }))
                }
            >
                Utenlandsk inntekt
            </Checkbox>
            {fradrag.utenlandskInntekt && (
                <HStack gap="4" wrap>
                    <TextField
                        label="Beløp i utenlandsk valuta"
                        inputMode="decimal"
                        value={fradrag.utenlandskInntekt.beløpIUtenlandskValuta}
                        readOnly={!kanRedigeres}
                        onChange={(event) =>
                            onOppdatert((verdi) =>
                                verdi.utenlandskInntekt
                                    ? {
                                          ...verdi,
                                          utenlandskInntekt: {
                                              ...verdi.utenlandskInntekt,
                                              beløpIUtenlandskValuta: Number(event.target.value),
                                          },
                                      }
                                    : verdi,
                            )
                        }
                    />
                    <TextField
                        label="Valuta"
                        value={fradrag.utenlandskInntekt.valuta}
                        readOnly={!kanRedigeres}
                        onChange={(event) =>
                            onOppdatert((verdi) =>
                                verdi.utenlandskInntekt
                                    ? {
                                          ...verdi,
                                          utenlandskInntekt: {
                                              ...verdi.utenlandskInntekt,
                                              valuta: event.target.value,
                                          },
                                      }
                                    : verdi,
                            )
                        }
                    />
                    <TextField
                        label="Kurs"
                        inputMode="decimal"
                        value={fradrag.utenlandskInntekt.kurs}
                        readOnly={!kanRedigeres}
                        onChange={(event) =>
                            onOppdatert((verdi) =>
                                verdi.utenlandskInntekt
                                    ? {
                                          ...verdi,
                                          utenlandskInntekt: {
                                              ...verdi.utenlandskInntekt,
                                              kurs: Number(event.target.value),
                                          },
                                      }
                                    : verdi,
                            )
                        }
                    />
                </HStack>
            )}
            {kanRedigeres && (
                <Button type="button" variant="tertiary" onClick={onFjern}>
                    Fjern fradrag
                </Button>
            )}
        </VStack>
    </Box>
);

export default HistoriskInfotrygdFradrag;
