import { IntlShape } from 'react-intl';

import { formatPeriode } from '~lib/dateUtils';
import { formatCurrency } from '~lib/formatUtils';
import { erBosituasjonFullstendig, BosituasjonTyper, Bosituasjon } from '~types/grunnlag/Bosituasjon';
import { UføreResultat, UføreVilkår } from '~types/Vilkår';

export type Grunnlagsblokk = Array<{
    label: string;
    verdi: string;
}>;

export function getUførevilkårgrunnlagsblokker(vilkår: UføreVilkår, intl: IntlShape): Grunnlagsblokk[] {
    return vilkår.vurderinger.map((v) =>
        v.grunnlag && v.resultat === UføreResultat.VilkårOppfylt
            ? [
                  {
                      label: intl.formatMessage({ id: 'uførhet.label.uføregrad' }),
                      verdi: `${v.grunnlag.uføregrad.toString()}%`,
                  },
                  {
                      label: intl.formatMessage({ id: 'generell.label.periode' }),
                      verdi: formatPeriode(v.grunnlag.periode, intl),
                  },
                  {
                      label: intl.formatMessage({ id: 'uførhet.label.ieu' }),
                      verdi: formatCurrency(intl, v.grunnlag.forventetInntekt),
                  },
              ]
            : [
                  {
                      label: intl.formatMessage({ id: 'uførhet.label.harUførevedtak' }),
                      verdi: intl.formatMessage({ id: 'generell.nei' }),
                  },
                  {
                      label: intl.formatMessage({ id: 'generell.label.periode' }),
                      verdi: formatPeriode(v.periode, intl),
                  },
              ]
    );
}

export function getBosituasjongrunnlagsblokker(b: Bosituasjon, intl: IntlShape): Grunnlagsblokk[] {
    if (!erBosituasjonFullstendig(b)) {
        return [];
    }
    const basics = [
        {
            label: intl.formatMessage({ id: 'generell.label.periode' }),
            verdi: formatPeriode(b.periode, intl),
        },
        {
            label: intl.formatMessage({ id: 'bosituasjon.label.sats' }),
            verdi: intl.formatMessage({
                id: b.sats === 'ORDINÆR' ? 'bosituasjon.sats.ordinær' : 'bosituasjon.sats.høy',
            }),
        },
        {
            label: intl.formatMessage({ id: 'generell.label.begrunnelse' }),
            verdi: b.begrunnelse ?? '',
        },
    ];
    switch (b.type) {
        case BosituasjonTyper.DELER_BOLIG_MED_VOKSNE:
            return [
                [
                    ...basics,
                    {
                        label: intl.formatMessage({ id: 'bosituasjon.label.harEps' }),
                        verdi: intl.formatMessage({ id: 'generell.nei' }),
                    },
                    {
                        label: intl.formatMessage({ id: 'bosituasjon.label.delerBolig' }),
                        verdi: intl.formatMessage({ id: 'generell.ja' }),
                    },
                ],
            ];
        case BosituasjonTyper.EPS_IKKE_UFØR_FLYKTNING:
            return [
                [
                    ...basics,
                    {
                        label: intl.formatMessage({ id: 'bosituasjon.label.harEps' }),
                        verdi: intl.formatMessage({ id: 'generell.ja' }),
                    },
                    {
                        label: intl.formatMessage({ id: 'bosituasjon.label.epsUførFlyktning' }),
                        verdi: intl.formatMessage({ id: 'generell.nei' }),
                    },
                ],
            ];
        case BosituasjonTyper.EPS_OVER_67:
            return [
                [
                    ...basics,
                    {
                        label: intl.formatMessage({ id: 'bosituasjon.label.harEps' }),
                        verdi: intl.formatMessage({ id: 'generell.ja' }),
                    },
                    {
                        label: intl.formatMessage({ id: 'bosituasjon.label.epsUførFlyktning' }),
                        verdi: intl.formatMessage({ id: 'generell.nei' }),
                    },
                ],
            ];
        case BosituasjonTyper.EPS_UFØR_FLYKTNING:
            return [
                [
                    ...basics,
                    {
                        label: intl.formatMessage({ id: 'bosituasjon.label.harEps' }),
                        verdi: intl.formatMessage({ id: 'generell.ja' }),
                    },
                    {
                        label: intl.formatMessage({ id: 'bosituasjon.label.epsUførFlyktning' }),
                        verdi: intl.formatMessage({ id: 'generell.ja' }),
                    },
                ],
            ];
        case BosituasjonTyper.ENSLIG:
            return [
                [
                    ...basics,
                    {
                        label: intl.formatMessage({ id: 'bosituasjon.label.harEps' }),
                        verdi: intl.formatMessage({ id: 'generell.nei' }),
                    },
                    {
                        label: intl.formatMessage({ id: 'bosituasjon.label.delerBolig' }),
                        verdi: intl.formatMessage({ id: 'generell.nei' }),
                    },
                ],
            ];
    }
}
