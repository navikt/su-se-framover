import { Button, TextField } from '@navikt/ds-react';
import { FormikErrors } from 'formik';
import * as React from 'react';

import { useI18n } from '~lib/i18n';

import sharedStyles from '../../../steg-shared.module.less';
import sharedI18n from '../../steg-shared-i18n';

import styles from './trygdeytelserInputs.module.less';

export const trygdeytelserMessages = {
    'trygdeytelserIUtlandet.beløp': 'Hvor mye får du i lokal valuta i måneden?',
    'trygdeytelserIUtlandet.ytelse': 'Type ytelse',
    'trygdeytelserIUtlandet.valuta': 'Valuta',
    'button.fjern.trygdeytelse': 'Fjern trygdeytelse',
    'button.leggTil.trygdeytelse': 'Legg til annen trygdeytelse',
};

const TrygdeytelserInputFelter = (props: {
    arr: Array<{ beløp: string; type: string; valuta: string }>;
    errors: string | string[] | Array<FormikErrors<{ beløp: string; type: string; valuta: string }>> | undefined;
    feltnavn: string;
    onChange: (element: { index: number; beløp: string; type: string; valuta: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...trygdeytelserMessages } });

    return (
        <ul>
            {props.arr.map((input, idx) => {
                const errorForLinje = Array.isArray(props.errors) ? props.errors[idx] : null;
                const feltId = (felt: keyof typeof input) => `${props.feltnavn}[${idx}].${felt}`;
                const beløpId = feltId('beløp');
                const typeId = feltId('type');
                const valutaId = feltId('valuta');

                return (
                    <li className={styles.trygdeytelserContainer} key={idx}>
                        <div className={styles.trippleFelter}>
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
                        {props.arr.length > 1 && (
                            <Button
                                variant="secondary"
                                className={styles.fjernFeltButton}
                                onClick={() => props.onFjernClick(idx)}
                                type="button"
                            >
                                {formatMessage('button.fjern.trygdeytelse')}
                            </Button>
                        )}
                        {errorForLinje && typeof errorForLinje === 'string' && errorForLinje}
                    </li>
                );
            })}
            <div className={sharedStyles.leggTilFeltKnapp}>
                <Button variant="secondary" onClick={() => props.onLeggTilClick()} type="button">
                    {formatMessage('button.leggTil.trygdeytelse')}
                </Button>
            </div>
        </ul>
    );
};

export default TrygdeytelserInputFelter;
