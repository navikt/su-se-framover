import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Fradrag, Fradragstype, FradragTilhører } from '~types/Fradrag';

import { FradragFormData } from './FradragInputs';

export const fradragstypeResourceId = (f: Fradragstype): string => {
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
};

export const erIGyldigStatusForÅKunneBeregne = (behandling: Behandling) =>
    [
        Behandlingsstatus.BEREGNET_AVSLAG,
        Behandlingsstatus.BEREGNET_INNVILGET,
        Behandlingsstatus.SIMULERT,
        Behandlingsstatus.VILKÅRSVURDERT_INNVILGET,
        Behandlingsstatus.UNDERKJENT_AVSLAG,
        Behandlingsstatus.UNDERKJENT_INNVILGET,
    ].some((status) => status === behandling.status);

export const FradragTilFradragFormData = (fradrag: Fradrag[]): FradragFormData[] => {
    const fradragFormData: FradragFormData[] = fradrag.map((f) => {
        return {
            type: f.type || null,
            beløp: f.beløp.toString() || null,
            fraUtland: f.utenlandskInntekt !== null,
            utenlandskInntekt: {
                beløpIUtenlandskValuta: f.utenlandskInntekt?.beløpIUtenlandskValuta.toString() ?? '',
                valuta: f.utenlandskInntekt?.valuta ?? '',
                kurs: f.utenlandskInntekt?.kurs.toString() ?? '',
            },
            tilhørerEPS: f.tilhører === FradragTilhører.EPS,
            periode: f.periode,
        };
    });
    return fradragFormData;
};
