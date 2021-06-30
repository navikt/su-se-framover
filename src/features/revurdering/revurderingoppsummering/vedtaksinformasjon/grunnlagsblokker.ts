import { formatPeriode } from '~lib/dateUtils';
import { formatCurrency } from '~lib/formatUtils';
import { UseI18N } from '~lib/hooks';
import {
    erBosituasjonFullstendig,
    BosituasjonTyper,
    Bosituasjon,
} from '~types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { UføreResultat, UføreVilkår } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';

import messages from './vedtaksinformasjon-nb';

type Messages = typeof messages;

export type Grunnlagsblokk = Array<{
    label: string;
    verdi: string;
}>;

export function getUførevilkårgrunnlagsblokker(
    vilkår: UføreVilkår,
    { intl, formatMessage }: UseI18N<Messages>
): Grunnlagsblokk[] {
    return vilkår.vurderinger.map((v) =>
        v.grunnlag && v.resultat === UføreResultat.VilkårOppfylt
            ? [
                  {
                      label: formatMessage('uførhet.label.uføregrad'),
                      verdi: `${v.grunnlag.uføregrad.toString()}%`,
                  },
                  {
                      label: formatMessage('generell.label.periode'),
                      verdi: formatPeriode(v.grunnlag.periode, intl),
                  },
                  {
                      label: formatMessage('uførhet.label.ieu'),
                      verdi: formatCurrency(intl, v.grunnlag.forventetInntekt),
                  },
              ]
            : [
                  {
                      label: formatMessage('uførhet.label.harUførevedtak'),
                      verdi: formatMessage('generell.nei'),
                  },
                  {
                      label: formatMessage('generell.label.periode'),
                      verdi: formatPeriode(v.periode, intl),
                  },
              ]
    );
}

export function getBosituasjongrunnlagsblokker(
    b: Bosituasjon,
    { intl, formatMessage }: UseI18N<Messages>
): Grunnlagsblokk[] {
    if (!erBosituasjonFullstendig(b)) {
        return [];
    }
    const basics = [
        {
            label: formatMessage('generell.label.periode'),
            verdi: formatPeriode(b.periode, intl),
        },
        {
            label: formatMessage('bosituasjon.label.sats'),
            verdi: formatMessage(b.sats === 'ORDINÆR' ? 'bosituasjon.sats.ordinær' : 'bosituasjon.sats.høy'),
        },
        {
            label: formatMessage('generell.label.begrunnelse'),
            verdi: b.begrunnelse ?? '',
        },
    ];
    switch (b.type) {
        case BosituasjonTyper.DELER_BOLIG_MED_VOKSNE:
            return [
                [
                    ...basics,
                    {
                        label: formatMessage('bosituasjon.label.harEps'),
                        verdi: formatMessage('generell.nei'),
                    },
                    {
                        label: formatMessage('bosituasjon.label.delerBolig'),
                        verdi: formatMessage('generell.ja'),
                    },
                ],
            ];
        case BosituasjonTyper.EPS_IKKE_UFØR_FLYKTNING:
            return [
                [
                    ...basics,
                    {
                        label: formatMessage('bosituasjon.label.harEps'),
                        verdi: formatMessage('generell.ja'),
                    },
                    {
                        label: formatMessage('bosituasjon.label.epsUførFlyktning'),
                        verdi: formatMessage('generell.nei'),
                    },
                ],
            ];
        case BosituasjonTyper.EPS_OVER_67:
            return [
                [
                    ...basics,
                    {
                        label: formatMessage('bosituasjon.label.harEps'),
                        verdi: formatMessage('generell.ja'),
                    },
                    {
                        label: formatMessage('bosituasjon.label.epsUførFlyktning'),
                        verdi: formatMessage('generell.nei'),
                    },
                ],
            ];
        case BosituasjonTyper.EPS_UFØR_FLYKTNING:
            return [
                [
                    ...basics,
                    {
                        label: formatMessage('bosituasjon.label.harEps'),
                        verdi: formatMessage('generell.ja'),
                    },
                    {
                        label: formatMessage('bosituasjon.label.epsUførFlyktning'),
                        verdi: formatMessage('generell.ja'),
                    },
                ],
            ];
        case BosituasjonTyper.ENSLIG:
            return [
                [
                    ...basics,
                    {
                        label: formatMessage('bosituasjon.label.harEps'),
                        verdi: formatMessage('generell.nei'),
                    },
                    {
                        label: formatMessage('bosituasjon.label.delerBolig'),
                        verdi: formatMessage('generell.nei'),
                    },
                ],
            ];
    }
}
