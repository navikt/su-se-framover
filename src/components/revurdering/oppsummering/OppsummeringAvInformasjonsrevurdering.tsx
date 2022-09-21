import * as React from 'react';

import Beregningblokk from '~src/components/revurdering/oppsummering/beregningblokk/Beregningblokk';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InformasjonsRevurdering } from '~src/types/Revurdering';

import * as styles from './OppsummeringAvInformasjonsrevurdering.module.less';
import Oppsummeringsblokk from './oppsummeringsblokk/Oppsummeringsblokk';

const OppsummeringAvInformasjonsrevurdering = (props: {
    revurdering: InformasjonsRevurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    return (
        <div className={styles.container}>
            <Oppsummeringsblokk
                revurdering={props.revurdering}
                grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger}
            />
            <Beregningblokk revurdering={props.revurdering} />
        </div>
    );
};

export default OppsummeringAvInformasjonsrevurdering;
