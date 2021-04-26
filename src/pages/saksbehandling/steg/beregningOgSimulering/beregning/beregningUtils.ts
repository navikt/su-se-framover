import { toDateOrNull } from '~lib/dateUtils';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Fradrag, Fradragstype, FradragTilhører } from '~types/Fradrag';

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

export const fradragTilFradragFormData = (fradrag: Fradrag) => ({
    type: fradrag.type || null,
    beløp: fradrag.beløp.toString() || null,
    fraUtland: fradrag.utenlandskInntekt !== null,
    utenlandskInntekt: {
        beløpIUtenlandskValuta: fradrag.utenlandskInntekt?.beløpIUtenlandskValuta.toString() ?? '',
        valuta: fradrag.utenlandskInntekt?.valuta ?? '',
        kurs: fradrag.utenlandskInntekt?.kurs.toString() ?? '',
    },
    tilhørerEPS: fradrag.tilhører === FradragTilhører.EPS,
    periode: {
        fraOgMed: toDateOrNull(fradrag.periode?.fraOgMed),
        tilOgMed: toDateOrNull(fradrag.periode?.tilOgMed),
    },
});
