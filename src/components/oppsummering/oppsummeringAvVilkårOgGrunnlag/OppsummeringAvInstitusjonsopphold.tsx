import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import {
    InstitusjonsoppholdVilkår,
    VurderingsperiodeInstitusjonsopphold,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { formatPeriode } from '~src/utils/periode/periodeUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';
import messages from './oppsummeringAvVilkårOgGrunnlag-nb';

const OppsummeringAvInstitusjonsoppholdvilkår = (props: {
    institusjonsopphold: Nullable<InstitusjonsoppholdVilkår>;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <OppsummeringPar
                className={styles.oppsummeringAvResultat}
                label={formatMessage('vilkår.resultat')}
                // @ts-ignore - liten clash mellom resultatstyper som deleer 'vilkårOppfylt' etc som gjør at typingen ikke forstår det helt. Dette er i realiteten ikke et problem
                verdi={formatMessage(props.institusjonsopphold?.resultat ?? 'vilkår.ikkeVurdert')}
            />
            <ul>
                {props.institusjonsopphold?.vurderingsperioder?.map((u) => (
                    <li key={`${u.vurdering} - ${formatPeriode(u.periode)}`} className={styles.grunnlagsListe}>
                        <VurderingsperiodeInstitusjonsoppholdOppsummering vurderingsperiodeInstitusjonsopphold={u} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const VurderingsperiodeInstitusjonsoppholdOppsummering = (props: {
    vurderingsperiodeInstitusjonsopphold: VurderingsperiodeInstitusjonsopphold;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <>
            <OppsummeringPar
                label={formatMessage('periode')}
                verdi={formatPeriode(props.vurderingsperiodeInstitusjonsopphold.periode)}
            />
            <OppsummeringPar
                label={formatMessage('institusjonsopphold.vilkår.text')}
                verdi={formatMessage(`!bool.${props.vurderingsperiodeInstitusjonsopphold.vurdering}`)}
            />
        </>
    );
};

export default OppsummeringAvInstitusjonsoppholdvilkår;
