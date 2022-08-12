import { UseFormReturn } from 'react-hook-form';

import { VilkårApiResult } from '~src/features/revurdering/revurderingActions';
import { ApiResult } from '~src/lib/hooks';
import { Periode } from '~src/types/Periode';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

export type VilkårFormSaveState = ApiResult<VilkårApiResult | Søknadsbehandling>;

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
