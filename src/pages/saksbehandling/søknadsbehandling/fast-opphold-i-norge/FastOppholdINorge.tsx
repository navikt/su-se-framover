import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi';
import { FastOppholdFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FastOppholdFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import FastOppholdForm from '~src/components/vilkårOgGrunnlagForms/fastOpphold/FastOppholdForm';
import {
    eqFastOppholdVilkårFormData,
    fastOppholdFormSchema,
    FastOppholdVilkårFormData,
    fastOppholdVilkårTilFormDataEllerNy,
    fastOppholdFormDataTilRequest,
} from '~src/components/vilkårOgGrunnlagForms/fastOpphold/FastOppholdFormUtils';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import { lagreFastOppholdVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './fastOppholdINorge-nb';

const FastOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagre] = useAsyncActionCreator(lagreFastOppholdVilkår);

    const initialValues = fastOppholdVilkårTilFormDataEllerNy(
        props.behandling.grunnlagsdataOgVilkårsvurderinger.fastOpphold,
        props.behandling.stønadsperiode?.periode
    );

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FastOppholdVilkårFormData>(
        Vilkårtype.FastOppholdINorge,
        (values) => eqFastOppholdVilkårFormData.equals(values, initialValues)
    );

    const handleSave = (values: FastOppholdVilkårFormData, onSuccess: () => void) => {
        if (eqFastOppholdVilkårFormData.equals(values, initialValues)) {
            clearDraft();
            onSuccess();
            return;
        }
        lagre(
            {
                ...fastOppholdFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    vilkår: values,
                }),
                behandlingstype: Behandlingstype.Søknadsbehandling,
            },
            () => {
                clearDraft();
                onSuccess();
            }
        );
    };

    const form = useForm<FastOppholdVilkårFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(fastOppholdFormSchema),
    });

    useDraftFormSubscribe(form.watch);

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <FastOppholdForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                        onFormSubmit={handleSave}
                        savingState={status}
                        søknadsbehandlingEllerRevurdering={'Søknadsbehandling'}
                        begrensTilEnPeriode
                        skalIkkeKunneVelgePeriode
                        {...props}
                    />
                ),
                right: <FastOppholdFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default FastOppholdINorge;
