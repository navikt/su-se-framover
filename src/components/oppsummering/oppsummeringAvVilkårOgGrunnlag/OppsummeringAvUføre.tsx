import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import {
    UføreResultat,
    UføreVilkår,
    VurderingsperiodeUføre,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { formatPeriode } from '~src/utils/periode/periodeUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';
import messages from './oppsummeringAvVilkårOgGrunnlag-nb';

const OppsummeringAvUførevilkår = (props: { uførevilkår: Nullable<UføreVilkår> }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <OppsummeringPar
                className={styles.oppsummeringAvResultat}
                label={formatMessage('vilkår.resultat')}
                verdi={formatMessage(props.uførevilkår?.resultat ?? 'vilkår.ikkeVurdert')}
            />
            <ul>
                {props.uførevilkår?.vurderinger?.map((u) => (
                    <li key={u.id} className={styles.grunnlagsListe}>
                        <VurderingsperiodeUføreOppsummering vurderingsperiodeUføre={u} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const VurderingsperiodeUføreOppsummering = (props: { vurderingsperiodeUføre: VurderingsperiodeUføre }) => {
    const { formatMessage } = useI18n({ messages });

    switch (props.vurderingsperiodeUføre.resultat) {
        case UføreResultat.VilkårOppfylt:
            return (
                <>
                    <OppsummeringPar
                        label={formatMessage('uførhet.vilkår.erOppfylt')}
                        verdi={formatMessage('grunnlagOgVilkår.oppfylt.ja')}
                    />
                    <OppsummeringPar
                        label={formatMessage('periode')}
                        verdi={formatPeriode(props.vurderingsperiodeUføre.periode)}
                    />
                    <OppsummeringPar
                        label={formatMessage('uførhet.grunnlag.uføregrad')}
                        verdi={`${props.vurderingsperiodeUføre.grunnlag?.uføregrad}%`}
                    />
                    <OppsummeringPar
                        label={formatMessage('uførhet.grunnlag.forventetInntekt')}
                        verdi={props.vurderingsperiodeUføre.grunnlag?.forventetInntekt}
                    />
                </>
            );
        case UføreResultat.VilkårIkkeOppfylt:
            return (
                <>
                    <OppsummeringPar
                        label={formatMessage('uførhet.vilkår.erOppfylt')}
                        verdi={formatMessage('grunnlagOgVilkår.ikkeOppfylt.nei')}
                    />
                    <OppsummeringPar
                        label={formatMessage('periode')}
                        verdi={formatPeriode(props.vurderingsperiodeUføre.periode)}
                    />
                </>
            );
        case UføreResultat.HarUføresakTilBehandling:
            return (
                <>
                    <OppsummeringPar
                        label={formatMessage('uførhet.vilkår.erOppfylt')}
                        verdi={formatMessage('grunnlagOgVilkår.uavklart')}
                    />
                    <OppsummeringPar
                        label={formatMessage('periode')}
                        verdi={formatPeriode(props.vurderingsperiodeUføre.periode)}
                    />
                </>
            );
    }
};

export default OppsummeringAvUførevilkår;
