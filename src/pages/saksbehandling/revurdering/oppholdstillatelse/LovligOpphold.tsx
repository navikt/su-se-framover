import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import LovligOppholdForm from '~src/components/vilkårForms/lovligOpphold/LovligOppholdForm';
import {
    lovligOppholdFormDataTilRequest,
    lovligOppholdFormSchema,
    LovligOppholdVilkårFormData,
    lovligOppholdVilkårTilFormDataEllerNy,
} from '~src/components/vilkårForms/lovligOpphold/LovligOppholdFormUtils';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { RevurderingStegProps } from '~src/types/Revurdering';

import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

import GjeldendeOppholdstillatelse from './GjeldendeLovligOpphold';

const LovligOpphold = (props: RevurderingStegProps) => {
    const [status, lagre] = useAsyncActionCreator(GrunnlagOgVilkårActions.lagreLovligOppholdVilkår);

    const revurderingsperiode = {
        fraOgMed: new Date(props.revurdering.periode.fraOgMed),
        tilOgMed: new Date(props.revurdering.periode.tilOgMed),
    };

    const form = useForm<LovligOppholdVilkårFormData>({
        resolver: yupResolver(lovligOppholdFormSchema),
        defaultValues: lovligOppholdVilkårTilFormDataEllerNy(
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.lovligOpphold
        ),
    });

    const lagreLovligOpphold = (data: LovligOppholdVilkårFormData, onSuccess: () => void) => {
        lagre(
            {
                ...lovligOppholdFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.revurdering.id,
                    vilkår: data,
                }),
                behandlingstype: Behandlingstype.Revurdering,
            },
            (res) => {
                if ((res as RevurderingOgFeilmeldinger).feilmeldinger.length === 0) {
                    onSuccess();
                }
            }
        );
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <LovligOppholdForm
                        form={form}
                        minOgMaxPeriode={revurderingsperiode}
                        onFormSubmit={lagreLovligOpphold}
                        savingState={status}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        onTilbakeClickOverride={props.onTilbakeClickOverride}
                        {...props}
                    />
                ),
                right: (
                    <GjeldendeOppholdstillatelse
                        gjeldendeOppholdstillatelse={props.grunnlagsdataOgVilkårsvurderinger.lovligOpphold}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default LovligOpphold;
