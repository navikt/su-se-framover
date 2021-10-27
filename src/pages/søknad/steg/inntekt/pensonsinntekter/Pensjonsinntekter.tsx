import { Fieldset, TextField } from '@navikt/ds-react';
import { FormikErrors } from 'formik';
import * as React from 'react';

import SøknadInputliste from '~features/søknad/søknadInputliste/SøknadInputliste';
import { useI18n } from '~lib/i18n';

import styles from './pensjonsinntekter.module.less';

export const pensjonsinntekterMessages = {
    'mottarPensjon.fra': 'Hvem får du pengene fra?',
    'mottarPensjon.beløp': 'Hvor mye penger får du i måneden?',
    'button.leggTil.pensjonsgiver': 'Legg til annen pensjonsgiver',

    'pensjonsgiver.legend': 'Pensjonsgiver {number}',
};

const PensjonsInntekter = (props: {
    arr: Array<{ ordning: string; beløp: string }>;
    errors: string | string[] | Array<FormikErrors<{ ordning: string; beløp: string }>> | undefined;
    onChange: (element: { index: number; ordning: string; beløp: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    const { formatMessage } = useI18n({ messages: pensjonsinntekterMessages });

    return (
        <SøknadInputliste
            onLeggTilClick={props.onLeggTilClick}
            leggTilLabel={formatMessage('button.leggTil.pensjonsgiver')}
        >
            {props.arr.map((item, idx) => {
                const feltId = (key: keyof typeof item) => `pensjonsInntekt[${idx}].${key}`;
                const errorForLinje = Array.isArray(props.errors) ? props.errors[idx] : null;

                const feltError = (key: keyof typeof item) =>
                    errorForLinje && typeof errorForLinje !== 'string' && errorForLinje[key];
                return (
                    <SøknadInputliste.Item
                        key={idx}
                        onFjernClick={() => {
                            props.onFjernClick(idx);
                        }}
                        as={Fieldset}
                        legend={formatMessage('pensjonsgiver.legend', {
                            number: idx + 1,
                        })}
                        hideLegend
                    >
                        <div className={styles.itemContainer}>
                            <TextField
                                id={feltId('ordning')}
                                label={formatMessage('mottarPensjon.fra')}
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
                                label={formatMessage('mottarPensjon.beløp')}
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
