import { UseI18N } from '~src/lib/i18n';
import {
    erBosituasjonFullstendig,
    BosituasjonTyper,
    Bosituasjon,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { formatPeriode } from '~src/utils/date/dateUtils';

import messages from './vedtaksinformasjon-nb';

type Messages = typeof messages;

export type Grunnlagsblokk = Array<{
    label: string;
    verdi: string;
}>;

export function getBosituasjongrunnlagsblokker(
    bosituasjoner: Bosituasjon[],
    { formatMessage }: UseI18N<Messages>
): Grunnlagsblokk[] {
    const grunnlagsblokker = bosituasjoner.map((b) => {
        if (!erBosituasjonFullstendig(b)) {
            return [];
        }

        const basics = [
            {
                label: formatMessage('generell.label.periode'),
                verdi: formatPeriode(b.periode),
            },
            {
                label: formatMessage('bosituasjon.label.sats'),
                verdi: formatMessage(b.sats === 'ORDINÆR' ? 'bosituasjon.sats.ordinær' : 'bosituasjon.sats.høy'),
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
            case BosituasjonTyper.EPS_IKKE_UFØR_FLYKTNING:
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
        }
    });

    return grunnlagsblokker.flatMap((b) => {
        return b;
    });
}
