import { Undertittel } from 'nav-frontend-typografi';
import React from 'react';

import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { mapToVilkårsinformasjon } from '~features/saksoversikt/utils';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import { Behandlingsinformasjon } from '~types/Behandlingsinformasjon';
import { Søknad } from '~types/Søknad';
import { VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import messages from './vilkårsOppsummering-nb';
import styles from './vilkårsOppsummering.module.less';

const VilkårsOppsummering = (props: { søknad: Søknad; behandlingsinformasjon: Behandlingsinformasjon }) => {
    const vilkårsinformasjon = mapToVilkårsinformasjon(props.behandlingsinformasjon);
    console.log(props);
    console.log(vilkårsinformasjon);
    console.log(VilkårsBlokk);
    return <div></div>;
};

interface SpmOgSvar {
    spm: string;
    svar: string | number | boolean;
}

const VilkårsBlokk = (props: {
    status: Nullable<VilkårVurderingStatus>;
    tittel: string;
    spmOgSvar: SpmOgSvar[];
    begrunnelse: string;
}) => {
    console.log(props);

    const intl = useI18n({ messages });

    return (
        <div>
            <div>
                {props.status ? <VilkårvurderingStatusIcon status={props.status} /> : null}
                <p>{props.tittel}</p>
            </div>
            <div className={styles.blokkContainer}>
                <ol className={styles.leftBlokkContainer}>
                    <Undertittel>{intl.formatMessage({ id: 'vilkår.fraSøknad' })}</Undertittel>
                    {props.spmOgSvar.map((spmOgSvar, idx) => (
                        <li key={idx}>
                            <p>{spmOgSvar.spm}</p>
                            <p>{spmOgSvar.svar}</p>
                        </li>
                    ))}
                </ol>
                <div className={styles.rightBlokkContainer}>
                    <Undertittel>{intl.formatMessage({ id: 'vilkår.begrunnelse' })}</Undertittel>
                    <p>{props.begrunnelse}</p>
                </div>
            </div>
        </div>
    );
};

export default VilkårsOppsummering;
