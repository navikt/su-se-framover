import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { OpplysningspliktVilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';
import { formatPeriode } from '~src/utils/date/dateUtils';

import { OppsummeringPar } from '../oppsummeringspar/Oppsummeringsverdi';

import messages from './oppsummeringAvVilkårOgGrunnlag-nb';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';

const OppsummeringAvOpplysningspliktvilkår = (props: { opplysningspliktVilkår: Nullable<OpplysningspliktVilkår> }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.oppsummeringsContainer}>
            <ul>
                {props.opplysningspliktVilkår?.vurderinger?.map((o) => (
                    <li key={`${o.beskrivelse} - ${o.periode.fraOgMed}`} className={styles.grunnlagsListe}>
                        <OppsummeringPar label={formatMessage('periode')} verdi={formatPeriode(o.periode)} />
                        <OppsummeringPar
                            label={`${formatMessage('opplysningsplikt.vilkår.vurderingAvDokumentasjon')}:`}
                            verdi={formatMessage(o.beskrivelse ?? 'vilkår.ikkeVurdert')}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OppsummeringAvOpplysningspliktvilkår;
