import Beregningblokk from '~src/components/oppsummering/oppsummeringAvRevurdering/beregningblokk/Beregningblokk';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InformasjonsRevurdering } from '~src/types/Revurdering';
import { Sakstype } from '~src/types/Sak.ts';

import styles from './OppsummeringAvInformasjonsrevurdering.module.less';
import Oppsummeringsblokk from './oppsummeringsblokk/Oppsummeringsblokk';

const OppsummeringAvInformasjonsrevurdering = (props: {
    revurdering: InformasjonsRevurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    sakstype: Sakstype;
}) => {
    return (
        <div className={styles.container}>
            <Oppsummeringsblokk
                revurdering={props.revurdering}
                grunnlagsdataOgVilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger}
                sakstype={props.sakstype}
            />
            <Beregningblokk revurdering={props.revurdering} />
        </div>
    );
};

export default OppsummeringAvInformasjonsrevurdering;
