import { Checkbox, Label } from '@navikt/ds-react';
import * as DateFns from 'date-fns';
import React from 'react';

import DatePicker from '~src/components/datePicker/DatePicker';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { RestansStatus, RestansType } from '~src/types/Restans';

import messages from './filter-nb';
import * as styles from './filter.module.less';

export type RestansTypeFilter = {
    [RestansType.SØKNADSBEHANDLING]: boolean;
    [RestansType.REVURDERING]: boolean;
    [RestansType.KLAGE]: boolean;
    [RestansType.REGULERING]: boolean;
};

export type RestansStatusFilter = {
    [RestansStatus.NY_SØKNAD]: boolean;
    [RestansStatus.UNDER_BEHANDLING]: boolean;
    [RestansStatus.TIL_ATTESTERING]: boolean;
    [RestansStatus.UNDERKJENT]: boolean;
};

export type RestansResultatFilter = {
    [RestansStatus.OPPHØR]: boolean;
    [RestansStatus.AVSLAG]: boolean;
    [RestansStatus.INGEN_ENDRING]: boolean;
    [RestansStatus.INNVILGET]: boolean;
    [RestansStatus.STANS]: boolean;
    [RestansStatus.GJENOPPTAK]: boolean;
    [RestansStatus.OVERSENDT]: boolean;
};

export interface FilterProps {
    tilOgMedState?: [Nullable<Date>, (date: Nullable<Date>) => void];
    fraOgMedState?: [Nullable<Date>, (date: Nullable<Date>) => void];
    type?: RestansTypeFilter;
    status?: RestansStatusFilter;
    resultat?: RestansResultatFilter;
    oppdaterType?: (key: keyof RestansTypeFilter, verdi: boolean) => void;
    oppdaterStatus?: (key: keyof RestansStatusFilter, verdi: boolean) => void;
    oppdaterResultat?: (key: keyof RestansResultatFilter, verdi: boolean) => void;
}

const tilOgMedErGyldig = (fraOgMed: Nullable<Date> | undefined, tilOgMed: Nullable<Date>) => {
    if (!fraOgMed || !tilOgMed) return true;
    return tilOgMed >= fraOgMed;
};

export const hentFiltrerteVerdier = <T extends Record<string, unknown>>(filter: T): Array<keyof T> =>
    Object.entries(filter)
        .filter(([_, value]) => value)
        .map(([key, _]) => key) as Array<keyof T>;

export const Filter = ({ tilOgMedState, fraOgMedState, ...props }: FilterProps) => {
    const { formatMessage } = useI18n({ messages });
    const skalViseDato = tilOgMedState || fraOgMedState;

    return (
        <div className={styles.filter}>
            {skalViseDato && (
                <div className={styles.filterdato}>
                    <Label className={styles.label}>{formatMessage('tidsperiode')}</Label>
                    {fraOgMedState && (
                        <DatePicker
                            label={formatMessage('fraOgMed')}
                            dateFormat={'dd.MM.yyyy'}
                            value={fraOgMedState[0]}
                            onChange={(dato) => fraOgMedState[1](dato ? DateFns.startOfDay(dato) : dato)}
                        />
                    )}
                    {tilOgMedState && (
                        <DatePicker
                            label={formatMessage('tilOgMed')}
                            value={tilOgMedState[0]}
                            dateFormat={'dd.MM.yyyy'}
                            onChange={(dato) => tilOgMedState[1](dato ? DateFns.endOfDay(dato) : dato)}
                            feil={
                                tilOgMedErGyldig(fraOgMedState?.[0], tilOgMedState[0])
                                    ? undefined
                                    : formatMessage('datovalidering')
                            }
                        />
                    )}
                </div>
            )}
            {props.type && (
                <div>
                    <Label className={styles.label}>{formatMessage('behandlingstype')}</Label>
                    {Object.entries(props.type).map(([key, value]) => (
                        <Checkbox
                            key={key as keyof RestansTypeFilter}
                            checked={value}
                            onChange={(e) => props.oppdaterType?.(key as keyof RestansTypeFilter, e.target.checked)}
                        >
                            {formatMessage(key as keyof RestansTypeFilter)}
                        </Checkbox>
                    ))}
                </div>
            )}
            {props.status && (
                <div>
                    <Label className={styles.label}>{formatMessage('behandlingsstatus')}</Label>
                    {Object.entries(props.status).map(([key, value]) => (
                        <Checkbox
                            key={key as keyof RestansStatusFilter}
                            checked={value}
                            onChange={(e) => props.oppdaterStatus?.(key as keyof RestansStatusFilter, e.target.checked)}
                        >
                            {formatMessage(key as keyof RestansStatusFilter)}
                        </Checkbox>
                    ))}
                </div>
            )}
            {props.resultat && (
                <div>
                    <Label className={styles.label}>{formatMessage('resultat')}</Label>
                    {Object.entries(props.resultat).map(([key, value]) => (
                        <Checkbox
                            key={key as keyof RestansResultatFilter}
                            checked={value}
                            onChange={(e) =>
                                props.oppdaterResultat?.(key as keyof RestansResultatFilter, e.target.checked)
                            }
                        >
                            {formatMessage(key as keyof RestansResultatFilter)}
                        </Checkbox>
                    ))}
                </div>
            )}
        </div>
    );
};
