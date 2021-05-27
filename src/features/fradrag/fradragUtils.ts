import { IntlShape } from 'react-intl';

import { Fradragstype, FradragTilhører } from '~types/Fradrag';

export function getFradragstypeString(f: Fradragstype, intl: IntlShape) {
    return intl.formatMessage({ id: fradragstypeResourceId(f) });
}

export function getFradragstypeStringMedEpsSpesifisering(f: Fradragstype, tilhører: FradragTilhører, intl: IntlShape) {
    const type = getFradragstypeString(f, intl);
    switch (tilhører) {
        case FradragTilhører.Bruker:
            return type;
        case FradragTilhører.EPS:
            return `${type} ${intl.formatMessage({ id: 'fradrag.suffix.eps' })}`;
    }
}

function fradragstypeResourceId(f: Fradragstype) {
    switch (f) {
        case Fradragstype.NAVytelserTilLivsopphold:
            return 'fradrag.type.navytelsertillivsopphold';
        case Fradragstype.Arbeidsinntekt:
            return 'fradrag.type.arbeidsinntekt';
        case Fradragstype.OffentligPensjon:
            return 'fradrag.type.offentligpensjon';
        case Fradragstype.PrivatPensjon:
            return 'fradrag.type.privatpensjon';
        case Fradragstype.Sosialstønad:
            return 'fradrag.type.sosialstønad';
        case Fradragstype.Kontantstøtte:
            return 'fradrag.type.kontantstøtte';
        case Fradragstype.Introduksjonsstønad:
            return 'fradrag.type.introduksjonsstønad';
        case Fradragstype.Kvalifiseringsstønad:
            return 'fradrag.type.kvalifiseringsstønad';
        case Fradragstype.BidragEtterEkteskapsloven:
            return 'fradrag.type.bidragetterekteskapsloven';
        case Fradragstype.Kapitalinntekt:
            return 'fradrag.type.kapitalinntekt';
        case Fradragstype.ForventetInntekt:
            return 'fradrag.type.forventetinntekt';
        case Fradragstype.BeregnetFradragEPS:
            return 'fradrag.type.beregnetFradragEPS';
        case Fradragstype.UnderMinstenivå:
            return 'fradrag.type.underMinstenivå';
    }
}
