import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import {
    Behandlingsinformasjon,
    FormueStatus,
    PersonligOppmøteStatus,
    PersonligOppmøte,
    Vilkårstatus,
} from '~types/Behandlingsinformasjon';
import { erBosituasjonFullstendig } from '~types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';
import { hentBosituasjongrunnlag } from '~utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

export const createVilkårUrl = (props: { sakId: string; behandlingId: string; vilkar: Vilkårtype }) =>
    Routes.saksbehandlingVilkårsvurdering.createURL({
        sakId: props.sakId,
        behandlingId: props.behandlingId,
        vilkar: props.vilkar,
    });

export interface Vilkårsinformasjon {
    status: VilkårVurderingStatus;
    vilkårtype: Vilkårtype;
    begrunnelse: Nullable<string>;
    erStartet: boolean;
}

export const vilkårTittelFormatted = (type: Vilkårtype) => {
    switch (type) {
        case Vilkårtype.Virkningstidspunkt:
            return 'Virkningstidspunkt';
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

const getBehandlingsinformasjonStatus = <VilkårKey extends keyof Behandlingsinformasjon>(
    vilkår: Behandlingsinformasjon[VilkårKey]
) => {
    switch (vilkår?.status) {
        case Vilkårstatus.Uavklart:
            return VilkårVurderingStatus.Uavklart;
        case Vilkårstatus.VilkårOppfylt:
            return VilkårVurderingStatus.Ok;
        case Vilkårstatus.VilkårIkkeOppfylt:
            return VilkårVurderingStatus.IkkeOk;
        default:
            return VilkårVurderingStatus.IkkeVurdert;
    }
};

export const mapToVilkårsinformasjon = (
    behandlingsinformasjon: Behandlingsinformasjon,
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger
): Vilkårsinformasjon[] => {
    const { flyktning, lovligOpphold, fastOppholdINorge, institusjonsopphold, formue, personligOppmøte } =
        behandlingsinformasjon;
    const { uføre, utenlandsopphold } = grunnlagsdataOgVilkårsvurderinger;

    return [
        {
            status:
                uføre === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : uføre?.resultat === UføreResultat.HarUføresakTilBehandling
                    ? VilkårVurderingStatus.Uavklart
                    : uføre?.resultat === UføreResultat.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.Uførhet,
            begrunnelse: uføre?.vurderinger[0]?.begrunnelse ?? null,
            erStartet: uføre !== null,
        },
        {
            status: getBehandlingsinformasjonStatus(flyktning),
            vilkårtype: Vilkårtype.Flyktning,
            begrunnelse: behandlingsinformasjon.flyktning?.begrunnelse ?? null,
            erStartet: flyktning !== null,
        },
        {
            status: getBehandlingsinformasjonStatus(lovligOpphold),
            vilkårtype: Vilkårtype.LovligOpphold,
            begrunnelse: behandlingsinformasjon.lovligOpphold?.begrunnelse ?? null,
            erStartet: lovligOpphold !== null,
        },
        {
            status: getBehandlingsinformasjonStatus(fastOppholdINorge),
            vilkårtype: Vilkårtype.FastOppholdINorge,
            begrunnelse: behandlingsinformasjon.fastOppholdINorge?.begrunnelse ?? null,
            erStartet: fastOppholdINorge !== null,
        },
        {
            status: getBehandlingsinformasjonStatus(institusjonsopphold),
            vilkårtype: Vilkårtype.Institusjonsopphold,
            begrunnelse: behandlingsinformasjon.institusjonsopphold?.begrunnelse ?? null,
            erStartet: institusjonsopphold !== null,
        },
        {
            status:
                utenlandsopphold === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : utenlandsopphold?.status === Utenlandsoppholdstatus.Uavklart
                    ? VilkårVurderingStatus.Uavklart
                    : utenlandsopphold?.status === Utenlandsoppholdstatus.SkalHoldeSegINorge
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.OppholdIUtlandet,
            begrunnelse: utenlandsopphold?.vurderinger[0]?.begrunnelse ?? null,
            erStartet: utenlandsopphold !== null,
        },
        {
            status:
                formue === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : formue.status === FormueStatus.MåInnhenteMerInformasjon
                    ? VilkårVurderingStatus.Uavklart
                    : formue.status === FormueStatus.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.Formue,
            begrunnelse: behandlingsinformasjon.formue?.begrunnelse ?? null,
            erStartet: formue !== null,
        },
        {
            status: statusForPersonligOppmøte(personligOppmøte),
            vilkårtype: Vilkårtype.PersonligOppmøte,
            begrunnelse: behandlingsinformasjon.personligOppmøte?.begrunnelse ?? null,
            erStartet: personligOppmøte !== null,
        },
    ];
};

export const vilkårsinformasjonForBeregningssteg = (b: Behandling): Vilkårsinformasjon[] => {
    return [
        {
            status: getSatsStatus(b),
            vilkårtype: Vilkårtype.Sats,
            begrunnelse: null,
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
            begrunnelse: null,
            erStartet: b.beregning !== null,
        },
    ];
};

function statusForPersonligOppmøte(personligOppmøte: Nullable<PersonligOppmøte>): VilkårVurderingStatus {
    if (!personligOppmøte?.status) {
        return VilkårVurderingStatus.IkkeVurdert;
    }
    switch (personligOppmøte.status) {
        case PersonligOppmøteStatus.MøttPersonlig:
        case PersonligOppmøteStatus.IkkeMøttMenSykMedLegeerklæringOgFullmakt:
        case PersonligOppmøteStatus.IkkeMøttMenVerge:
        case PersonligOppmøteStatus.IkkeMøttMenKortvarigSykMedLegeerklæring:
        case PersonligOppmøteStatus.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt:
            return VilkårVurderingStatus.Ok;

        case PersonligOppmøteStatus.IkkeMøttPersonlig:
            return VilkårVurderingStatus.IkkeOk;
        case PersonligOppmøteStatus.Uavklart:
            return VilkårVurderingStatus.Uavklart;
    }
}

const getSatsStatus = (b: Behandling) => {
    //vi sjekker på behandlingsstatus fordi at man kan endre på vilkår etter sats-steget, som ikke resetter sats.
    if (b.status === Behandlingsstatus.OPPRETTET || b.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG) {
        return VilkårVurderingStatus.IkkeVurdert;
    }

    if (erBosituasjonFullstendig(hentBosituasjongrunnlag(b.grunnlagsdataOgVilkårsvurderinger))) {
        return VilkårVurderingStatus.Ok;
    }
    return VilkårVurderingStatus.IkkeVurdert;
};

const erSatsStartet = (b: Behandling) => {
    //vi sjekker på behandlingsstatus fordi at man kan endre på vilkår etter sats-steget, som ikke resetter sats.
    if (b.status === Behandlingsstatus.OPPRETTET || b.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG) {
        return false;
    }

    return !!erBosituasjonFullstendig(hentBosituasjongrunnlag(b.grunnlagsdataOgVilkårsvurderinger));
};
