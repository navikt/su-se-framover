import classNames from 'classnames';
import { FormikErrors } from 'formik';
import { Knapp } from 'nav-frontend-knapper';
import { Input } from 'nav-frontend-skjema';
import * as React from 'react';

import { useI18n } from '~lib/hooks';

import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

export const kjøretøyMessages = {
    'kjøretøy.regNr': 'Registreringsnummer',
    'kjøretøy.verdi': 'Kjøretøyets verdi',

    'button.fjern.kjøretøy': 'Fjern kjøretøy',
    'button.leggTil.kjøretøy': 'Legg til annet kjøretøy',
};

const KjøretøyInputFelter = (props: {
    arr: Array<{ verdiPåKjøretøy: string; kjøretøyDeEier: string }>;
    errors: string | string[] | Array<FormikErrors<{ verdiPåKjøretøy: string; kjøretøyDeEier: string }>> | undefined;
    feltnavn: string;
    onChange: (element: { index: number; verdiPåKjøretøy: string; kjøretøyDeEier: string }) => void;
    onLeggTilClick: () => void;
    onFjernClick: (index: number) => void;
}) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...kjøretøyMessages } });

    return (
        <ul>
            {props.arr.map((input, idx) => {
                const errorForLinje = Array.isArray(props.errors) ? props.errors[idx] : null;
                const idLink = (key: keyof typeof input) => `${props.feltnavn}[${idx}].${key}`;
                const kjøretøyId = idLink('kjøretøyDeEier');
                const kjøretøyVerdiId = idLink('verdiPåKjøretøy');

                return (
                    <li
                        className={classNames(sharedStyles.inputFelterOgFjernKnappContainer, {
                            [sharedStyles.radfeil]: errorForLinje && typeof errorForLinje === 'object',
                        })}
                        key={idx}
                    >
                        <Input
                            id={kjøretøyId}
                            name={kjøretøyId}
                            label={formatMessage('kjøretøy.regNr')}
                            value={input.kjøretøyDeEier}
                            feil={errorForLinje && typeof errorForLinje === 'object' && errorForLinje.kjøretøyDeEier}
                            onChange={(e) =>
                                props.onChange({
                                    index: idx,
                                    kjøretøyDeEier: e.target.value,
                                    verdiPåKjøretøy: input.verdiPåKjøretøy,
                                })
                            }
                            autoComplete="off"
                            // Dette elementet vises ikke ved sidelast
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                        />
                        <Input
                            id={kjøretøyVerdiId}
                            name={kjøretøyVerdiId}
                            label={formatMessage('kjøretøy.verdi')}
                            value={input.verdiPåKjøretøy}
                            feil={errorForLinje && typeof errorForLinje === 'object' && errorForLinje.verdiPåKjøretøy}
                            onChange={(e) => {
                                props.onChange({
                                    index: idx,
                                    kjøretøyDeEier: input.kjøretøyDeEier,
                                    verdiPåKjøretøy: e.target.value,
                                });
                            }}
                            autoComplete="off"
                        />
                        <Knapp
                            className={classNames(sharedStyles.fjernradknapp, {
                                [sharedStyles.skjult]: props.arr.length < 2,
                            })}
                            onClick={() => props.onFjernClick(idx)}
                            htmlType="button"
                        >
                            {formatMessage('button.fjern.kjøretøy')}
                        </Knapp>
                        {errorForLinje && typeof errorForLinje === 'string' && errorForLinje}
                    </li>
                );
            })}
            <div className={sharedStyles.leggTilFeltKnapp}>
                <Knapp onClick={() => props.onLeggTilClick()} htmlType="button">
                    {formatMessage('button.leggTil.kjøretøy')}
                </Knapp>
            </div>
        </ul>
    );
};

export default KjøretøyInputFelter;
