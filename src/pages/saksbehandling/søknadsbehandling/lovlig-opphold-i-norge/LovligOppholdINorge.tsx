import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi';
import LovligOppholdForm from '~src/components/forms/vilkårOgGrunnlagForms/lovligOpphold/LovligOppholdForm';
import {
    LovligOppholdVilkårFormData,
    lovligOppholdFormDataTilRequest,
    lovligOppholdFormSchema,
    eqLovligOppholdVilkårFormData,
    lovligOppholdVilkårTilFormDataEllerNy,
} from '~src/components/forms/vilkårOgGrunnlagForms/lovligOpphold/LovligOppholdFormUtils';
import OppsummeringAvOpphold from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvOpphold';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './lovligOppholdINorge-nb';

const LovligOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagreLovligopphold] = useAsyncActionCreator(GrunnlagOgVilkårActions.lagreLovligOppholdVilkår);

    const initialValues = lovligOppholdVilkårTilFormDataEllerNy(
        props.behandling.grunnlagsdataOgVilkårsvurderinger.lovligOpphold,
        props.behandling.stønadsperiode?.periode,
    );

    const { draft, clearDraft, useDraftFormSubscribe } =
        useSøknadsbehandlingDraftContextFor<LovligOppholdVilkårFormData>(Vilkårtype.LovligOpphold, (values) =>
            eqLovligOppholdVilkårFormData.equals(values, initialValues),
        );

    const save = (values: LovligOppholdVilkårFormData, onSuccess: (behandling: Søknadsbehandling) => void) => {
        if (eqLovligOppholdVilkårFormData.equals(initialValues, values)) {
            navigate(props.nesteUrl);
            return;
        }
        lagreLovligopphold(
            {
                ...lovligOppholdFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    vilkår: values,
                }),
                behandlingstype: Behandlingstype.Søknadsbehandling,
            },
            (behandling) => {
                clearDraft();
                onSuccess(behandling as Søknadsbehandling);
            },
        );
    };

    const form = useForm<LovligOppholdVilkårFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(lovligOppholdFormSchema),
    });

    useDraftFormSubscribe(form.watch);

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <LovligOppholdForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                        neste={{
                            onClick: save,
                            url: props.nesteUrl,
                            savingState: status,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        lagreOgfortsettSenere={{
                            url: props.avsluttUrl,
                        }}
                        søknadsbehandlingEllerRevurdering={'Søknadsbehandling'}
                        begrensTilEnPeriode
                        skalIkkeKunneVelgePeriode
                        {...props}
                    />
                ),
                right: (
                    <>
                        <Heading size={'small'}>{formatMessage('oppsummering.fraSøknad')}</Heading>
                        <OppsummeringAvOpphold
                            oppholdstillatelse={props.behandling.søknad.søknadInnhold.oppholdstillatelse}
                        />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default LovligOppholdINorge;
