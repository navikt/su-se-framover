import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi';
import { UførhetForm } from '~src/components/forms/vilkårOgGrunnlagForms/uførhet/UførhetForm';
import {
    UførhetFormData,
    vurderingsperiodeTilFormData,
    lagTomUføreperiode,
    eqUføreVilkårFormData,
} from '~src/components/forms/vilkårOgGrunnlagForms/uførhet/UførhetFormUtils';
import { uførhetSchema } from '~src/components/forms/vilkårOgGrunnlagForms/uførhet/validation';
import OppsummeringAvUføre from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvUføre';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { SøknadInnholdUføre } from '~src/types/Søknadinnhold';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import * as DateUtils from '~src/utils/date/dateUtils';

import sharedMessages from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './uførhet-nb';

const Uførhet = (props: VilkårsvurderingBaseProps & { søknadInnhold: SøknadInnholdUføre }) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const navigate = useNavigate();
    const [status, lagre] = useAsyncActionCreator(GrunnlagOgVilkårActions.lagreUføregrunnlag);

    const initialValues: UførhetFormData = {
        grunnlag: props.behandling.grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger?.map(
            vurderingsperiodeTilFormData
        ) ?? [lagTomUføreperiode(props.behandling.stønadsperiode?.periode)],
    };
    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<UførhetFormData>(
        Vilkårtype.Uførhet,
        (values) => eqUføreVilkårFormData.equals(values, initialValues)
    );

    const form = useForm<UførhetFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(uførhetSchema(false)),
    });
    useDraftFormSubscribe(form.watch);

    const handleSave = (values: UførhetFormData, onSuccess: () => void) => {
        if (eqUføreVilkårFormData.equals(initialValues, values)) {
            navigate(props.nesteUrl);
            return;
        }
        return lagre(
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
            () => {
                clearDraft();
                onSuccess();
            }
        );
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <UførhetForm
                        neste={{
                            onClick: handleSave,
                            url: props.nesteUrl,
                            savingState: status,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        lagreOgfortsettSenere={{
                            url: props.avsluttUrl,
                        }}
                        minOgMaxPeriode={{
                            fraOgMed: DateUtils.parseNonNullableIsoDateOnly(
                                props.behandling.stønadsperiode!.periode.fraOgMed
                            ),
                            tilOgMed: DateUtils.parseNonNullableIsoDateOnly(
                                props.behandling.stønadsperiode!.periode.tilOgMed
                            ),
                        }}
                        form={form}
                        søknadsbehandlingEllerRevurdering={'Søknadsbehandling'}
                    />
                ),
                right: (
                    <>
                        <Heading size={'small'}>{formatMessage('oppsummering.fraSøknad')}</Heading>
                        <OppsummeringAvUføre uføre={props.søknadInnhold.uførevedtak} />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default Uførhet;
