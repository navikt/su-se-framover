import { FieldValues, UseFormReturn } from 'react-hook-form';

import { VilkårOgGrunnlagApiResult } from '~src/api/GrunnlagOgVilkårApi';
import { ApiResult } from '~src/lib/hooks';
import { Periode } from '~src/types/Periode';

export type VilkårFormSaveState = ApiResult<VilkårOgGrunnlagApiResult>;

export interface VilkårFormProps<FormData extends FieldValues> {
    form: UseFormReturn<FormData>;
    minOgMaxPeriode: Periode;
    søknadsbehandlingEllerRevurdering: 'Søknadsbehandling' | 'Revurdering';
    neste: {
        url: string;
        savingState: VilkårFormSaveState;
        onClick: (values: FormData, onSuccess: () => void) => void;
    };
    tilbake: {
        url?: string;
        onClick?: () => void;
    };
    lagreOgfortsettSenere?: {
        chainNesteKall?: boolean;
        loading?: boolean;
        url: string;
        onClick?: (values: FormData, onSuccess: () => void) => void;
    };
    fortsettSenere?: {
        onClick: () => void;
        tekst?: string;
    };
}
