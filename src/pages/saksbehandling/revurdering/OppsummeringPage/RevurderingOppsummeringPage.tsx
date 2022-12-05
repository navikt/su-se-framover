import * as React from 'react';

import { Seksjon } from '~src/components/framdriftsindikator/Framdriftsindikator';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    InformasjonsRevurdering,
    RevurderingOppsummeringSteg,
    RevurderingSeksjoner,
    RevurderingSteg,
} from '~src/types/Revurdering';

import ForhåndsvarselForm from './forhåndsvarsel/ForhåndsvarselForm';
import * as styles from './RevurderingOppsummeringPage.module.less';
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
        <div className={styles.pageContainer}>
            {props.aktivSeksjonOgSteg.steg === RevurderingOppsummeringSteg.Forhåndsvarsel && (
                <ForhåndsvarselForm
                    sakId={props.sakId}
                    forrigeUrl={props.seksjoner[3].linjer.at(-1)!.url}
                    nesteUrl={props.seksjoner[4].linjer[1]!.url}
                    revurdering={props.revurdering}
                    gjeldendeGrunnlagOgVilkår={props.gjeldendeGrunnlagOgVilkår}
                />
            )}
            {props.aktivSeksjonOgSteg.steg === RevurderingOppsummeringSteg.Tilbakekreving && (
                <TilbakekrevingForm
                    sakId={props.sakId}
                    revurdering={props.revurdering}
                    gjeldendeGrunnlagOgVilkår={props.gjeldendeGrunnlagOgVilkår}
                />
            )}
            {props.aktivSeksjonOgSteg.steg === RevurderingOppsummeringSteg.SendTilAttestering && (
                <SendTilAttestering
                    sakId={props.sakId}
                    revurdering={props.revurdering}
                    gjeldendeGrunnlagOgVilkår={props.gjeldendeGrunnlagOgVilkår}
                    forrigeUrl={props.seksjoner[4].linjer.at(-2)!.url}
                />
            )}
        </div>
    );
};

export default RevurderingOppsummeringPage;
