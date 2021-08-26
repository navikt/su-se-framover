import { Undertittel } from 'nav-frontend-typografi';
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
            <div className={styles.blokkHeader}>
                {props.status ? (
                    <VilkårvurderingStatusIcon
                        className={styles.ikon}
                        status={props.status}
                        showIkkeVurdertAsUavklart
                    />
                ) : null}
                {props.tittel}
            </div>
            <div className={styles.pairBlokkContainer}>
                <div className={styles.blokk}>
                    <div className={styles.faktaContainer}>{props.saksbehandlingfaktablokk}</div>
                    {props.begrunnelse && (
                        <div>
                            <Undertittel className={styles.blokkOverskrift}>
                                {intl.formatMessage({ id: 'vilkår.begrunnelse' })}
                            </Undertittel>
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
