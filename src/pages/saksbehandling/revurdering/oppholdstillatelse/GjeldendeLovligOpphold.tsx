import React from 'react';

import { Nullable } from '~src/lib/types';
import { LovligOppholdVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';

const GjeldendeOppholdstillatelse = (props: { gjeldendeOppholdstillatelse: Nullable<LovligOppholdVilkår> }) => {
    console.log(props.gjeldendeOppholdstillatelse);
    return <div>hei hei</div>;
};

export default GjeldendeOppholdstillatelse;
