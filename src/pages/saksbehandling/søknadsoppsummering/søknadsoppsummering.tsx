import React from 'react';

import * as Routes from '~lib/routes.ts';
import { Sak } from '~types/Sak';

import VilkårsOppsummering from '../vilkårsOppsummering/VilkårsOppsummering';

interface Props {
    sak: Sak;
}
const Søknadsoppsummering = (props: Props) => {
    const { behandlingId } = Routes.useRouteParams<typeof Routes.saksbehandlingOppsummering>();
    const behandling = props.sak.behandlinger.find((behandling) => behandling.id === behandlingId);
    if (!behandling) {
        return <></>;
    }

    return (
        <VilkårsOppsummering
            søknadInnhold={behandling.søknad.søknadInnhold}
            behandlingsinformasjon={behandling?.behandlingsinformasjon}
        />
    );
};

export default Søknadsoppsummering;
