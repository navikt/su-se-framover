import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi';
import UtenlandsoppholdForm from '~src/components/forms/vilkårOgGrunnlagForms/utenlandsopphold/UtenlandsoppholdForm';
import {
    eqUtenlandsoppholdVilkårFormData,
    utenlandsoppholdFormSchema,
    UtenlandsoppholdVilkårFormData,
    utenlandsoppholdVilkårTilFormDataEllerNy,
    utenlandsoppholdFormDataTilRequest,
} from '~src/components/forms/vilkårOgGrunnlagForms/utenlandsopphold/UtenlandsoppholdFormUtils';
import OppsummeringAvUtenlandsopphold from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvUtenlandsopphold';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import { lagreUtenlandsopphold } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './oppholdIUtlandet-nb';

const OppholdIUtlandet = (props: VilkårsvurderingBaseProps) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagre] = useAsyncActionCreator(lagreUtenlandsopphold);

    const initialValues = utenlandsoppholdVilkårTilFormDataEllerNy(
        props.behandling.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold,
        props.behandling.stønadsperiode?.periode
    );

    const { draft, clearDraft, useDraftFormSubscribe } =
        useSøknadsbehandlingDraftContextFor<UtenlandsoppholdVilkårFormData>(Vilkårtype.OppholdIUtlandet, (values) =>
            eqUtenlandsoppholdVilkårFormData.equals(values, initialValues)
        );

    const form = useForm<UtenlandsoppholdVilkårFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(utenlandsoppholdFormSchema),
    });

    useDraftFormSubscribe(form.watch);

    const handleSave = async (values: UtenlandsoppholdVilkårFormData, onSuccess: () => void) => {
        if (eqUtenlandsoppholdVilkårFormData.equals(values, initialValues)) {
            clearDraft();
            onSuccess();
            return;
        }

        await lagre(
            {
                ...utenlandsoppholdFormDataTilRequest({
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

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <UtenlandsoppholdForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                        neste={{
                            onClick: handleSave,
                            url: props.nesteUrl,
                            savingState: status,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        fortsettSenere={{
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
                        <OppsummeringAvUtenlandsopphold
                            utenlandsopphold={props.behandling.søknad.søknadInnhold.utenlandsopphold}
                        />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default OppholdIUtlandet;
