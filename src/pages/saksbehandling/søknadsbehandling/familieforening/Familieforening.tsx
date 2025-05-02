import { Heading } from '@navikt/ds-react';

import { FamilieforeningFormData } from '~src/components/forms/vilkårOgGrunnlagForms/familieforening/FamilieforeningFormUtils';
import { FamiliegjenforeningForm } from '~src/components/forms/vilkårOgGrunnlagForms/familieforening/FamiliegjenforeningForm.tsx';
import OppsummeringAvOppholdstillatelseAlder from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvOppholdstillatelseAlder';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { SøknadInnholdAlder } from '~src/types/Søknadinnhold';
import { EksisterendeVedtaksinformasjonTidligerePeriodeResponse } from '~src/types/Søknadsbehandling';

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
        lagreFamilieforeninggrunnlag(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                vurderinger: [{ status: values.familiegjenforening! }],
            },
            onSuccess,
        );

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <FamiliegjenforeningForm
                        save={handleSave}
                        savingState={lagreFamilieforeninggrunnlagStatus}
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
