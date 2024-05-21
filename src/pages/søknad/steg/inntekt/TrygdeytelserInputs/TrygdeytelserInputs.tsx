import { Fieldset, TextField } from '@navikt/ds-react';
import { FieldError } from 'react-hook-form';

import SøknadInputliste from '~src/features/søknad/søknadInputliste/SøknadInputliste';

import styles from './trygdeytelserInputs.module.less';

const TrygdeytelserInputFelter = (props: {
    arr: Array<{ beløp: string; type: string; valuta: string }>;
    errors: FieldError | undefined;
    feltnavn: string;
    onChange: (element: { index: number; beløp: string; type: string; valuta: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    return (
        <SøknadInputliste leggTilLabel={'Legg til annen trygdeytelse'} onLeggTilClick={props.onLeggTilClick}>
            {props.arr.map((input, idx) => {
                const errorForLinje = Array.isArray(props.errors) ? props.errors[idx] : null;
                const feltId = (felt: keyof typeof input) => `${props.feltnavn}[${idx}].${felt}`;
                const beløpId = feltId('beløp');
                const typeId = feltId('type');
                const valutaId = feltId('valuta');
                return (
                    <SøknadInputliste.Item
                        key={idx}
                        onFjernClick={() => {
                            props.onFjernClick(idx);
                        }}
                        as={Fieldset}
                        legend={`Trygdeytelse ${idx + 1}`}
                    >
                        <div className={styles.trygdeytelseItemContainer}>
                            <TextField
                                id={beløpId}
                                name={beløpId}
                                label={'Hvor mye får du i lokal valuta i måneden?'}
                                value={input.beløp}
                                onChange={(e) => {
                                    props.onChange({
                                        index: idx,
                                        beløp: e.target.value,
                                        type: input.type,
                                        valuta: input.valuta,
                                    });
                                }}
                                autoComplete="off"
                                error={
                                    errorForLinje && typeof errorForLinje === 'object' && errorForLinje.beløp?.message
                                }
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                            <TextField
                                id={valutaId}
                                name={valutaId}
                                label={'Valuta'}
                                value={input.valuta}
                                onChange={(e) => {
                                    props.onChange({
                                        index: idx,
                                        beløp: input.beløp,
                                        type: input.type,
                                        valuta: e.target.value,
                                    });
                                }}
                                autoComplete="on"
                                error={
                                    errorForLinje && typeof errorForLinje === 'object' && errorForLinje.valuta?.message
                                }
                            />
                            <TextField
                                id={typeId}
                                name={typeId}
                                label={'Type ytelse'}
                                value={input.type}
                                onChange={(e) => {
                                    props.onChange({
                                        index: idx,
                                        beløp: input.beløp,
                                        type: e.target.value,
                                        valuta: input.valuta,
                                    });
                                }}
                                autoComplete="off"
                                error={
                                    errorForLinje && typeof errorForLinje === 'object' && errorForLinje.type?.message
                                }
                            />
                        </div>
                    </SøknadInputliste.Item>
                );
            })}
        </SøknadInputliste>
    );
};

export default TrygdeytelserInputFelter;
