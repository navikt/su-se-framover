import * as React from 'react';

import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Revurdering } from '~types/Revurdering';

import Beregningblokk from './beregningblokk/Beregningblokk';
import Oppsummeringsblokk from './oppsummeringsblokk/Oppsummeringsblokk';
import styles from './revurderingoppsummering.module.less';

const Revurderingoppsummering = (props: {
    revurdering: Revurdering;
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

export default Revurderingoppsummering;
