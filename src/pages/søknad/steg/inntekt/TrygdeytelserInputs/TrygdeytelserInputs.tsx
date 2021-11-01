import { Fieldset, TextField } from '@navikt/ds-react';
import { FormikErrors } from 'formik';
import * as React from 'react';

import SøknadInputliste from '~features/søknad/søknadInputliste/SøknadInputliste';
import { useI18n } from '~lib/i18n';

import styles from './trygdeytelserInputs.module.less';

export const trygdeytelserMessages = {
    'trygdeytelserIUtlandet.beløp': 'Hvor mye får du i lokal valuta i måneden?',
    'trygdeytelserIUtlandet.ytelse': 'Type ytelse',
    'trygdeytelserIUtlandet.valuta': 'Valuta',
    'button.fjern.trygdeytelse': 'Fjern trygdeytelse',
    'button.leggTil.trygdeytelse': 'Legg til annen trygdeytelse',

    'trygdeytelse.legend': 'Trygdeytelse {number}',
};

const TrygdeytelserInputFelter = (props: {
    arr: Array<{ beløp: string; type: string; valuta: string }>;
    errors: string | string[] | Array<FormikErrors<{ beløp: string; type: string; valuta: string }>> | undefined;
    feltnavn: string;
    onChange: (element: { index: number; beløp: string; type: string; valuta: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    const { formatMessage } = useI18n({ messages: trygdeytelserMessages });

    return (
        <SøknadInputliste
            leggTilLabel={formatMessage('button.leggTil.trygdeytelse')}
            onLeggTilClick={props.onLeggTilClick}
        >
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
                        legend={formatMessage('trygdeytelse.legend', {
                            number: idx + 1,
                        })}
                    >
                        <div className={styles.trygdeytelseItemContainer}>
                            <TextField
                                id={beløpId}
                                name={beløpId}
                                label={formatMessage('trygdeytelserIUtlandet.beløp')}
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
                                error={errorForLinje && typeof errorForLinje === 'object' && errorForLinje.beløp}
                                // Dette elementet vises ikke ved sidelast
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                            />
                            <TextField
                                id={valutaId}
                                name={valutaId}
                                label={formatMessage('trygdeytelserIUtlandet.valuta')}
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
                                error={errorForLinje && typeof errorForLinje === 'object' && errorForLinje.valuta}
                            />
                            <TextField
                                id={typeId}
                                name={typeId}
                                label={formatMessage('trygdeytelserIUtlandet.ytelse')}
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
                                error={errorForLinje && typeof errorForLinje === 'object' && errorForLinje.type}
                            />
                        </div>
                    </SøknadInputliste.Item>
                );
            })}
        </SøknadInputliste>
    );
};

export default TrygdeytelserInputFelter;
