import { Checkbox, Label } from '@navikt/ds-react';
import React from 'react';

import DatePicker from '~components/datePicker/DatePicker';
import { MessageFormatter } from '~lib/i18n';
import { Nullable } from '~lib/types';
import { RestansStatus, RestansType } from '~types/Restans';

import messages from './filter-nb';
import styles from './filter.module.less';

export type FilterCheckbox = {
    [RestansType.SØKNADSBEHANDLING]: boolean;
    [RestansType.REVURDERING]: boolean;
    [RestansType.KLAGE]: boolean;
    [RestansStatus.NY_SØKNAD]: boolean;
    [RestansStatus.UNDER_BEHANDLING]: boolean;
    [RestansStatus.TIL_ATTESTERING]: boolean;
    [RestansStatus.UNDERKJENT]: boolean;
};

export interface FilterProps {
    tilOgMedState?: [Nullable<Date>, (date: Nullable<Date>) => void];
    fraOgMedState?: [Nullable<Date>, (date: Nullable<Date>) => void];
    filterState: FilterCheckbox;
    oppdaterFilter: (key: keyof FilterCheckbox, verdi: boolean) => void;
    formatMessage: MessageFormatter<typeof messages>;
}

export const hentFiltrerteVerdier = (filter: FilterCheckbox): Array<keyof FilterCheckbox> =>
    Object.entries(filter)
        .filter(([_, value]) => value)
        .map(([key, _]) => key) as Array<keyof FilterCheckbox>;

export const Filter = ({ tilOgMedState, fraOgMedState, ...props }: FilterProps) => {
    const formatMessage = props.formatMessage;
    const skalViseDato = tilOgMedState || fraOgMedState;

    return (
        <div className={styles.filter}>
            {skalViseDato && (
                <div className={styles.filterdato}>
                    <Label className={styles.label}>{formatMessage('tidsperiode')}</Label>
                    {tilOgMedState && (
                        <DatePicker
                            label={formatMessage('tilOgMed')}
                            value={tilOgMedState[0]}
                            onChange={tilOgMedState[1]}
                        />
                    )}
                    {fraOgMedState && (
                        <DatePicker
                            label={formatMessage('fraOgMed')}
                            value={fraOgMedState[0]}
                            onChange={fraOgMedState[1]}
                        />
                    )}
                </div>
            )}
            <div className={styles.filterbehandling}>
                <Label className={styles.label}>{formatMessage('typeBehandling')}</Label>
                <Checkbox
                    checked={props.filterState.SØKNADSBEHANDLING}
                    onChange={(e) => props.oppdaterFilter(RestansType.SØKNADSBEHANDLING, e.target.checked)}
                >
                    {formatMessage('søknadsbehandling')}
                </Checkbox>
                <Checkbox
                    checked={props.filterState.REVURDERING}
                    onChange={(e) => props.oppdaterFilter(RestansType.REVURDERING, e.target.checked)}
                >
                    {formatMessage('revurdering')}
                </Checkbox>
                <Checkbox
                    checked={props.filterState.KLAGE}
                    onChange={(e) => props.oppdaterFilter(RestansType.KLAGE, e.target.checked)}
                >
                    {formatMessage('klage')}
                </Checkbox>
            </div>
            <div className={styles.filterbehandling}>
                <Label className={styles.label}>{formatMessage('statusBehandling')}</Label>
                <Checkbox
                    checked={props.filterState.NY_SØKNAD}
                    onChange={(e) => props.oppdaterFilter(RestansStatus.NY_SØKNAD, e.target.checked)}
                >
                    {formatMessage('nySøknad')}
                </Checkbox>
                <Checkbox
                    checked={props.filterState.UNDER_BEHANDLING}
                    onChange={(e) => props.oppdaterFilter(RestansStatus.UNDER_BEHANDLING, e.target.checked)}
                >
                    {formatMessage('underBehandling')}
                </Checkbox>
                <Checkbox
                    checked={props.filterState.TIL_ATTESTERING}
                    onChange={(e) => props.oppdaterFilter(RestansStatus.TIL_ATTESTERING, e.target.checked)}
                >
                    {formatMessage('tilAttestering')}
                </Checkbox>
                <Checkbox
                    checked={props.filterState.UNDERKJENT}
                    onChange={(e) => props.oppdaterFilter(RestansStatus.UNDERKJENT, e.target.checked)}
                >
                    {formatMessage('underkjent')}
                </Checkbox>
            </div>
        </div>
    );
};
