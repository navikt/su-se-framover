import * as Routes from '~src/lib/routes';
import { Behandlingsinformasjon, FormueStatus, Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Aldersresultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { erBosituasjonFullstendig } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Sakstype } from '~src/types/Sak';
import { Behandlingsstatus, Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { Vilkårtype, VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';
import { hentBosituasjongrunnlag } from '~src/utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

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
        case Vilkårtype.OppholdIUtlandet:
            return 'Opphold i utlandet';
        case Vilkårtype.Sats:
            return 'Vurdering av sats';
        case Vilkårtype.Beregning:
            return 'Beregning';
    }
};

type VilkårVurderingStatusMapping<T extends number | string | symbol> = Record<T, VilkårVurderingStatus>;

function getVilkårVurderingStatus<T extends number | string | symbol>(
    mapping: VilkårVurderingStatusMapping<T>,
    value: T | undefined | null
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
    flyktning: GrunnlagsdataOgVilkårsvurderinger['flyktning']
): Vilkårsinformasjon[] => [
    {
        status: getVilkårVurderingStatus(
            {
                [UføreResultat.VilkårIkkeOppfylt]: VilkårVurderingStatus.IkkeOk,
                [UføreResultat.HarUføresakTilBehandling]: VilkårVurderingStatus.Uavklart,
                [UføreResultat.VilkårOppfylt]: VilkårVurderingStatus.Ok,
            },
            uføre?.resultat
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
    familieforening: GrunnlagsdataOgVilkårsvurderinger['familiegjenforening']
): Vilkårsinformasjon[] => [
    {
        status: getVilkårVurderingStatus(
            {
                [Aldersresultat.HarAlderssakTilBehandling]: VilkårVurderingStatus.Uavklart,
                [Aldersresultat.VilkårOppfylt]: VilkårVurderingStatus.Ok,
                [Aldersresultat.VilkårIkkeOppfylt]: VilkårVurderingStatus.IkkeOk,
            },
            pensjon?.resultat
        ),
        vilkårtype: Vilkårtype.Alderspensjon,
        erStartet: pensjon !== null,
    },
    {
        status: getVilkårVurderingStatus(defaultVilkårstatusMapping, familieforening?.resultat),
        vilkårtype: Vilkårtype.Familieforening,
        erStartet: familieforening !== null,
    },
];

export const mapToVilkårsinformasjon = (
    sakstype: Sakstype,
    behandlingsinformasjon: Behandlingsinformasjon,
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger
): Vilkårsinformasjon[] => {
    const { institusjonsopphold } = behandlingsinformasjon;
    const {
        flyktning,
        pensjon,
        fastOpphold,
        familiegjenforening,
        lovligOpphold,
        formue,
        uføre,
        utenlandsopphold,
        personligOppmøte,
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
            status: getVilkårVurderingStatus(defaultVilkårstatusMapping, institusjonsopphold?.status),
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
                utenlandsopphold?.status
            ),
            vilkårtype: Vilkårtype.OppholdIUtlandet,
            erStartet: utenlandsopphold !== null,
        },
        {
            status: getVilkårVurderingStatus(
                {
                    [FormueStatus.MåInnhenteMerInformasjon]: VilkårVurderingStatus.Uavklart,
                    [FormueStatus.VilkårOppfylt]: VilkårVurderingStatus.Ok,
                    [FormueStatus.VilkårIkkeOppfylt]: VilkårVurderingStatus.IkkeOk,
                },
                formue.resultat
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
            status: getSatsStatus(b),
            vilkårtype: Vilkårtype.Sats,
            erStartet: erSatsStartet(b),
        },
        {
            status:
                b.beregning === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : b.status === Behandlingsstatus.BEREGNET_AVSLAG
                    ? VilkårVurderingStatus.IkkeOk
                    : VilkårVurderingStatus.Ok,
            vilkårtype: Vilkårtype.Beregning,
            erStartet: b.beregning !== null,
        },
    ];
};

const getSatsStatus = (b: Søknadsbehandling) => {
    //vi sjekker på behandlingsstatus fordi at man kan endre på vilkår etter sats-steget, som ikke resetter sats.
    if (b.status === Behandlingsstatus.OPPRETTET || b.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG) {
        return VilkårVurderingStatus.IkkeVurdert;
    }

    if (erBosituasjonFullstendig(hentBosituasjongrunnlag(b.grunnlagsdataOgVilkårsvurderinger))) {
        return VilkårVurderingStatus.Ok;
    }
    return VilkårVurderingStatus.IkkeVurdert;
};

const erSatsStartet = (b: Søknadsbehandling) => {
    //vi sjekker på behandlingsstatus fordi at man kan endre på vilkår etter sats-steget, som ikke resetter sats.
    if (b.status === Behandlingsstatus.OPPRETTET || b.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG) {
        return false;
    }

    return !!erBosituasjonFullstendig(hentBosituasjongrunnlag(b.grunnlagsdataOgVilkårsvurderinger));
};
