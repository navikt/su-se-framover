import Ikon from 'nav-frontend-ikoner-assets';
import React from 'react';

import { VilkårVurderingStatus } from '~types/Vilkårsvurdering';

const iconWidth = '24px';

export const VilkårvurderingStatusIcon = (props: {
    status: VilkårVurderingStatus;
    className?: string;
    showIkkeVurdertAsUavklart?: boolean;
}) => {
    switch (props.status) {
        case VilkårVurderingStatus.IkkeVurdert:
            return props.showIkkeVurdertAsUavklart ? (
                <Ikon kind="advarsel-sirkel-fyll" className={props.className} width={iconWidth} />
            ) : (
                <div style={{ width: iconWidth }}></div>
            );
        case VilkårVurderingStatus.Uavklart:
            return <Ikon kind="advarsel-sirkel-fyll" className={props.className} width={iconWidth} />;
        case VilkårVurderingStatus.IkkeOk:
            return <Ikon kind="feil-sirkel-fyll" className={props.className} width={iconWidth} />;
        case VilkårVurderingStatus.Ok:
            return <Ikon kind="ok-sirkel-fyll" className={props.className} width={iconWidth} />;
    }
};

export default VilkårvurderingStatusIcon;
