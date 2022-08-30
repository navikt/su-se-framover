import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import FastOppholdForm from '~src/components/vilkårOgGrunnlagForms/fastOpphold/FastOppholdForm';
import {
    FastOppholdVilkårFormData,
    fastOppholdFormSchema,
    fastOppholdVilkårTilFormDataEllerNy,
    fastOppholdFormDataTilRequest,
} from '~src/components/vilkårOgGrunnlagForms/fastOpphold/FastOppholdFormUtils';
import { lagreFastOppholdVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { GjeldendeFastOppholdVilkår } from '~src/pages/saksbehandling/revurdering/fastOpphold/GjeldendeFastOppholdVilkår';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { RevurderingStegProps } from '~src/types/Revurdering';

export function FastOppholdPage(props: RevurderingStegProps) {
    const [status, lagre] = useAsyncActionCreator(lagreFastOppholdVilkår);

    const form = useForm<FastOppholdVilkårFormData>({
        resolver: yupResolver(fastOppholdFormSchema),
        defaultValues: fastOppholdVilkårTilFormDataEllerNy(
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.fastOpphold
        ),
    });

    const lagreFastOpphold = (values: FastOppholdVilkårFormData, onSuccess: () => void) =>
        lagre(
            {
                ...fastOppholdFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.revurdering.id,
                    vilkår: values,
                }),
                behandlingstype: Behandlingstype.Søknadsbehandling,
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
                    <FastOppholdForm
                        form={form}
                        minOgMaxPeriode={revurderingsperiode}
                        onFormSubmit={lagreFastOpphold}
                        savingState={status}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        {...props}
                    />
                ),
                right: (
                    <GjeldendeFastOppholdVilkår
                        gjeldendeFastOppholdVilkår={props.grunnlagsdataOgVilkårsvurderinger.fastOpphold}
                    />
                ),
            }}
        </ToKolonner>
    );
}

export default FastOppholdPage;
