import { Checkbox, Label } from '@navikt/ds-react';
import * as DateFns from 'date-fns';

import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { SaksFilter } from '~src/pages/saksbehandling/behandlingsoversikt/behandlingsfilter/SaksFilter.tsx';
import { BehandlingssammendragStatus, BehandlingssammendragType } from '~src/types/Behandlingssammendrag';
import { Sakstype } from '~src/types/Sak.ts';

import messages from './filter-nb';
import styles from './filter.module.less';

export type BehandlingssammendragTypeFilter = {
    [BehandlingssammendragType.SØKNADSBEHANDLING]: boolean;
    [BehandlingssammendragType.REVURDERING]: boolean;
    [BehandlingssammendragType.KLAGE]: boolean;
    [BehandlingssammendragType.REGULERING]: boolean;
    [BehandlingssammendragType.TILBAKEKREVING]: boolean;
    [BehandlingssammendragType.KRAVGRUNNLAG]: boolean;
    [BehandlingssammendragType.OMGJØRING]: boolean;
    [BehandlingssammendragType.REVURDERING_OMGJØRING]: boolean;
};

export type BehandlingssammendragStatusFilter = {
    [BehandlingssammendragStatus.NY_SØKNAD]: boolean;
    [BehandlingssammendragStatus.UNDER_BEHANDLING]: boolean;
    [BehandlingssammendragStatus.TIL_ATTESTERING]: boolean;
    [BehandlingssammendragStatus.UNDERKJENT]: boolean;
    [BehandlingssammendragStatus.ÅPEN]: boolean;
};

export type BehandlingssammendragResultatFilter = {
    [BehandlingssammendragStatus.OPPHØR]: boolean;
    [BehandlingssammendragStatus.AVSLAG]: boolean;
    [BehandlingssammendragStatus.INNVILGET]: boolean;
    [BehandlingssammendragStatus.STANS]: boolean;
    [BehandlingssammendragStatus.GJENOPPTAK]: boolean;
    [BehandlingssammendragStatus.OVERSENDT]: boolean;
    [BehandlingssammendragStatus.IVERKSATT]: boolean;
    [BehandlingssammendragStatus.AVBRUTT]: boolean;
    [BehandlingssammendragStatus.AVSLUTTET]: boolean;
};

export type Sakstypefilter = {
    [Sakstype.Uføre]: boolean;
    [Sakstype.Alder]: boolean;
};

export interface FilterProps {
    tilOgMedState?: [Nullable<Date>, (date: Nullable<Date>) => void];
    fraOgMedState?: [Nullable<Date>, (date: Nullable<Date>) => void];
    type?: BehandlingssammendragTypeFilter;
    status?: BehandlingssammendragStatusFilter;
    resultat?: BehandlingssammendragResultatFilter;
    oppdaterType?: (key: keyof BehandlingssammendragTypeFilter, verdi: boolean) => void;
    oppdaterStatus?: (key: keyof BehandlingssammendragStatusFilter, verdi: boolean) => void;
    oppdaterResultat?: (key: keyof BehandlingssammendragResultatFilter, verdi: boolean) => void;
    saktypeFilter: Sakstypefilter;
    oppdaterSakstype: (key: keyof Sakstypefilter, verdi: boolean) => void;
}

const tilOgMedErGyldig = (fraOgMed: Nullable<Date> | undefined, tilOgMed: Nullable<Date>) => {
    if (!fraOgMed || !tilOgMed) return true;
    return tilOgMed >= fraOgMed;
};

export const hentFiltrerteVerdier = <T extends Record<string, unknown>>(filter: T): Array<keyof T> =>
    Object.keys(filter).filter((key) => filter[key]) as Array<keyof T>;

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
                            value={fraOgMedState[0]}
                            onChange={(dato) => fraOgMedState[1](dato ? DateFns.startOfDay(dato) : dato)}
                        />
                    )}
                    {tilOgMedState && (
                        <DatePicker
                            label={formatMessage('tilOgMed')}
                            value={tilOgMedState[0]}
                            onChange={(dato) => tilOgMedState[1](dato ? DateFns.endOfDay(dato) : dato)}
                            error={
                                tilOgMedErGyldig(fraOgMedState?.[0], tilOgMedState[0])
                                    ? undefined
                                    : formatMessage('datovalidering')
                            }
                        />
                    )}
                </div>
            )}
            <SaksFilter saktypeFilter={props.saktypeFilter} oppdaterSakstype={props.oppdaterSakstype} />
            {props.type && (
                <div>
                    <Label className={styles.label}>{formatMessage('behandlingstype')}</Label>
                    {Object.entries(props.type).map(([key, value]) => (
                        <Checkbox
                            key={key as keyof BehandlingssammendragTypeFilter}
                            checked={value}
                            onChange={(e) =>
                                props.oppdaterType?.(key as keyof BehandlingssammendragTypeFilter, e.target.checked)
                            }
                        >
                            {formatMessage(key as keyof BehandlingssammendragTypeFilter)}
                        </Checkbox>
                    ))}
                </div>
            )}
            {props.status && (
                <div>
                    <Label className={styles.label}>{formatMessage('behandlingsstatus')}</Label>
                    {Object.entries(props.status).map(([key, value]) => (
                        <Checkbox
                            key={key as keyof BehandlingssammendragStatusFilter}
                            checked={value}
                            onChange={(e) =>
                                props.oppdaterStatus?.(key as keyof BehandlingssammendragStatusFilter, e.target.checked)
                            }
                        >
                            {formatMessage(key as keyof BehandlingssammendragStatusFilter)}
                        </Checkbox>
                    ))}
                </div>
            )}
            {props.resultat && (
                <div>
                    <Label className={styles.label}>{formatMessage('resultat')}</Label>
                    {Object.entries(props.resultat).map(([key, value]) => (
                        <Checkbox
                            key={key as keyof BehandlingssammendragResultatFilter}
                            checked={value}
                            onChange={(e) =>
                                props.oppdaterResultat?.(
                                    key as keyof BehandlingssammendragResultatFilter,
                                    e.target.checked,
                                )
                            }
                        >
                            {formatMessage(key as keyof BehandlingssammendragResultatFilter)}
                        </Checkbox>
                    ))}
                </div>
            )}
        </div>
    );
};
