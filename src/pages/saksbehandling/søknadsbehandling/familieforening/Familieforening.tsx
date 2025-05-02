import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi.ts';
import {
    FamilieforeningFormData,
    familieforeningSchema,
} from '~src/components/forms/vilkårOgGrunnlagForms/familieforening/FamilieforeningFormUtils';
import { FamiliegjenforeningForm } from '~src/components/forms/vilkårOgGrunnlagForms/familieforening/FamiliegjenforeningForm.tsx';
import OppsummeringAvOppholdstillatelseAlder from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvOppholdstillatelseAlder';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { SøknadInnholdAlder } from '~src/types/Søknadinnhold';
import { EksisterendeVedtaksinformasjonTidligerePeriodeResponse } from '~src/types/Søknadsbehandling';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils.ts';

import sharedMessages from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './familieforening-nb';

const Familieforening = (
    props: VilkårsvurderingBaseProps & {
        søknadInnhold: SøknadInnholdAlder;
        tidligerePeriodeData: ApiResult<EksisterendeVedtaksinformasjonTidligerePeriodeResponse>;
    },
) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const [lagreFamilieforeninggrunnlagStatus, lagreFamilieforeninggrunnlag] = useAsyncActionCreator(
        GrunnlagOgVilkårActions.lagreFamilieforeninggrunnlag,
    );

    const handleSave = (values: FamilieforeningFormData, onSuccess: () => void) =>
        /*
        TODO
        if (eqAlderspensjonPeriodisertFormData.equals(values, initial)) {
            navigate(navigerUrl);
            return;
        }
         */
        lagreFamilieforeninggrunnlag(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                vurderinger: [
                    {
                        periode: props.behandling.stønadsperiode!.periode,
                        status: values.familiegjenforening[0].familiegjenforening!,
                    },
                ],
                behandlingstype: Behandlingstype.Søknadsbehandling,
            },
            onSuccess,
        );

    const form = useForm<FamilieforeningFormData>({
        defaultValues: {
            familiegjenforening: [
                {
                    periode: lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode),
                    familiegjenforening:
                        props.behandling.grunnlagsdataOgVilkårsvurderinger.familiegjenforening?.vurderinger[0]
                            ?.resultat ?? null,
                },
            ],
        },
        resolver: yupResolver(familieforeningSchema),
    });

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <FamiliegjenforeningForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                        neste={{
                            onClick: (values, onSuccess) => handleSave(values, onSuccess),
                            url: props.nesteUrl,
                            savingState: lagreFamilieforeninggrunnlagStatus,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        lagreOgfortsettSenere={{
                            onClick: (values, onSuccess) => handleSave(values, onSuccess),
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
                        <OppsummeringAvOppholdstillatelseAlder
                            oppholdstillatelse={
                                (props.behandling.søknad.søknadInnhold as SøknadInnholdAlder).oppholdstillatelseAlder
                            }
                        />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default Familieforening;
