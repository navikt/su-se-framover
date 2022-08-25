import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import PersonligOppmøteForm from '~src/components/vilkårForms/personligOppmøte/PersonligOppmøteForm';
import {
    PersonligOppmøteVilkårFormData,
    personligOppmøteFormSchema,
    personligOppmøteVilkårTilFormDataEllerNy,
    personligOppmøteFormDataTilRequest,
} from '~src/components/vilkårForms/personligOppmøte/PersonligOppmøteFormUtils';
import { lagrePersonligOppmøteVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { RevurderingStegProps } from '~src/types/Revurdering';

import { GjeldendePersonligOppmøte } from './GjeldendePersonligOppmøte';

export function PersonligOppmøte(props: RevurderingStegProps) {
    const [status, lagre] = useAsyncActionCreator(lagrePersonligOppmøteVilkår);

    const form = useForm<PersonligOppmøteVilkårFormData>({
        resolver: yupResolver(personligOppmøteFormSchema),
        defaultValues: personligOppmøteVilkårTilFormDataEllerNy(
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.personligOppmøte
        ),
    });

    const lagrePersonligOppmøte = (values: PersonligOppmøteVilkårFormData, onSuccess: () => void) =>
        lagre(
            {
                ...personligOppmøteFormDataTilRequest({
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
                    <PersonligOppmøteForm
                        form={form}
                        minOgMaxPeriode={revurderingsperiode}
                        onFormSubmit={lagrePersonligOppmøte}
                        savingState={status}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        {...props}
                    />
                ),
                right: (
                    <GjeldendePersonligOppmøte
                        gjeldendePersonligOppmøte={props.grunnlagsdataOgVilkårsvurderinger.personligOppmøte}
                    />
                ),
            }}
        </ToKolonner>
    );
}
