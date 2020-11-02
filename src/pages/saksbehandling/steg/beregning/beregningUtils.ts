import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Fradragstype } from '~types/Fradrag';

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
    }
};

export const erGyldigBehandlingsstatus = (behandling: Behandling) =>
    [
        Behandlingsstatus.BEREGNET_AVSLAG,
        Behandlingsstatus.BEREGNET_INNVILGET,
        Behandlingsstatus.SIMULERT,
        Behandlingsstatus.VILKÅRSVURDERT_INNVILGET,
    ].some((status) => status === behandling.status);
