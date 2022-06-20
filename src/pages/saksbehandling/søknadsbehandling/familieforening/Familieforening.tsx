import React from 'react';

import { FamilieforeningBlokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FamilieforeningFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { FamilieforeningForm } from '~src/pages/saksbehandling/steg/familieforening/FamilieforeningForm';
import { FormData } from '~src/pages/saksbehandling/steg/familieforening/types';
import { SøknadInnholdAlder } from '~src/types/Søknad';

import { VilkårsvurderingBaseProps } from '../types';

import messages from './familieforening-nb';

const Familieforening = (props: VilkårsvurderingBaseProps & { søknadInnhold: SøknadInnholdAlder }) => {
    const { formatMessage } = useI18n({ messages });

    const [lagreFamilieforeninggrunnlagStatus, lagreFamilieforeninggrunnlag] = useAsyncActionCreator(
        sakSlice.lagreFamilieforeninggrunnlag
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
                        avsluttUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
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
