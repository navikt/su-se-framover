import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import InstitusjonsoppholdForm from '~src/components/vilkårOgGrunnlagForms/institusjonsopphold/InstitusjonsoppholdForm';
import {
    institusjonsoppholdFormSchema,
    institusjonsoppholdFormDataTilRequest,
    InstitusjonsoppholdVilkårFormData,
    institusjonsoppholdVilkårTilFormDataEllerNy,
} from '~src/components/vilkårOgGrunnlagForms/institusjonsopphold/InstitusjonsoppholdFormUtils';
import { lagreInstitusjonsoppholdVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { RevurderingStegProps } from '~src/types/Revurdering';

import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

import GjeldendeInstitusjonsopphold from './GjeldendeInstitusjonsopphold';

const Institusjonsopphold = (props: RevurderingStegProps) => {
    const [status, lagre] = useAsyncActionCreator(lagreInstitusjonsoppholdVilkår);

    const form = useForm<InstitusjonsoppholdVilkårFormData>({
        resolver: yupResolver(institusjonsoppholdFormSchema),
        defaultValues: institusjonsoppholdVilkårTilFormDataEllerNy(
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold
        ),
    });

    const lagreInstitusjonsopphold = (values: InstitusjonsoppholdVilkårFormData, onSuccess: () => void) =>
        lagre(
            {
                ...institusjonsoppholdFormDataTilRequest({
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
                    <InstitusjonsoppholdForm
                        form={form}
                        minOgMaxPeriode={revurderingsperiode}
                        onFormSubmit={lagreInstitusjonsopphold}
                        savingState={status}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        onTilbakeClickOverride={props.onTilbakeClickOverride}
                        {...props}
                    />
                ),
                right: (
                    <GjeldendeInstitusjonsopphold
                        gjeldendeInstitusjonsopphold={props.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default Institusjonsopphold;
