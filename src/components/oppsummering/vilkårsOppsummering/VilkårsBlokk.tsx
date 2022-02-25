import { Heading } from '@navikt/ds-react';
import React from 'react';

import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import { VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import messages from './vilkårsOppsummering-nb';
import styles from './vilkårsOppsummering.module.less';

const Vilkårsblokk = (props: {
    status?: VilkårVurderingStatus;
    tittel: string;
    søknadfaktablokk: JSX.Element;
    saksbehandlingfaktablokk: JSX.Element;
    begrunnelse: Nullable<string>;
}) => {
    const { intl } = useI18n({ messages });

    return (
        <div className={styles.blokkContainer}>
            <Heading level="3" size="xsmall" className={styles.blokkHeader}>
                {props.status ? <VilkårvurderingStatusIcon status={props.status} showIkkeVurdertAsUavklart /> : null}
                {props.tittel}
            </Heading>
            <div className={styles.pairBlokkContainer}>
                <div className={styles.blokk}>
                    <div className={styles.faktaContainer}>{props.saksbehandlingfaktablokk}</div>
                    {props.begrunnelse && (
                        <div>
                            <Heading level="4" size="medium" spacing>
                                {intl.formatMessage({ id: 'vilkår.begrunnelse' })}
                            </Heading>
                            <p>{props.begrunnelse}</p>
                        </div>
                    )}
                </div>
                <div className={styles.blokk}>
                    <div className={styles.faktaContainer}>{props.søknadfaktablokk}</div>
                </div>
            </div>
        </div>
    );
};

export default Vilkårsblokk;
