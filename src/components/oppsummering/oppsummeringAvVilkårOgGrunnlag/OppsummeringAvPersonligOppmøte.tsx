import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import {
    PersonligOppmøteVilkår,
    PersonligOppmøteÅrsak,
    VurderingsperiodePersonligOppmøte,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår';
import { formatPeriode } from '~src/utils/periode/periodeUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import styles from './oppsummeringAvVilkårOgGrunnlag.module.less';
import messages from './oppsummeringAvVilkårOgGrunnlag-nb';

const OppsummeringAvPersonligoppmøtevilkår = (props: { personligoppmøte: Nullable<PersonligOppmøteVilkår> }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <OppsummeringPar
                className={styles.oppsummeringAvResultat}
                label={formatMessage('vilkår.resultat')}
                //eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - liten clash mellom resultatstyper som deleer 'vilkårOppfylt' etc som gjør at typingen ikke forstår det helt. Dette er i realiteten ikke et problem
                verdi={formatMessage(props.personligoppmøte?.resultat ?? 'vilkår.ikkeVurdert')}
            />
            <ul>
                {props.personligoppmøte?.vurderinger?.map((u) => (
                    <li key={`${u.resultat} - ${formatPeriode(u.periode)}`} className={styles.grunnlagsListe}>
                        <VurderingsperiodePersonligOppmøteOppsummering vurderingsperiodePersonligOppmøte={u} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const VurderingsperiodePersonligOppmøteOppsummering = (props: {
    vurderingsperiodePersonligOppmøte: VurderingsperiodePersonligOppmøte;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <>
            <OppsummeringPar
                label={formatMessage('periode')}
                verdi={formatPeriode(props.vurderingsperiodePersonligOppmøte.periode)}
            />
            <OppsummeringPar
                label={formatMessage('personligOppmøte.vilkår.text')}
                verdi={formatMessage(
                    `bool.${props.vurderingsperiodePersonligOppmøte.vurdering === PersonligOppmøteÅrsak.MøttPersonlig}`,
                )}
            />
            {props.vurderingsperiodePersonligOppmøte.vurdering !== PersonligOppmøteÅrsak.MøttPersonlig && (
                <OppsummeringPar
                    label={formatMessage('personligOppmøte.vilkår.text.ikkeMøttPersonlig')}
                    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore - liten clash mellom alle tekst-mappingstypene som gjør at kompileringen ikke helt forstår hva som skjer. Dette er i realiteten ikke er problem
                    verdi={formatMessage(props.vurderingsperiodePersonligOppmøte.vurdering)}
                />
            )}
        </>
    );
};

export default OppsummeringAvPersonligoppmøtevilkår;
