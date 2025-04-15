import { Heading } from '@navikt/ds-react';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi.ts';
import { AlderspensjonForm } from '~src/components/forms/vilkårOgGrunnlagForms/alderspensjon/AlderspensjonForm';
import { AlderspensjonFormData } from '~src/components/forms/vilkårOgGrunnlagForms/alderspensjon/AlderspensjonFormUtils';
import OppsummeringAvAlderspensjon from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvAlderspensjon';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { SøknadInnholdAlder } from '~src/types/Søknadinnhold';
import { EksisterendeVedtaksinformasjonTidligerePeriodeResponse } from '~src/types/Søknadsbehandling';

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

    const handleSave = (values: AlderspensjonFormData, onSuccess: () => void) =>
        lagreAlderspensjongrunnlag(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                vurderinger: [
                    {
                        periode: props.behandling.stønadsperiode!.periode,
                        pensjonsopplysninger: {
                            folketrygd: values.folketrygd!,
                            andreNorske: values.andreNorske!,
                            utenlandske: values.utenlandske!,
                        },
                    },
                ],
                behandlingstype: Behandlingstype.Søknadsbehandling,
            },
            onSuccess,
        );

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: <AlderspensjonForm save={handleSave} savingState={lagreAlderspensjongrunnlagStatus} {...props} />,
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
