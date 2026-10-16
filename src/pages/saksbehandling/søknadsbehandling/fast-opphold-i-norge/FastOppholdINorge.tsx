import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Heading } from '@navikt/ds-react';
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
import sharedVilkårI18n from '~src/components/forms/vilkårOgGrunnlagForms/VilkårOgGrunnlagForms-nb';
import OppsummeringAvFastOppholdvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFastOpphold';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import { lagreFastOppholdVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { EksisterendeVedtaksinformasjonTidligerePeriodeResponse } from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';
import { harVurderingAvvikFraBrukersSvar, vilkårstatusTilBoolean } from '~src/utils/vilkårUtils.ts';
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
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...sharedVilkårI18n, ...messages } });
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

    const harAvvikFraSøknad = harVurderingAvvikFraBrukersSvar(
        props.behandling.søknad.søknadInnhold.boforhold.borOgOppholderSegINorge,
        (form.watch('fastOpphold') ?? []).map((vurdering) => vilkårstatusTilBoolean(vurdering.resultat)),
    );

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
                    >
                        {harAvvikFraSøknad && (
                            <Alert className={sharedStyles.avslagAdvarsel} variant="warning">
                                {formatMessage('display.avvikFraSøknad.advarsel')}
                            </Alert>
                        )}
                    </FastOppholdForm>
                ),
                right: (
                    <div className={sharedStyles.toKollonerRightContainer}>
                        <div>
                            <Heading size={'small'}>{formatMessage('oppsummering.fraSøknad')}</Heading>
                            <OppsummeringPar
                                label={formatMessage('fastOpphold.vilkår')}
                                verdi={formatMessage(
                                    props.behandling.søknad.søknadInnhold.boforhold.borOgOppholderSegINorge
                                        ? 'radio.label.ja'
                                        : 'radio.label.nei',
                                )}
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
