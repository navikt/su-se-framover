import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Periode } from '~src/types/Periode';

export interface VurderingsperiodeUtenlandsopphold {
    status: Utenlandsoppholdstatus;
    periode: Periode<string>;
}

export interface UtenlandsoppholdVilkår {
    vurderinger: VurderingsperiodeUtenlandsopphold[];
    status: Utenlandsoppholdstatus;
}

export enum Utenlandsoppholdstatus {
    SkalVæreMerEnn90DagerIUtlandet = 'SkalVæreMerEnn90DagerIUtlandet',
    SkalHoldeSegINorge = 'SkalHoldeSegINorge',
    Uavklart = 'Uavklart',
}

export interface UtenlandsoppholdRequest {
    sakId: string;
    behandlingId: string;
    utenlandsopphold: VurderingsperiodeUtenlandsopphold[];
}

export const vilkårStatusTilUtenlandsoppholdStatus = (v: Vilkårstatus): Utenlandsoppholdstatus => {
    switch (v) {
        case Vilkårstatus.Uavklart:
            return Utenlandsoppholdstatus.Uavklart;
        case Vilkårstatus.VilkårIkkeOppfylt:
            return Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet;
        case Vilkårstatus.VilkårOppfylt:
            return Utenlandsoppholdstatus.SkalHoldeSegINorge;
    }
};

export const utenlandsoppholdStatusTilVilkårStatus = (u: Utenlandsoppholdstatus): Vilkårstatus => {
    switch (u) {
        case Utenlandsoppholdstatus.SkalHoldeSegINorge:
            return Vilkårstatus.VilkårOppfylt;
        case Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet:
            return Vilkårstatus.VilkårIkkeOppfylt;
        case Utenlandsoppholdstatus.Uavklart:
            return Vilkårstatus.Uavklart;
    }
};
