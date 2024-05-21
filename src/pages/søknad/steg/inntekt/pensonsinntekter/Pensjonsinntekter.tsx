import { Fieldset, TextField } from '@navikt/ds-react';
import { FieldError } from 'react-hook-form';

import SøknadInputliste from '~src/features/søknad/søknadInputliste/SøknadInputliste';

import styles from './pensjonsinntekter.module.less';

const PensjonsInntekter = (props: {
    arr: Array<{ ordning: string; beløp: string }>;
    errors: FieldError | undefined;
    onChange: (element: { index: number; ordning: string; beløp: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    return (
        <SøknadInputliste onLeggTilClick={props.onLeggTilClick} leggTilLabel={'Legg til annen pensjonsgiver'}>
            {props.arr.map((item, idx) => {
                const feltId = (key: keyof typeof item) => `pensjonsInntekt[${idx}].${key}`;
                const errorForLinje = Array.isArray(props.errors) ? props.errors[idx] : null;

                const feltError = (key: keyof typeof item) =>
                    errorForLinje && typeof errorForLinje !== 'string' && errorForLinje[key]?.message;
                return (
                    <SøknadInputliste.Item
                        key={idx}
                        onFjernClick={() => {
                            props.onFjernClick(idx);
                        }}
                        as={Fieldset}
                        legend={`Pensjon ${idx + 1}`}
                    >
                        <div className={styles.itemContainer}>
                            <TextField
                                id={feltId('ordning')}
                                label="Hvem får du pengene fra?"
                                value={item.ordning}
                                onChange={(e) =>
                                    props.onChange({
                                        index: idx,
                                        beløp: item.beløp,
                                        ordning: e.target.value,
                                    })
                                }
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                                autoComplete="on"
                                error={feltError('ordning')}
                            />
                            <TextField
                                id={feltId('beløp')}
                                label="Hvor mye penger får du i måneden?"
                                value={item.beløp}
                                onChange={(e) =>
                                    props.onChange({
                                        index: idx,
                                        beløp: e.target.value,
                                        ordning: item.ordning,
                                    })
                                }
                                autoComplete="off"
                                error={feltError('beløp')}
                            />
                        </div>
                    </SøknadInputliste.Item>
                );
            })}
        </SøknadInputliste>
    );
};

export default PensjonsInntekter;
