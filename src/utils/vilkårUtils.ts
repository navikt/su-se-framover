import * as Routes from '~src/lib/routes';
import { Aldersresultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { FormueStatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Sakstype } from '~src/types/Sak';
import { Søknadsbehandling, SøknadsbehandlingStatus } from '~src/types/Søknadsbehandling';
import { Vilkårstatus } from '~src/types/Vilkår';
import { Vilkårtype, VilkårtypeAlder, VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';

export const createVilkårUrl = (props: { sakId: string; behandlingId: string; vilkar: Vilkårtype }) =>
    Routes.saksbehandlingVilkårsvurdering.createURL({
        sakId: props.sakId,
        behandlingId: props.behandlingId,
        vilkar: props.vilkar,
    });

export interface Vilkårsinformasjon {
    status: VilkårVurderingStatus;
    vilkårtype: Vilkårtype;
    erStartet: boolean;
}

export const vilkårTittelFormatted = (type: Vilkårtype) => {
    // TODO: bruke i18n
    switch (type) {
        case Vilkårtype.Virkningstidspunkt:
            return 'Virkningstidspunkt';
        case Vilkårtype.Alderspensjon:
            return 'Alderspensjon';
        case Vilkårtype.Familieforening:
            return 'Familieforening';
        case Vilkårtype.OppholdstillatelseAlder:
            return 'Oppholdstillatelse Alder';
        case Vilkårtype.BorOgOppholderSegINorge:
            return 'Bo og opphold i Norge';
        case Vilkårtype.Flyktning:
            return 'Flyktning';
        case Vilkårtype.Formue:
            return 'Formue';
        case Vilkårtype.Oppholdstillatelse:
            return 'Oppholdstillatelse';
        case Vilkårtype.PersonligOppmøte:
            return 'Personlig oppmøte';
        case Vilkårtype.Uførhet:
            return 'Uførhet';
        case Vilkårtype.LovligOpphold:
            return 'Lovlig opphold';
        case Vilkårtype.Institusjonsopphold:
            return 'Institusjonsopphold';
        case Vilkårtype.FastOppholdINorge:
            return 'Opphold i Norge';
        case Vilkårtype.Bosituasjon:
            return 'Bosituasjon & Sats';
        case Vilkårtype.OppholdIUtlandet:
            return 'Opphold i utlandet';
        case Vilkårtype.Beregning:
            return 'Beregning';
        case VilkårtypeAlder.GammelNok:
            return 'Alder';
    }
};

type VilkårVurderingStatusMapping<T extends number | string | symbol> = Record<T, VilkårVurderingStatus>;

function getVilkårVurderingStatus<T extends number | string | symbol>(
    mapping: VilkårVurderingStatusMapping<T>,
    value: T | undefined | null,
): VilkårVurderingStatus {
    if (!value) {
        return VilkårVurderingStatus.IkkeVurdert;
    }
    return mapping[value];
}

const defaultVilkårstatusMapping: VilkårVurderingStatusMapping<Vilkårstatus> = {
    [Vilkårstatus.Uavklart]: VilkårVurderingStatus.Uavklart,
    [Vilkårstatus.VilkårIkkeOppfylt]: VilkårVurderingStatus.IkkeOk,
    [Vilkårstatus.VilkårOppfylt]: VilkårVurderingStatus.Ok,
} as const;

const mapToVilkårsinformasjonUføre = (
    uføre: GrunnlagsdataOgVilkårsvurderinger['uføre'],
    flyktning: GrunnlagsdataOgVilkårsvurderinger['flyktning'],
): Vilkårsinformasjon[] => [
    {
        status: getVilkårVurderingStatus(
            {
                [UføreResultat.VilkårIkkeOppfylt]: VilkårVurderingStatus.IkkeOk,
                [UføreResultat.HarUføresakTilBehandling]: VilkårVurderingStatus.Uavklart,
                [UføreResultat.VilkårOppfylt]: VilkårVurderingStatus.Ok,
            },
            uføre?.resultat,
        ),
        vilkårtype: Vilkårtype.Uførhet,
        erStartet: uføre !== null,
    },
    {
        status: getVilkårVurderingStatus(defaultVilkårstatusMapping, flyktning?.resultat),
        vilkårtype: Vilkårtype.Flyktning,
        erStartet: flyktning !== null,
    },
];

const mapToVilkårsinformasjonAlder = (
    pensjon: GrunnlagsdataOgVilkårsvurderinger['pensjon'],
    familieforening: GrunnlagsdataOgVilkårsvurderinger['familiegjenforening'],
): Vilkårsinformasjon[] => [
    {
        status: getVilkårVurderingStatus(defaultVilkårstatusMapping, familieforening?.resultat),
        vilkårtype: Vilkårtype.Familieforening,
        erStartet: familieforening !== null,
    },
    {
        status: getVilkårVurderingStatus(
            {
                [Aldersresultat.HarAlderssakTilBehandling]: VilkårVurderingStatus.Uavklart,
                [Aldersresultat.VilkårOppfylt]: VilkårVurderingStatus.Ok,
                [Aldersresultat.VilkårIkkeOppfylt]: VilkårVurderingStatus.IkkeOk,
            },
            pensjon?.resultat,
        ),
        vilkårtype: Vilkårtype.Alderspensjon,
        erStartet: pensjon !== null,
    },
];

export const mapToVilkårsinformasjon = (
    sakstype: Sakstype,
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger,
): Vilkårsinformasjon[] => {
    const {
        flyktning,
        pensjon,
        fastOpphold,
        familiegjenforening,
        lovligOpphold,
        formue,
        bosituasjon,
        uføre,
        utenlandsopphold,
        personligOppmøte,
        institusjonsopphold,
    } = grunnlagsdataOgVilkårsvurderinger;

    const uførevilkår = sakstype === Sakstype.Uføre ? mapToVilkårsinformasjonUføre(uføre, flyktning) : [];
    const aldersvilkår =
        sakstype === Sakstype.Alder ? mapToVilkårsinformasjonAlder(pensjon, familiegjenforening ?? null) : [];

    return [
        ...uførevilkår,
        ...aldersvilkår,
        {
            status: getVilkårVurderingStatus(defaultVilkårstatusMapping, lovligOpphold?.resultat),
            vilkårtype: Vilkårtype.LovligOpphold,
            erStartet: lovligOpphold !== null,
        },
        {
            status: getVilkårVurderingStatus(defaultVilkårstatusMapping, fastOpphold?.resultat),
            vilkårtype: Vilkårtype.FastOppholdINorge,
            erStartet: fastOpphold !== null,
        },
        {
            status: getVilkårVurderingStatus(defaultVilkårstatusMapping, institusjonsopphold?.resultat),
            vilkårtype: Vilkårtype.Institusjonsopphold,
            erStartet: institusjonsopphold !== null,
        },
        {
            status: getVilkårVurderingStatus(
                {
                    [Utenlandsoppholdstatus.Uavklart]: VilkårVurderingStatus.Uavklart,
                    [Utenlandsoppholdstatus.SkalHoldeSegINorge]: VilkårVurderingStatus.Ok,
                    [Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet]: VilkårVurderingStatus.IkkeOk,
                },
                utenlandsopphold?.status,
            ),
            vilkårtype: Vilkårtype.OppholdIUtlandet,
            erStartet: utenlandsopphold !== null,
        },
        {
            status: bosituasjon.length > 0 ? VilkårVurderingStatus.Ok : VilkårVurderingStatus.IkkeVurdert,
            vilkårtype: Vilkårtype.Bosituasjon,
            erStartet: bosituasjon.length > 0,
        },
        {
            status: getVilkårVurderingStatus(
                {
                    [FormueStatus.MåInnhenteMerInformasjon]: VilkårVurderingStatus.Uavklart,
                    [FormueStatus.VilkårOppfylt]: VilkårVurderingStatus.Ok,
                    [FormueStatus.VilkårIkkeOppfylt]: VilkårVurderingStatus.IkkeOk,
                },
                formue.resultat,
            ),
            vilkårtype: Vilkårtype.Formue,
            erStartet: formue.resultat !== null,
        },
        {
            status: getVilkårVurderingStatus(defaultVilkårstatusMapping, personligOppmøte?.resultat),
            vilkårtype: Vilkårtype.PersonligOppmøte,
            erStartet: personligOppmøte !== null,
        },
    ];
};

export const vilkårsinformasjonForBeregningssteg = (b: Søknadsbehandling): Vilkårsinformasjon[] => {
    return [
        {
            status:
                b.beregning === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : b.status === SøknadsbehandlingStatus.BEREGNET_AVSLAG
                      ? VilkårVurderingStatus.IkkeOk
                      : VilkårVurderingStatus.Ok,
            vilkårtype: Vilkårtype.Beregning,
            erStartet: b.beregning !== null,
        },
    ];
};

export const erAlleVilkårStartet = (sakstype: Sakstype, g: GrunnlagsdataOgVilkårsvurderinger) => {
    return mapToVilkårsinformasjon(sakstype, g).every((v) => v.erStartet);
};

export const erAlleVilkårVurdert = (vilkårsinformasjon: Vilkårsinformasjon[]): boolean =>
    vilkårsinformasjon.every((x) => x.status !== VilkårVurderingStatus.IkkeVurdert);

export const erNoenVurdertUavklart = (vilkårsinformasjon: Vilkårsinformasjon[]): boolean => {
    return vilkårsinformasjon.some((x) => x.status === VilkårVurderingStatus.Uavklart);
};
