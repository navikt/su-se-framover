import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
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
import OppsummeringAvLovligOppholdvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvLovligOpphold';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import {
    EksisterendeVedtaksinformasjonTidligerePeriodeResponse,
    Søknadsbehandling,
} from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import EksisterendeVedtaksinformasjon from '../EksisterendeVedtaksinformasjon';
import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './lovligOppholdINorge-nb';

const LovligOppholdINorge = (
    props: VilkårsvurderingBaseProps & {
        tidligerePeriodeData: ApiResult<EksisterendeVedtaksinformasjonTidligerePeriodeResponse>;
    },
) => {
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

    const handleNesteClick = (
        values: LovligOppholdVilkårFormData,
        onSuccess: (behandling: Søknadsbehandling) => void,
    ) => {
        if (eqLovligOppholdVilkårFormData.equals(initialValues, values)) {
            navigate(props.nesteUrl);
            return;
        }
        save(values, onSuccess);
    };

    const handleLagreOgFortsettSenereClick = (
        values: LovligOppholdVilkårFormData,
        onSuccess: (behandling: Søknadsbehandling) => void,
    ) => {
        if (eqLovligOppholdVilkårFormData.equals(initialValues, values)) {
            navigate(props.avsluttUrl);
            return;
        }
        save(values, onSuccess);
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
                            onClick: handleNesteClick,
                            url: props.nesteUrl,
                            savingState: status,
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
                                <OppsummeringAvLovligOppholdvilkår
                                    lovligOpphold={data.grunnlagsdataOgVilkårsvurderinger.lovligOpphold}
                                />
                            )}
                        />
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default LovligOppholdINorge;
