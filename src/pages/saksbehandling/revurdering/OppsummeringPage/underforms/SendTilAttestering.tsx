import React from 'react';

import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InformasjonsRevurdering } from '~src/types/Revurdering';

const SendTilAttestering = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    gjeldendeGrunnlagOgVilkår: GrunnlagsdataOgVilkårsvurderinger;
    forrigeUrl: string;
}) => {
    console.log(props.sakId, props.revurdering, props.gjeldendeGrunnlagOgVilkår, props.forrigeUrl);
    return (
        <div>
            <div>SendTilAttestering</div>
        </div>
    );
};

export default SendTilAttestering;
