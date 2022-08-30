import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi';
import { UførhetFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/UførhetFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { UførhetForm } from '~src/components/vilkårOgGrunnlagForms/uførhet/UførhetForm';
import {
    UførhetFormData,
    vurderingsperiodeTilFormData,
    lagTomUføreperiode,
} from '~src/components/vilkårOgGrunnlagForms/uførhet/UførhetFormUtils';
import { uførhetSchema } from '~src/components/vilkårOgGrunnlagForms/uførhet/validation';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { SøknadInnholdUføre } from '~src/types/Søknad';
import * as DateUtils from '~src/utils/date/dateUtils';

import { VilkårsvurderingBaseProps } from '../types';

import messages from './uførhet-nb';

const Uførhet = (props: VilkårsvurderingBaseProps & { søknadInnhold: SøknadInnholdUføre }) => {
    const { formatMessage } = useI18n({ messages });

    const [status, lagre] = useAsyncActionCreator(GrunnlagOgVilkårActions.lagreUføregrunnlag);
    const form = useForm<UførhetFormData>({
        defaultValues: {
            grunnlag: props.behandling.grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger?.map(
                vurderingsperiodeTilFormData
            ) ?? [lagTomUføreperiode(props.behandling.stønadsperiode?.periode)],
        },
        resolver: yupResolver(uførhetSchema(false)),
    });

    const handleSave = (values: UførhetFormData, onSuccess: () => void) =>
        lagre(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                vurderinger: values.grunnlag.map((g) => ({
                    periode: {
                        /* eslint-disable @typescript-eslint/no-non-null-assertion */
                        fraOgMed: DateUtils.toIsoDateOnlyString(g.periode.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(g.periode.tilOgMed!),
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    },
                    forventetInntekt: g.oppfylt ? Number.parseInt(g.forventetInntekt, 10) : null,
                    uføregrad: g.oppfylt ? Number.parseInt(g.uføregrad, 10) : null,
                    resultat: g.oppfylt ?? UføreResultat.HarUføresakTilBehandling,
                })),
                behandlingstype: Behandlingstype.Søknadsbehandling,
            },
            onSuccess
        );

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <UførhetForm
                        onFormSubmit={handleSave}
                        minOgMaxPeriode={{
                            fraOgMed: DateUtils.parseNonNullableIsoDateOnly(
                                props.behandling.stønadsperiode!.periode.fraOgMed
                            ),
                            tilOgMed: DateUtils.parseNonNullableIsoDateOnly(
                                props.behandling.stønadsperiode!.periode.tilOgMed
                            ),
                        }}
                        form={form}
                        savingState={status}
                        søknadsbehandlingEllerRevurdering={'Søknadsbehandling'}
                        {...props}
                    />
                ),
                right: <UførhetFaktablokk søknadInnhold={props.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Uførhet;
