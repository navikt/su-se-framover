import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import {
    Familiegjenforening,
    FamiliegjenforeningVurdering,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/familieforening/Familieforening';
import { Vilkårstatus } from '~src/types/Vilkår.ts';
import { formatPeriode } from '~src/utils/periode/periodeUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import messages from './oppsummeringAvVilkårOgGrunnlag-nb';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';

const OppsummeringAvFamiliegjenforening = (props: { familiegjenforening: Nullable<Familiegjenforening> }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <OppsummeringPar
                className={styles.oppsummeringAvResultat}
                label={formatMessage('vilkår.resultat')}
                //eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - liten clash mellom resultatstyper som deleer 'vilkårOppfylt' etc som gjør at typingen ikke forstår det helt. Dette er i realiteten ikke et problem
                verdi={formatMessage(props.familiegjenforening?.resultat ?? 'vilkår.ikkeVurdert')}
            />
            <ul>
                {props.familiegjenforening?.vurderinger?.map((u) => (
                    <li key={`${formatPeriode(u.periode)}`} className={styles.grunnlagsListe}>
                        <VurderingsperiodeFlyktningOppsummering vurderingsperiodeFamiliegjenforening={u} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const VurderingsperiodeFlyktningOppsummering = (props: {
    vurderingsperiodeFamiliegjenforening: FamiliegjenforeningVurdering;
}) => {
    const { formatMessage } = useI18n({ messages });
    const jaNei = props.vurderingsperiodeFamiliegjenforening.resultat === Vilkårstatus.VilkårOppfylt ? 'Nei' : 'Ja';
    return (
        <>
            <OppsummeringPar
                label={formatMessage('periode')}
                verdi={formatPeriode(props.vurderingsperiodeFamiliegjenforening.periode)}
            />
            <OppsummeringPar label={formatMessage('familiegjenforening.gjenforentMedFamilieMedlemmer')} verdi={jaNei} />
        </>
    );
};

export default OppsummeringAvFamiliegjenforening;
