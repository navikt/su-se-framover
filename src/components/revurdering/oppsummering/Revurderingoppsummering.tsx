import * as React from 'react';

import Beregningblokk from '~components/revurdering/oppsummering/beregningblokk/Beregningblokk';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Revurdering } from '~types/Revurdering';

import Oppsummeringsblokk from './oppsummeringsblokk/Oppsummeringsblokk';
import styles from './revurderingoppsummering.module.less';

const Revurderingoppsummering = (props: {
    revurdering: Revurdering;
    forrigeGrunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    return (
        <div className={styles.container}>
            <Oppsummeringsblokk
                revurdering={props.revurdering}
                grunnlagsdataOgVilkårsvurderinger={props.forrigeGrunnlagsdataOgVilkårsvurderinger}
            />
            <Beregningblokk revurdering={props.revurdering} />
        </div>
    );
};

export default Revurderingoppsummering;
