import { Seksjon } from '~src/components/framdriftsindikator/Framdriftsindikator';
import * as Routes from '~src/lib/routes';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    InformasjonsRevurdering,
    RevurderingOppsummeringSteg,
    RevurderingSeksjoner,
    RevurderingSteg,
} from '~src/types/Revurdering';
import { erRevurderingTilbakekrevingsbehandling } from '~src/utils/revurdering/revurderingUtils';

import ForhåndsvarselForm from './forhåndsvarsel/ForhåndsvarselForm';
import SendTilAttestering from './sendTilAttestering/SendTilAttestering';
import TilbakekrevingForm from './tilbakekreving/TilbakekrevingForm';

const RevurderingOppsummeringPage = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    aktivSeksjonOgSteg: { seksjon: RevurderingSeksjoner; steg: RevurderingSteg };
    seksjoner: Seksjon[];
    gjeldendeGrunnlagOgVilkår: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    return (
        <div>
            {props.aktivSeksjonOgSteg.steg === RevurderingOppsummeringSteg.Tilbakekreving && (
                <TilbakekrevingForm
                    sakId={props.sakId}
                    revurdering={props.revurdering}
                    gjeldendeGrunnlagOgVilkår={props.gjeldendeGrunnlagOgVilkår}
                />
            )}
            {props.aktivSeksjonOgSteg.steg === RevurderingOppsummeringSteg.Forhåndsvarsel && (
                <ForhåndsvarselForm
                    sakId={props.sakId}
                    forrigeUrl={
                        erRevurderingTilbakekrevingsbehandling(props.revurdering)
                            ? Routes.revurderingSeksjonSteg.createURL({
                                  sakId: props.sakId,
                                  revurderingId: props.revurdering.id,
                                  seksjon: RevurderingSeksjoner.Oppsummering,
                                  steg: RevurderingOppsummeringSteg.Tilbakekreving,
                              })
                            : props.seksjoner[2].linjer.at(-1)!.url
                    }
                    revurdering={props.revurdering}
                    gjeldendeGrunnlagOgVilkår={props.gjeldendeGrunnlagOgVilkår}
                />
            )}
            {props.aktivSeksjonOgSteg.steg === RevurderingOppsummeringSteg.SendTilAttestering && (
                <SendTilAttestering
                    sakId={props.sakId}
                    revurdering={props.revurdering}
                    gjeldendeGrunnlagOgVilkår={props.gjeldendeGrunnlagOgVilkår}
                />
            )}
        </div>
    );
};

export default RevurderingOppsummeringPage;
