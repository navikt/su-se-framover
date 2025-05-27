import { Seksjon } from '~src/components/framdriftsindikator/Framdriftsindikator';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    InformasjonsRevurdering,
    RevurderingOppsummeringSteg,
    RevurderingSeksjoner,
    RevurderingSteg,
} from '~src/types/Revurdering';
import { Sakstype } from '~src/types/Sak.ts';

import ForhåndsvarselForm from './forhåndsvarsel/ForhåndsvarselForm';
import SendTilAttestering from './sendTilAttestering/SendTilAttestering';

const RevurderingOppsummeringPage = (props: {
    sakId: string;
    sakstype: Sakstype;
    revurdering: InformasjonsRevurdering;
    aktivSeksjonOgSteg: { seksjon: RevurderingSeksjoner; steg: RevurderingSteg };
    seksjoner: Seksjon[];
    gjeldendeGrunnlagOgVilkår: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    return (
        <div>
            {props.aktivSeksjonOgSteg.steg === RevurderingOppsummeringSteg.Forhåndsvarsel && (
                <ForhåndsvarselForm
                    sakId={props.sakId}
                    forrigeUrl={props.seksjoner[2].linjer.at(-1)!.url}
                    revurdering={props.revurdering}
                    gjeldendeGrunnlagOgVilkår={props.gjeldendeGrunnlagOgVilkår}
                    sakstype={props.sakstype}
                />
            )}
            {props.aktivSeksjonOgSteg.steg === RevurderingOppsummeringSteg.SendTilAttestering && (
                <SendTilAttestering
                    sakId={props.sakId}
                    sakstype={props.sakstype}
                    revurdering={props.revurdering}
                    gjeldendeGrunnlagOgVilkår={props.gjeldendeGrunnlagOgVilkår}
                />
            )}
        </div>
    );
};

export default RevurderingOppsummeringPage;
