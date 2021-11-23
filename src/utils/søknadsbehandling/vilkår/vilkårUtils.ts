import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import {
    Behandlingsinformasjon,
    FlyktningStatus,
    LovligOppholdStatus,
    FastOppholdINorgeStatus,
    FormueStatus,
    PersonligOppmøteStatus,
    PersonligOppmøte,
    InstitusjonsoppholdStatus,
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

export const mapToVilkårsinformasjon = (
    behandlingsinformasjon: Behandlingsinformasjon,
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger
): Vilkårsinformasjon[] => {
    const { flyktning, lovligOpphold, fastOppholdINorge, institusjonsopphold, formue, personligOppmøte } =
        behandlingsinformasjon;

    return [
        {
            status:
                grunnlagsdataOgVilkårsvurderinger.uføre === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger[0].resultat ===
                      UføreResultat.HarUføresakTilBehandling
                    ? VilkårVurderingStatus.Uavklart
                    : grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger[0].resultat === UføreResultat.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.Uførhet,
            begrunnelse: grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger[0]?.begrunnelse ?? null,
            erStartet: grunnlagsdataOgVilkårsvurderinger.uføre !== null,
        },
        {
            status:
                flyktning === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : flyktning.status === FlyktningStatus.Uavklart
                    ? VilkårVurderingStatus.Uavklart
                    : flyktning.status === FlyktningStatus.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.Flyktning,
            begrunnelse: behandlingsinformasjon.flyktning?.begrunnelse ?? null,
            erStartet: flyktning !== null,
        },
        {
            status:
                lovligOpphold === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : lovligOpphold.status === LovligOppholdStatus.Uavklart
                    ? VilkårVurderingStatus.Uavklart
                    : lovligOpphold.status === LovligOppholdStatus.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.LovligOpphold,
            begrunnelse: behandlingsinformasjon.lovligOpphold?.begrunnelse ?? null,
            erStartet: lovligOpphold !== null,
        },
        {
            status:
                fastOppholdINorge === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : fastOppholdINorge.status === FastOppholdINorgeStatus.Uavklart
                    ? VilkårVurderingStatus.Uavklart
                    : fastOppholdINorge.status === FastOppholdINorgeStatus.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.FastOppholdINorge,
            begrunnelse: behandlingsinformasjon.fastOppholdINorge?.begrunnelse ?? null,
            erStartet: fastOppholdINorge !== null,
        },
        {
            status:
                institusjonsopphold === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : institusjonsopphold.status === InstitusjonsoppholdStatus.Uavklart
                    ? VilkårVurderingStatus.Uavklart
                    : institusjonsopphold.status === InstitusjonsoppholdStatus.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.Institusjonsopphold,
            begrunnelse: behandlingsinformasjon.institusjonsopphold?.begrunnelse ?? null,
            erStartet: institusjonsopphold !== null,
        },
        {
            status:
                grunnlagsdataOgVilkårsvurderinger.utenlandsopphold === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.vurderinger[0].status ===
                      Utenlandsoppholdstatus.Uavklart
                    ? VilkårVurderingStatus.Uavklart
                    : grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.vurderinger[0].status ===
                      Utenlandsoppholdstatus.SkalHoldeSegINorge
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.OppholdIUtlandet,
            begrunnelse: grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.vurderinger[0]?.begrunnelse ?? null,
            erStartet: grunnlagsdataOgVilkårsvurderinger.utenlandsopphold !== null,
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

    if (erBosituasjonFullstendig(hentBosituasjongrunnlag(b.grunnlagsdataOgVilkårsvurderinger))) {
        return true;
    }

    return false;
};
