import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import {
    FlyktningVilkår,
    VurderingsperiodeFlyktning,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/FlyktningVilkår';
import { formatPeriode } from '~src/utils/periode/periodeUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';
import messages from './oppsummeringAvVilkårOgGrunnlag-nb';

const OppsummeringAvFlyktningvilkår = (props: { flyktning: Nullable<FlyktningVilkår> }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <OppsummeringPar
                className={styles.oppsummeringAvResultat}
                label={formatMessage('vilkår.resultat')}
                // @ts-ignore - liten clash mellom resultatstyper som deleer 'vilkårOppfylt' etc som gjør at typingen ikke forstår det helt. Dette er i realiteten ikke et problem
                verdi={formatMessage(props.flyktning?.resultat ?? 'vilkår.ikkeVurdert')}
            />
            <ul>
                {props.flyktning?.vurderinger?.map((u) => (
                    <li key={`${u.resultat} - ${formatPeriode(u.periode)}`} className={styles.grunnlagsListe}>
                        <VurderingsperiodeFlyktningOppsummering vurderingsperiodeFlyktning={u} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const VurderingsperiodeFlyktningOppsummering = (props: { vurderingsperiodeFlyktning: VurderingsperiodeFlyktning }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <>
            <OppsummeringPar
                label={formatMessage('periode')}
                verdi={formatPeriode(props.vurderingsperiodeFlyktning.periode)}
            />
            <OppsummeringPar
                label={formatMessage('flyktning.vilkår.text')}
                verdi={formatMessage(`bool.${props.vurderingsperiodeFlyktning.resultat}`)}
            />
        </>
    );
};

export default OppsummeringAvFlyktningvilkår;
