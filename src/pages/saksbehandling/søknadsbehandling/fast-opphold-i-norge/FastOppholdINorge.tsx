import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi';
import FastOppholdForm from '~src/components/forms/vilkårOgGrunnlagForms/fastOpphold/FastOppholdForm';
import {
    eqFastOppholdVilkårFormData,
    FastOppholdVilkårFormData,
    fastOppholdFormDataTilRequest,
    fastOppholdFormSchema,
    fastOppholdVilkårTilFormDataEllerNy,
} from '~src/components/forms/vilkårOgGrunnlagForms/fastOpphold/FastOppholdFormUtils';
import OppsummeringAvOpphold from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvOpphold';
import OppsummeringAvFastOppholdvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFastOpphold';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import { lagreFastOppholdVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { EksisterendeVedtaksinformasjonTidligerePeriodeResponse } from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import EksisterendeVedtaksinformasjon from '../EksisterendeVedtaksinformasjon';
import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './fastOppholdINorge-nb';

const FastOppholdINorge = (
    props: VilkårsvurderingBaseProps & {
        tidligerePeriodeData: ApiResult<EksisterendeVedtaksinformasjonTidligerePeriodeResponse>;
    },
) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagre] = useAsyncActionCreator(lagreFastOppholdVilkår);

    const initialValues = fastOppholdVilkårTilFormDataEllerNy(
        props.behandling.grunnlagsdataOgVilkårsvurderinger.fastOpphold,
        props.behandling.stønadsperiode?.periode,
    );

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FastOppholdVilkårFormData>(
        Vilkårtype.FastOppholdINorge,
        (values) => eqFastOppholdVilkårFormData.equals(values, initialValues),
    );

    const save = (values: FastOppholdVilkårFormData, onSuccess: () => void) => {
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
            },
        );
    };

    const handleNesteClick = (values: FastOppholdVilkårFormData, onSuccess: () => void) => {
        if (eqFastOppholdVilkårFormData.equals(values, initialValues)) {
            navigate(props.nesteUrl);
            return;
        }
        save(values, onSuccess);
    };

    const handleLagreOgFortsettSenereClick = (values: FastOppholdVilkårFormData, onSuccess: () => void) => {
        if (eqFastOppholdVilkårFormData.equals(values, initialValues)) {
            navigate(props.avsluttUrl);
            return;
        }
        save(values, onSuccess);
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
                        neste={{
                            onClick: handleNesteClick,
                            savingState: status,
                            url: props.nesteUrl,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        lagreOgfortsettSenere={{
                            onClick: handleLagreOgFortsettSenereClick,
                            url: props.avsluttUrl,
                        }}
                        søknadsbehandlingEllerRevurdering={'Søknadsbehandling'}
                        begrensTilEnPeriode
                        skalIkkeKunneVelgePeriode
                        {...props}
                    />
                ),
                right: (
                    <div className={sharedStyles.toKollonerRightContainer}>
                        <div>
                            <Heading size={'small'}>{formatMessage('oppsummering.fraSøknad')}</Heading>
                            <OppsummeringAvOpphold
                                oppholdstillatelse={props.behandling.søknad.søknadInnhold.oppholdstillatelse}
                            />
                        </div>
                        <EksisterendeVedtaksinformasjon
                            eksisterendeVedtaksinformasjon={props.tidligerePeriodeData}
                            onSuccess={(data) => (
                                <OppsummeringAvFastOppholdvilkår
                                    fastOpphold={data.grunnlagsdataOgVilkårsvurderinger.fastOpphold}
                                />
                            )}
                        />
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default FastOppholdINorge;
