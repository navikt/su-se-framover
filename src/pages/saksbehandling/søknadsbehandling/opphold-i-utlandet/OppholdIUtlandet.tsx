import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi';
import UtenlandsoppholdForm from '~src/components/forms/vilkårOgGrunnlagForms/utenlandsopphold/UtenlandsoppholdForm';
import {
    eqUtenlandsoppholdVilkårFormData,
    UtenlandsoppholdVilkårFormData,
    utenlandsoppholdFormDataTilRequest,
    utenlandsoppholdFormSchema,
    utenlandsoppholdVilkårTilFormDataEllerNy,
} from '~src/components/forms/vilkårOgGrunnlagForms/utenlandsopphold/UtenlandsoppholdFormUtils';
import OppsummeringAvUtenlandsopphold from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvUtenlandsopphold';
import OppsummeringAvUtenlandsoppholdVilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvUtenlandsopphold';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import { lagreUtenlandsopphold } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { EksisterendeVedtaksinformasjonTidligerePeriodeResponse } from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import EksisterendeVedtaksinformasjon from '../EksisterendeVedtaksinformasjon';
import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './oppholdIUtlandet-nb';

const OppholdIUtlandet = (
    props: VilkårsvurderingBaseProps & {
        tidligerePeriodeData: ApiResult<EksisterendeVedtaksinformasjonTidligerePeriodeResponse>;
    },
) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagre] = useAsyncActionCreator(lagreUtenlandsopphold);

    const initialValues = utenlandsoppholdVilkårTilFormDataEllerNy(
        props.behandling.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold,
        props.behandling.stønadsperiode?.periode,
    );

    const { draft, clearDraft, useDraftFormSubscribe } =
        useSøknadsbehandlingDraftContextFor<UtenlandsoppholdVilkårFormData>(Vilkårtype.OppholdIUtlandet, (values) =>
            eqUtenlandsoppholdVilkårFormData.equals(values, initialValues),
        );

    const form = useForm<UtenlandsoppholdVilkårFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(utenlandsoppholdFormSchema),
    });

    useDraftFormSubscribe(form.watch);

    const save = async (values: UtenlandsoppholdVilkårFormData, onSuccess: () => void) => {
        lagre(
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
            },
        );
    };
    const handleNesteClick = async (values: UtenlandsoppholdVilkårFormData, onSuccess: () => void) => {
        if (eqUtenlandsoppholdVilkårFormData.equals(values, initialValues)) {
            navigate(props.nesteUrl);
            return;
        }

        save(values, onSuccess);
    };

    const handleLagreOgFortsettSenereClick = async (values: UtenlandsoppholdVilkårFormData, onSuccess: () => void) => {
        if (eqUtenlandsoppholdVilkårFormData.equals(values, initialValues)) {
            navigate(props.avsluttUrl);
            return;
        }

        save(values, onSuccess);
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <UtenlandsoppholdForm
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
                            <OppsummeringAvUtenlandsopphold
                                utenlandsopphold={props.behandling.søknad.søknadInnhold.utenlandsopphold}
                            />
                        </div>
                        <EksisterendeVedtaksinformasjon
                            eksisterendeVedtaksinformasjon={props.tidligerePeriodeData}
                            onSuccess={(data) => (
                                <OppsummeringAvUtenlandsoppholdVilkår
                                    utenlandsopphold={data.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold}
                                />
                            )}
                        />
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default OppholdIUtlandet;
