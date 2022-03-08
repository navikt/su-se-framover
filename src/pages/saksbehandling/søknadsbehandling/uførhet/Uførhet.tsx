import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import { UførhetFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/UførhetFaktablokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { FormData } from '~pages/saksbehandling/steg/uføre/types';
import { vurderingsperiodeTilFormData } from '~pages/saksbehandling/steg/uføre/UføreperiodeForm';
import { UførhetForm } from '~pages/saksbehandling/steg/uføre/UførhetForm';
import { schema } from '~pages/saksbehandling/steg/uføre/validation';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import * as DateUtils from '~utils/date/dateUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './uførhet-nb';

const Uførhet = (props: VilkårsvurderingBaseProps) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

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
                        fraOgMed: DateUtils.toIsoDateOnlyString(g.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(g.tilOgMed!),
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    },
                    forventetInntekt: g.oppfylt ? Number.parseInt(g.forventetInntekt, 10) : null,
                    uføregrad: g.oppfylt ? Number.parseInt(g.uføregrad, 10) : null,
                    begrunnelse: g.begrunnelse,
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
                        avsluttUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                        erSaksbehandling={true}
                        {...props}
                    />
                ),
                right: <UførhetFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Uførhet;
