import Ikon from 'nav-frontend-ikoner-assets';
import React from 'react';

import { VilkårVurderingStatus } from '~api/behandlingApi';

export const VilkårvurderingStatusIcon = (props: { status: VilkårVurderingStatus; className?: string }) => {
    switch (props.status) {
        case VilkårVurderingStatus.IkkeVurdert:
            return <Ikon kind="advarsel-sirkel-fyll" className={props.className} />;
        case VilkårVurderingStatus.IkkeOk:
            return <Ikon kind="feil-sirkel-fyll" className={props.className} />;
        case VilkårVurderingStatus.Ok:
            return <Ikon kind="ok-sirkel-fyll" className={props.className} />;
    }
};

export default VilkårvurderingStatusIcon;
