import React from 'react';

import OppsummeringAvInformasjonsrevurdering from '~src/components/revurdering/oppsummering/OppsummeringAvInformasjonsrevurdering';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InformasjonsRevurdering } from '~src/types/Revurdering';

import { BrevvalgForm } from '../brevvalg/BrevvalgForm';

const SendTilAttestering = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    gjeldendeGrunnlagOgVilkår: GrunnlagsdataOgVilkårsvurderinger;
    forrigeUrl: string;
}) => {
    return (
        <ToKolonner tittel={'Vedtaksbrev'}>
            {{
                left: (
                    <BrevvalgForm sakId={props.sakId} revurdering={props.revurdering} forrigeUrl={props.forrigeUrl} />
                ),
                right: (
                    <OppsummeringAvInformasjonsrevurdering
                        revurdering={props.revurdering}
                        grunnlagsdataOgVilkårsvurderinger={props.gjeldendeGrunnlagOgVilkår}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default SendTilAttestering;
