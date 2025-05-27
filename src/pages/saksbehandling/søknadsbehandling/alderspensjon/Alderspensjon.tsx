import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi.ts';
import { AlderspensjonForm } from '~src/components/forms/vilkårOgGrunnlagForms/alderspensjon/AlderspensjonForm';
import {
    AlderspensjonPeriodisertFormData,
    alderspensjonSchema,
    eqAlderspensjonPeriodisertFormData,
} from '~src/components/forms/vilkårOgGrunnlagForms/alderspensjon/AlderspensjonFormUtils';
import OppsummeringAvAlderspensjon from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvAlderspensjon';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes.ts';
import { PensjonsOpplysningerUtvidetSvar } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår.ts';
import { SøknadInnholdAlder } from '~src/types/Søknadinnhold';
import { EksisterendeVedtaksinformasjonTidligerePeriodeResponse } from '~src/types/Søknadsbehandling';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils.ts';

import sharedMessages from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './alderspensjon-nb';

const Alderspensjon = (
    props: VilkårsvurderingBaseProps & {
        tidligerePeriodeData: ApiResult<EksisterendeVedtaksinformasjonTidligerePeriodeResponse>;
    },
) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const [lagreAlderspensjongrunnlagStatus, lagreAlderspensjongrunnlag] = useAsyncActionCreator(
        GrunnlagOgVilkårActions.lagreAlderspensjongrunnlag,
    );

    const initial = {
        alderspensjon: [
            {
                periode: lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode),
                folketrygd:
                    props.behandling.grunnlagsdataOgVilkårsvurderinger.pensjon?.vurderinger[0]?.pensjonsopplysninger
                        .folketrygd ?? null,
                andreNorske:
                    props.behandling.grunnlagsdataOgVilkårsvurderinger.pensjon?.vurderinger[0]?.pensjonsopplysninger
                        .andreNorske ?? null,
                utenlandske:
                    props.behandling.grunnlagsdataOgVilkårsvurderinger.pensjon?.vurderinger[0]?.pensjonsopplysninger
                        .utenlandske ?? null,
            },
        ],
    };

    const form = useForm<AlderspensjonPeriodisertFormData>({
        defaultValues: initial,
        resolver: yupResolver(alderspensjonSchema),
    });

    const formWatch = form.watch();
    const vedtakUrl = Routes.saksbehandlingSendTilAttestering.createURL({
        sakId: props.sakId,
        behandlingId: props.behandling.id,
    });
    const lagNesteUrl = (): string => {
        return formWatch.alderspensjon.some(
            (e) =>
                e.andreNorske === PensjonsOpplysningerUtvidetSvar.NEI ||
                e.folketrygd === PensjonsOpplysningerUtvidetSvar.NEI ||
                e.utenlandske === PensjonsOpplysningerUtvidetSvar.NEI,
        )
            ? vedtakUrl
            : props.nesteUrl;
    };
    const nesteUrl = lagNesteUrl();

    const handleSave = (values: AlderspensjonPeriodisertFormData, onSuccess: () => void, navigerUrl: string) => {
        if (eqAlderspensjonPeriodisertFormData.equals(values, initial)) {
            navigate(navigerUrl);
            return;
        }
        lagreAlderspensjongrunnlag(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                vurderinger: [
                    {
                        periode: props.behandling.stønadsperiode!.periode,
                        pensjonsopplysninger: {
                            folketrygd: values.alderspensjon[0].folketrygd!,
                            andreNorske: values.alderspensjon[0].andreNorske!,
                            utenlandske: values.alderspensjon[0].utenlandske!,
                        },
                    },
                ],
                behandlingstype: Behandlingstype.Søknadsbehandling,
            },
            onSuccess,
        );
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <AlderspensjonForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                        neste={{
                            onClick: (values, onSuccess) => handleSave(values, onSuccess, nesteUrl),
                            url: nesteUrl,
                            savingState: lagreAlderspensjongrunnlagStatus,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        lagreOgfortsettSenere={{
                            onClick: (values, onSuccess) => handleSave(values, onSuccess, props.avsluttUrl),
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
                        <OppsummeringAvAlderspensjon
                            alderspensjon={
                                (props.behandling.søknad.søknadInnhold as SøknadInnholdAlder).harSøktAlderspensjon
                            }
                        />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default Alderspensjon;
