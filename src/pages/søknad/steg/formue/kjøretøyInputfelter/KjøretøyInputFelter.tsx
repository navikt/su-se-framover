import { Fieldset, TextField } from '@navikt/ds-react';
import { FormikErrors } from 'formik';
import * as React from 'react';

import SøknadInputliste from '~features/søknad/søknadInputliste/SøknadInputliste';
import { useI18n } from '~lib/i18n';

import styles from './kjøretøyInputFelter.module.less';

export const kjøretøyMessages = {
    'kjøretøy.regNr': 'Registreringsnummer',
    'kjøretøy.verdi': 'Kjøretøyets verdi',

    'button.fjern.kjøretøy': 'Fjern kjøretøy',
    'button.leggTil.kjøretøy': 'Legg til annet kjøretøy',

    'item.legend': 'Kjøretøy {number}',
};

const KjøretøyInputFelter = (props: {
    arr: Array<{ verdiPåKjøretøy: string; kjøretøyDeEier: string }>;
    errors: string | string[] | Array<FormikErrors<{ verdiPåKjøretøy: string; kjøretøyDeEier: string }>> | undefined;
    feltnavn: string;
    onChange: (element: { index: number; verdiPåKjøretøy: string; kjøretøyDeEier: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    const { formatMessage } = useI18n({ messages: kjøretøyMessages });

    return (
        <div>
            <SøknadInputliste
                leggTilLabel={formatMessage('button.leggTil.kjøretøy')}
                onLeggTilClick={props.onLeggTilClick}
            >
                {props.arr.map((k, index) => {
                    const errorForLinje = Array.isArray(props.errors) ? props.errors[index] : null;
                    const idLink = (key: keyof typeof k) => `${props.feltnavn}[${index}].${key}`;
                    const kjøretøyId = idLink('kjøretøyDeEier');
                    const kjøretøyVerdiId = idLink('verdiPåKjøretøy');
                    return (
                        <SøknadInputliste.Item
                            key={index}
                            as={Fieldset}
                            onFjernClick={() => {
                                props.onFjernClick(index);
                            }}
                            legend={formatMessage('item.legend', {
                                number: index + 1,
                            })}
                        >
                            <div className={styles.itemContainer}>
                                <TextField
                                    id={kjøretøyId}
                                    name={kjøretøyId}
                                    label={formatMessage('kjøretøy.regNr')}
                                    value={k.kjøretøyDeEier}
                                    error={
                                        errorForLinje &&
                                        typeof errorForLinje === 'object' &&
                                        errorForLinje.kjøretøyDeEier
                                    }
                                    onChange={(e) =>
                                        props.onChange({
                                            index,
                                            kjøretøyDeEier: e.target.value,
                                            verdiPåKjøretøy: k.verdiPåKjøretøy,
                                        })
                                    }
                                    autoComplete="off"
                                    // Dette elementet vises ikke ved sidelast
                                    // eslint-disable-next-line jsx-a11y/no-autofocus
                                    autoFocus
                                />
                                <TextField
                                    id={kjøretøyVerdiId}
                                    name={kjøretøyVerdiId}
                                    label={formatMessage('kjøretøy.verdi')}
                                    value={k.verdiPåKjøretøy}
                                    error={
                                        errorForLinje &&
                                        typeof errorForLinje === 'object' &&
                                        errorForLinje.verdiPåKjøretøy
                                    }
                                    onChange={(e) => {
                                        props.onChange({
                                            index,
                                            kjøretøyDeEier: k.kjøretøyDeEier,
                                            verdiPåKjøretøy: e.target.value,
                                        });
                                    }}
                                    autoComplete="off"
                                />
                            </div>
                        </SøknadInputliste.Item>
                    );
                })}
            </SøknadInputliste>
        </div>
    );
};

export default KjøretøyInputFelter;
