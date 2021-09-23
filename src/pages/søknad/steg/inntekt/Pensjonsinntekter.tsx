import { Button } from '@navikt/ds-react';
import classNames from 'classnames';
import { FormikErrors } from 'formik';
import { Input } from 'nav-frontend-skjema';
import * as React from 'react';

import { useI18n } from '~lib/i18n';

import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

export const pensjonsinntekterMessages = {
    'mottarPensjon.fra': 'Hvem får du pengene fra?',
    'mottarPensjon.beløp': 'Hvor mye penger får du i måneden?',
    'button.fjern.pensjonsgiver': 'Fjern pensjonsgiver',
    'button.leggTil.pensjonsgiver': 'Legg til annen pensjonsgiver',
};

const PensjonsInntekter = (props: {
    arr: Array<{ ordning: string; beløp: string }>;
    errors: string | string[] | Array<FormikErrors<{ ordning: string; beløp: string }>> | undefined;
    onChange: (element: { index: number; ordning: string; beløp: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...pensjonsinntekterMessages } });

    return (
        <ul>
            {props.arr.map((item: { ordning: string; beløp: string }, idx: number) => {
                const feltId = (key: keyof typeof item) => `pensjonsInntekt[${idx}].${key}`;
                const errorForLinje = Array.isArray(props.errors) ? props.errors[idx] : null;

                const feltError = (key: keyof typeof item) =>
                    errorForLinje && typeof errorForLinje !== 'string' && errorForLinje[key];

                return (
                    <li
                        className={classNames(sharedStyles.inputFelterOgFjernKnappContainer, {
                            [sharedStyles.radfeil]: errorForLinje && typeof errorForLinje === 'object',
                        })}
                        key={idx}
                    >
                        <Input
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
                            feil={feltError('ordning')}
                        />
                        <Input
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
                            feil={feltError('beløp')}
                        />
                        <Button
                            variant="secondary"
                            type="button"
                            size="small"
                            className={classNames(sharedStyles.fjernradknapp, {
                                [sharedStyles.skjult]: props.arr.length < 2,
                            })}
                            onClick={() => props.onFjernClick(idx)}
                        >
                            {formatMessage('button.fjern.pensjonsgiver')}
                        </Button>
                    </li>
                );
            })}
            <div className={sharedStyles.leggTilFeltKnapp}>
                <Button variant="secondary" onClick={() => props.onLeggTilClick()} type="button">
                    {formatMessage('button.leggTil.pensjonsgiver')}
                </Button>
            </div>
        </ul>
    );
};

export default PensjonsInntekter;
