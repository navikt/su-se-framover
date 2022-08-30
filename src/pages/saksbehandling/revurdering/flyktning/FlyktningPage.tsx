import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import FlyktningForm from '~src/components/vilkårOgGrunnlagForms/flyktning/FlyktningForm';
import {
    FlyktningVilkårFormData,
    flyktningFormSchema,
    flyktningFormDataTilRequest,
    flyktningVilkårTilFormDataEllerNy,
} from '~src/components/vilkårOgGrunnlagForms/flyktning/FlyktningFormUtils';
import { lagreFlyktningVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import GjeldendeFlyktningVilkår from '~src/pages/saksbehandling/revurdering/flyktning/GjeldendeFlyktningVilkår';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { RevurderingStegProps } from '~src/types/Revurdering';

export function FlyktningPage(props: RevurderingStegProps) {
    const [status, lagre] = useAsyncActionCreator(lagreFlyktningVilkår);

    const form = useForm<FlyktningVilkårFormData>({
        resolver: yupResolver(flyktningFormSchema),
        defaultValues: flyktningVilkårTilFormDataEllerNy(props.revurdering.grunnlagsdataOgVilkårsvurderinger.flyktning),
    });

    const lagreFlyktning = (values: FlyktningVilkårFormData, onSuccess: () => void) =>
        lagre(
            {
                ...flyktningFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.revurdering.id,
                    vilkår: values,
                }),
                behandlingstype: Behandlingstype.Revurdering,
            },
            (res) => {
                if ((res as RevurderingOgFeilmeldinger).feilmeldinger.length === 0) {
                    onSuccess();
                }
            }
        );
    const revurderingsperiode = {
        fraOgMed: new Date(props.revurdering.periode.fraOgMed),
        tilOgMed: new Date(props.revurdering.periode.tilOgMed),
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <FlyktningForm
                        form={form}
                        minOgMaxPeriode={revurderingsperiode}
                        onFormSubmit={lagreFlyktning}
                        savingState={status}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        onTilbakeClickOverride={props.onTilbakeClickOverride}
                        {...props}
                    />
                ),
                right: (
                    <GjeldendeFlyktningVilkår
                        gjeldendeFlyktingVilkår={props.grunnlagsdataOgVilkårsvurderinger.flyktning}
                    />
                ),
            }}
        </ToKolonner>
    );
}

export default FlyktningPage;
