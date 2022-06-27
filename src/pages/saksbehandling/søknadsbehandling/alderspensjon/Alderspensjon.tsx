import React from 'react';

import { AlderspensjonBlokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/AlderspensjonFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { AlderspensjonForm } from '~src/pages/saksbehandling/steg/alderspensjon/AlderspensjonForm';
import { FormData } from '~src/pages/saksbehandling/steg/alderspensjon/types';
import { SøknadInnholdAlder } from '~src/types/Søknad';

import { VilkårsvurderingBaseProps } from '../types';

import messages from './alderspensjon-nb';

const Alderspensjon = (props: VilkårsvurderingBaseProps & { søknadInnhold: SøknadInnholdAlder }) => {
    const { formatMessage } = useI18n({ messages });

    const [lagreAlderspensjongrunnlagStatus, lagreAlderspensjongrunnlag] = useAsyncActionCreator(
        sakSlice.lagreAlderspensjongrunnlag
    );

    const handleSave = (values: FormData, onSuccess: () => void) =>
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
            },
            onSuccess
        );

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: <AlderspensjonForm save={handleSave} savingState={lagreAlderspensjongrunnlagStatus} {...props} />,
                right: <AlderspensjonBlokk harSøktAlderspensjon={props.søknadInnhold.harSøktAlderspensjon} />,
            }}
        </ToKolonner>
    );
};

export default Alderspensjon;
