import { BodyShort, Label } from '@navikt/ds-react';
import * as React from 'react';

import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { useI18n } from '~lib/i18n';
import { VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import messages from './formuestatus-nb';
import styles from './formuestatus.module.less';

const Formuestatus = (props: { bekreftetFormue: number; erVilkårOppfylt: boolean }) => {
    const { intl } = useI18n({ messages });

    return (
        <div className={styles.statusContainer}>
            <div>
                <BodyShort>{intl.formatMessage({ id: 'formueblokk.totalFormue' })}</BodyShort>
                <Label>
                    {props.bekreftetFormue} {intl.formatMessage({ id: 'panel.kroner' })}
                </Label>
            </div>

            <div className={styles.status}>
                <VilkårvurderingStatusIcon
                    status={props.erVilkårOppfylt ? VilkårVurderingStatus.Ok : VilkårVurderingStatus.IkkeOk}
                />
                <div className={styles.statusInformasjon}>
                    <p>
                        {props.erVilkårOppfylt
                            ? intl.formatMessage({ id: 'formueblokk.vilkårOppfylt' })
                            : intl.formatMessage({ id: 'formueblokk.vilkårIkkeOppfylt' })}
                    </p>
                    <p>
                        {props.erVilkårOppfylt
                            ? intl.formatMessage({ id: 'formueblokk.vilkårOppfyltGrunn' })
                            : intl.formatMessage({ id: 'formueblokk.vilkårIkkeOppfyltGrunn' })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Formuestatus;
