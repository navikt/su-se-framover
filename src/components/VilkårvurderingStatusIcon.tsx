import React from 'react';

import { ErrorIcon, SuccessIcon, WarningIcon } from '~src/assets/Icons';
import { VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';

const iconWidth = '24px';

export const VilkårvurderingStatusIcon = (props: {
    status: VilkårVurderingStatus;
    showIkkeVurdertAsUavklart?: boolean;
}) => {
    switch (props.status) {
        case VilkårVurderingStatus.IkkeVurdert:
            return props.showIkkeVurdertAsUavklart ? <WarningIcon /> : <div style={{ width: iconWidth }}></div>;
        case VilkårVurderingStatus.Uavklart:
            return <WarningIcon />;
        case VilkårVurderingStatus.IkkeOk:
            return <ErrorIcon />;
        case VilkårVurderingStatus.Ok:
            return <SuccessIcon />;
    }
};

export default VilkårvurderingStatusIcon;
