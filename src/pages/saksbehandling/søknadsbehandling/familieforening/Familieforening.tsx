import React from 'react';

import { FamilieforeningBlokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FamilieforeningFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { FamilieforeningForm } from '~src/pages/saksbehandling/steg/familieforening/FamilieforeningForm';
import { FormData } from '~src/pages/saksbehandling/steg/familieforening/types';
import { SøknadInnholdAlder } from '~src/types/Søknadinnhold';

import { VilkårsvurderingBaseProps } from '../types';

import messages from './familieforening-nb';

const Familieforening = (props: VilkårsvurderingBaseProps & { søknadInnhold: SøknadInnholdAlder }) => {
    const { formatMessage } = useI18n({ messages });

    const [lagreFamilieforeninggrunnlagStatus, lagreFamilieforeninggrunnlag] = useAsyncActionCreator(
        GrunnlagOgVilkårActions.lagreFamilieforeninggrunnlag
    );

    const handleSave = (values: FormData, onSuccess: () => void) =>
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
                    <FamilieforeningBlokk
                        familieforening={props.søknadInnhold.oppholdstillatelseAlder.familieforening}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default Familieforening;
