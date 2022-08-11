import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import { UførhetFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/UførhetFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { UførhetForm } from '~src/components/vilkårForms/uførhet/UførhetForm';
import {
    FormData,
    vurderingsperiodeTilFormData,
    lagTomUføreperiode,
} from '~src/components/vilkårForms/uførhet/UførhetFormUtils';
import { uførhetSchema } from '~src/components/vilkårForms/uførhet/validation';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { SøknadInnholdUføre } from '~src/types/Søknad';
import * as DateUtils from '~src/utils/date/dateUtils';

import { VilkårsvurderingBaseProps } from '../types';

import messages from './uførhet-nb';

const Uførhet = (props: VilkårsvurderingBaseProps & { søknadInnhold: SøknadInnholdUføre }) => {
    const { formatMessage } = useI18n({ messages });

    const [lagreBehandlingsinformasjonStatus, lagreUføregrunnlag] = useAsyncActionCreator(sakSlice.lagreUføregrunnlag);
    const form = useForm<FormData>({
        defaultValues: {
            grunnlag: props.behandling.grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger?.map(
                vurderingsperiodeTilFormData
            ) ?? [lagTomUføreperiode(props.behandling.stønadsperiode?.periode)],
        },
        resolver: yupResolver(uførhetSchema(false)),
    });

    const handleSave = (values: FormData, onSuccess: () => void) =>
        lagreUføregrunnlag(
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
            },
            onSuccess
        );

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <UførhetForm
                        onFormSubmit={handleSave}
                        minDate={DateUtils.parseNonNullableIsoDateOnly(
                            props.behandling.stønadsperiode!.periode.fraOgMed
                        )}
                        maxDate={DateUtils.parseNonNullableIsoDateOnly(
                            props.behandling.stønadsperiode!.periode.tilOgMed
                        )}
                        form={form}
                        savingState={lagreBehandlingsinformasjonStatus}
                        erSaksbehandling={true}
                        {...props}
                    />
                ),
                right: <UførhetFaktablokk søknadInnhold={props.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Uførhet;
