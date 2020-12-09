import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import {
    Behandlingsinformasjon,
    UførhetStatus,
    FlyktningStatus,
    LovligOppholdStatus,
    FastOppholdINorgeStatus,
    FormueStatus,
    PersonligOppmøteStatus,
    OppholdIUtlandetStatus,
    PersonligOppmøte,
    InstitusjonsoppholdStatus,
} from '~types/Behandlingsinformasjon';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

export const createVilkårUrl = (props: { sakId: string; behandlingId: string; vilkar: Vilkårtype }) =>
    Routes.saksbehandlingVilkårsvurdering.createURL({
        sakId: props.sakId,
        behandlingId: props.behandlingId,
        vilkar: props.vilkar,
    });

export const vilkårTittelFormatted = (type: Vilkårtype) => {
    switch (type) {
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
            return 'Sats';
        case Vilkårtype.Beregning:
            return 'Beregning';
    }
};

export interface Vilkårsinformasjon {
    status: VilkårVurderingStatus;
    vilkårtype: Vilkårtype;
    begrunnelse: Nullable<string>;
    erStartet: boolean;
}

export const mapToVilkårsinformasjon = (behandlingsinformasjon: Behandlingsinformasjon): Vilkårsinformasjon[] => {
    const {
        uførhet,
        flyktning,
        lovligOpphold,
        fastOppholdINorge,
        institusjonsopphold,
        oppholdIUtlandet,
        formue,
        personligOppmøte,
    } = behandlingsinformasjon;

    return [
        {
            status:
                uførhet === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : uførhet.status === UførhetStatus.HarUføresakTilBehandling
                    ? VilkårVurderingStatus.Uavklart
                    : uførhet.status === UførhetStatus.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.Uførhet,
            begrunnelse: uførhet?.begrunnelse ?? null,
            erStartet: uførhet !== null,
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
                oppholdIUtlandet === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : oppholdIUtlandet.status === OppholdIUtlandetStatus.Uavklart
                    ? VilkårVurderingStatus.Uavklart
                    : oppholdIUtlandet.status === OppholdIUtlandetStatus.SkalHoldeSegINorge
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.OppholdIUtlandet,
            begrunnelse: behandlingsinformasjon.oppholdIUtlandet?.begrunnelse ?? null,
            erStartet: oppholdIUtlandet !== null,
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
