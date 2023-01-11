import { Heading } from '@navikt/ds-react';
import React from 'react';

import { FamilieforeningForm } from '~src/components/forms/vilkårOgGrunnlagForms/familieforening/FamilieforeningForm';
import { FamilieforeningFormData } from '~src/components/forms/vilkårOgGrunnlagForms/familieforening/FamilieforeningFormUtils';
import OppsummeringAvOppholdstillatelseAlder from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvOppholdstillatelseAlder';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { SøknadInnholdAlder } from '~src/types/Søknadinnhold';

import sharedMessages from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './familieforening-nb';

const Familieforening = (props: VilkårsvurderingBaseProps & { søknadInnhold: SøknadInnholdAlder }) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const [lagreFamilieforeninggrunnlagStatus, lagreFamilieforeninggrunnlag] = useAsyncActionCreator(
        GrunnlagOgVilkårActions.lagreFamilieforeninggrunnlag
    );

    const handleSave = (values: FamilieforeningFormData, onSuccess: () => void) =>
        lagreFamilieforeninggrunnlag(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                vurderinger: [{ status: values.familieforening! }],
            },
            onSuccess
        );

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <FamilieforeningForm
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
