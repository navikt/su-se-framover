import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import { UførhetFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/UførhetFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { FormData } from '~src/pages/saksbehandling/steg/uføre/types';
import { vurderingsperiodeTilFormData } from '~src/pages/saksbehandling/steg/uføre/UføreperiodeForm';
import { UførhetForm } from '~src/pages/saksbehandling/steg/uføre/UførhetForm';
import { schema } from '~src/pages/saksbehandling/steg/uføre/validation';
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
            grunnlag:
                props.behandling.grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger?.map(
                    vurderingsperiodeTilFormData
                ) ?? [],
        },
        resolver: yupResolver(schema(false)),
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
                        minDate={DateUtils.parseIsoDateOnly(props.behandling.stønadsperiode?.periode.fraOgMed ?? null)}
                        maxDate={DateUtils.parseIsoDateOnly(props.behandling.stønadsperiode?.periode.tilOgMed ?? null)}
                        form={form}
                        savingState={lagreBehandlingsinformasjonStatus}
                        erSaksbehandling={true}
                        forrige={{ url: props.forrigeUrl, visModal: false }}
                        {...props}
                    />
                ),
                right: <UførhetFaktablokk søknadInnhold={props.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Uførhet;
