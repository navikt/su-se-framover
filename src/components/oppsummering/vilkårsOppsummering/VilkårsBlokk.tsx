import { Heading } from '@navikt/ds-react';
import React from 'react';

import VilkårvurderingStatusIcon from '~src/components/VilkårvurderingStatusIcon';
import { VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';

import * as styles from './vilkårsOppsummering.module.less';

const Vilkårsblokk = (props: {
    status?: VilkårVurderingStatus;
    tittel: string;
    søknadfaktablokk: JSX.Element;
    saksbehandlingfaktablokk: JSX.Element;
}) => {
    return (
        <div className={styles.blokkContainer}>
            <Heading level="3" size="xsmall" className={styles.blokkHeader}>
                {props.status ? <VilkårvurderingStatusIcon status={props.status} showIkkeVurdertAsUavklart /> : null}
                {props.tittel}
            </Heading>
            <div className={styles.pairBlokkContainer}>
                <div className={styles.blokk}>
                    <div className={styles.faktaContainer}>{props.saksbehandlingfaktablokk}</div>
                </div>
                <div className={styles.blokk}>
                    <div className={styles.faktaContainer}>{props.søknadfaktablokk}</div>
                </div>
            </div>
        </div>
    );
};

export default Vilkårsblokk;
