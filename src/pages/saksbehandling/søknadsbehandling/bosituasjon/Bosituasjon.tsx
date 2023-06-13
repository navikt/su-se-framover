import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi';
import BosituasjonForm from '~src/components/forms/vilkårOgGrunnlagForms/bosituasjon/BosituasjonForm';
import {
    bosituasjonFormSchema,
    BosituasjonGrunnlagFormData,
    bosituasjongrunnlagFormDataTilRequest,
    bosituasjongrunnlagTilFormDataEllerNy,
    eqBosituasjonGrunnlagFormData,
} from '~src/components/forms/vilkårOgGrunnlagForms/bosituasjon/BosituasjonFormUtils';
import OppsummeringAvBoforhold from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvBoforhold';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import { lagreBosituasjongrunnlag } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Person } from '~src/types/Person';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './Bosituasjon-nb';

const Bosituasjon = (props: VilkårsvurderingBaseProps & { søker: Person }) => {
    const navigate = useNavigate();
    const [status, lagre] = useAsyncActionCreator(lagreBosituasjongrunnlag);
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedI18n } });

    const initialValues = bosituasjongrunnlagTilFormDataEllerNy(
        props.behandling.grunnlagsdataOgVilkårsvurderinger.bosituasjon,
        props.behandling.stønadsperiode!.periode
    );

    const { draft, clearDraft, useDraftFormSubscribe } =
        useSøknadsbehandlingDraftContextFor<BosituasjonGrunnlagFormData>(Vilkårtype.Bosituasjon, (values) =>
            eqBosituasjonGrunnlagFormData.equals(values, initialValues)
        );

    const form = useForm<BosituasjonGrunnlagFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(bosituasjonFormSchema),
    });

    useDraftFormSubscribe(form.watch);

    const save = (values: BosituasjonGrunnlagFormData, onSuccess: (behandling: Søknadsbehandling) => void) => {
        if (eqBosituasjonGrunnlagFormData.equals(values, initialValues)) {
            navigate(props.nesteUrl);
            return;
        }
        lagre(
            {
                ...bosituasjongrunnlagFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    data: values,
                }),
                behandlingstype: Behandlingstype.Søknadsbehandling,
            },
            (behandling) => {
                clearDraft();
                onSuccess(behandling as Søknadsbehandling);
            }
        );
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <BosituasjonForm
                        form={form}
                        søknadsbehandlingEllerRevurdering={'Søknadsbehandling'}
                        skalIkkeKunneVelgePeriode
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                        begrensTilEnPeriode
                        neste={{
                            onClick: save,
                            savingState: status,
                            url: props.nesteUrl,
                        }}
                        tilbake={{ url: props.forrigeUrl }}
                        lagreOgfortsettSenere={{ url: props.avsluttUrl }}
                        {...props}
                    />
                ),
                right: (
                    <div>
                        <Heading size={'small'}>{formatMessage('oppsummering.fraSøknad')}</Heading>
                        <OppsummeringAvBoforhold boforhold={props.behandling.søknad.søknadInnhold.boforhold} />
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default Bosituasjon;
