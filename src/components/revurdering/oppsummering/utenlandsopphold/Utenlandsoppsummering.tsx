import React from 'react';

import { OppsummeringPar } from '~components/revurdering/oppsummering/oppsummeringspar/Oppsummeringspar';
import { useI18n } from '~lib/i18n';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';

import messages from './utenlandsoppsummering-nb';
import styles from './utenlandsoppsummering.module.less';

export const Utenlandsoppsummering = (props: Pick<GrunnlagsdataOgVilkårsvurderinger, 'oppholdIUtlandet'>) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.utenlandsoppsummering}>
            <OppsummeringPar
                label={formatMessage('status.label')}
                verdi={props.oppholdIUtlandet.status && formatMessage(props.oppholdIUtlandet.status)}
            />
            <OppsummeringPar label={formatMessage('begrunnelse.label')} verdi={props.oppholdIUtlandet.begrunnelse} />
        </div>
    );
};
