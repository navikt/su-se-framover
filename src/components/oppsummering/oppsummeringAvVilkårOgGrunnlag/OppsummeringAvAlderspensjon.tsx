import styles from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/oppsummeringAvVilkårOgGrunnlag.module.less';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar.tsx';
import { useI18n } from '~src/lib/i18n.ts';
import { Nullable } from '~src/lib/types.ts';
import { Aldersvilkår } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår.ts';
import { formatPeriode } from '~src/utils/periode/periodeUtils.ts';

import messages from './oppsummeringAvVilkårOgGrunnlag-nb.ts';

export const OppsummeringAvAlderspensjon = (props: { alderspensjon: Nullable<Aldersvilkår> }) => {
    const alderspensjon = props.alderspensjon;
    const { formatMessage } = useI18n({ messages });

    return (
        <>
            {alderspensjon == null ||
                (alderspensjon.vurderinger.length < 1 && (
                    <OppsummeringPar
                        className={styles.oppsummeringAvResultat}
                        label={formatMessage('vilkår.resultat')}
                        verdi={formatMessage('grunnlag.ikkeVurdert')}
                    />
                ))}
            {alderspensjon && (
                <ul>
                    {alderspensjon.vurderinger.map((vurdering) => (
                        <li
                            key={`${vurdering.periode.fraOgMed}-${vurdering.periode.tilOgMed}`}
                            className={styles.grunnlagsListe}
                        >
                            <OppsummeringPar
                                label={formatMessage('periode')}
                                verdi={formatPeriode(vurdering.periode)}
                            />
                            <OppsummeringPar
                                label={formatMessage('alderspensjon.søktOmAlderspensjon')}
                                verdi={vurdering.pensjonsopplysninger.folketrygd}
                            />
                            <OppsummeringPar
                                label={formatMessage('alderspensjon.søktOmAndrePensjonsordninger')}
                                verdi={vurdering.pensjonsopplysninger.andreNorske}
                            />
                            <OppsummeringPar
                                label={formatMessage('alderspensjon.søktOmPensjonIUtlandet')}
                                verdi={vurdering.pensjonsopplysninger.utenlandske}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};
