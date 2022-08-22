import { UseFormReturn } from 'react-hook-form';

import { VilkårOgGrunnlagApiResult } from '~src/api/GrunnlagOgVilkårApi';
import { ApiResult } from '~src/lib/hooks';
import { Periode } from '~src/types/Periode';

export type VilkårFormSaveState = ApiResult<VilkårOgGrunnlagApiResult>;

export interface VilkårFormProps<FormData> {
    form: UseFormReturn<FormData>;
    minOgMaxPeriode: Periode;
    forrigeUrl: string;
    nesteUrl: string;
    avsluttUrl: string;
    onFormSubmit: (values: FormData, onSuccess: () => void) => void;
    savingState: VilkårFormSaveState;
    søknadsbehandlingEllerRevurdering: 'Søknadsbehandling' | 'Revurdering';
    onTilbakeClickOverride?: () => void;
}
