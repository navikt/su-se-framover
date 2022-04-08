import { UseFormReturn } from 'react-hook-form';
import { v4 as uuid } from 'uuid';

import { Nullable } from '~lib/types';
import { Bosituasjon } from '~types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import * as DateUtils from '~utils/date/dateUtils';

export interface BosituasjonPageProps {
    eksisterendeBosituasjoner: Bosituasjon[];
    nyeBosituasjoner: Bosituasjon[];
    sakId: string;
    revurderingId: string;
    nesteUrl: string;
    forrige: { url: string; visModal: boolean };
    avsluttUrl: string;
    minDate: Nullable<Date>;
    maxDate: Nullable<Date>;
}

export interface BosituasjonFormItemData {
    id: string;
    fraOgMed: Nullable<Date>;
    tilOgMed: Nullable<Date>;
    harEPS: Nullable<boolean>;
    epsFnr: Nullable<string>;
    delerBolig: Nullable<boolean>;
    erEPSUførFlyktning: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

export interface BosituasjonerFormProps {
    form: UseFormReturn<BosituasjonFormData>;
    sakId: string;
    revurderingId: string;
    nesteUrl: string;
    forrige: { url: string; visModal: boolean };
    avsluttUrl: string;
    minDate: Nullable<Date>;
    maxDate: Nullable<Date>;
}

export interface BosituasjonFormData {
    bosituasjoner: BosituasjonFormItemData[];
}

export interface BosituasjonFormItemProps {
    form: UseFormReturn<BosituasjonFormData>;
    data: BosituasjonFormItemData;
    index: number;
    minDate: Nullable<Date>;
    maxDate: Nullable<Date>;
    onDelete: () => void;
}

export const nyBosituasjon = (): BosituasjonFormItemData => ({
    id: uuid(),
    fraOgMed: null,
    tilOgMed: null,
    harEPS: null,
    epsFnr: null,
    delerBolig: null,
    erEPSUførFlyktning: null,
    begrunnelse: null,
});

export const bosituasjonTilFormItemData = (bosituasjon: Bosituasjon): BosituasjonFormItemData => ({
    id: uuid(),
    fraOgMed: DateUtils.parseIsoDateOnly(bosituasjon.periode.fraOgMed),
    tilOgMed: DateUtils.parseIsoDateOnly(bosituasjon.periode.tilOgMed),
    harEPS: bosituasjon.fnr !== null,
    epsFnr: bosituasjon.fnr,
    delerBolig: bosituasjon.delerBolig,
    erEPSUførFlyktning: bosituasjon.ektemakeEllerSamboerUførFlyktning,
    begrunnelse: bosituasjon.begrunnelse,
});
