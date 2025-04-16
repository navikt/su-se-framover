import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi.ts';
import { AlderspensjonForm } from '~src/components/forms/vilkårOgGrunnlagForms/alderspensjon/AlderspensjonForm';
import {
    AlderspensjonPeriodisertFormData,
    alderspensjonSchema,
} from '~src/components/forms/vilkårOgGrunnlagForms/alderspensjon/AlderspensjonFormUtils';
import OppsummeringAvAlderspensjon from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvAlderspensjon';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
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
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const [lagreAlderspensjongrunnlagStatus, lagreAlderspensjongrunnlag] = useAsyncActionCreator(
        GrunnlagOgVilkårActions.lagreAlderspensjongrunnlag,
    );

    // TODO må støtte perioder - kun lagre hvis endret
    const handleSave = (values: AlderspensjonPeriodisertFormData, onSuccess: () => void) =>
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

    // TODO må støtte perioder
    const form = useForm<AlderspensjonPeriodisertFormData>({
        defaultValues: {
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
        },
        resolver: yupResolver(alderspensjonSchema),
    });

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <AlderspensjonForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                        neste={{
                            onClick: handleSave,
                            url: props.nesteUrl,
                            savingState: lagreAlderspensjongrunnlagStatus,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        lagreOgfortsettSenere={{
                            onClick: handleSave,
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
