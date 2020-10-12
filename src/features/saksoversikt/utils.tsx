import Ikon from 'nav-frontend-ikoner-assets';
import React from 'react';

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
            return 'Lovlig Opphold';
        case Vilkårtype.FastOppholdINorge:
            return 'Opphold i Norge';
        case Vilkårtype.OppholdIUtlandet:
            return 'Opphold i Utlandet';
        case Vilkårtype.Sats:
            return 'Sats';
        case Vilkårtype.Beregning:
            return 'Beregning';
    }
};

export const statusIcon = (status: VilkårVurderingStatus) => {
    switch (status) {
        case VilkårVurderingStatus.IkkeVurdert:
            return <Ikon kind="advarsel-sirkel-fyll" />;
        case VilkårVurderingStatus.IkkeOk:
            return <Ikon kind="feil-sirkel-fyll" />;
        case VilkårVurderingStatus.Ok:
            return <Ikon kind="ok-sirkel-fyll" />;
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
        oppholdIUtlandet,
        formue,
        personligOppmøte,
    } = behandlingsinformasjon;

    return [
        {
            status:
                uførhet === null || uførhet.status === UførhetStatus.HarUføresakTilBehandling
                    ? VilkårVurderingStatus.IkkeVurdert
                    : uførhet.status === UførhetStatus.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.Uførhet,
            begrunnelse: null,
            erStartet: uførhet !== null,
        },
        {
            status:
                flyktning === null || flyktning.status === FlyktningStatus.Uavklart
                    ? VilkårVurderingStatus.IkkeVurdert
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
                    : lovligOpphold.status === LovligOppholdStatus.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.LovligOpphold,
            begrunnelse: behandlingsinformasjon.lovligOpphold?.begrunnelse ?? null,
            erStartet: lovligOpphold !== null,
        },
        {
            status:
                fastOppholdINorge === null || fastOppholdINorge.status === FastOppholdINorgeStatus.Uavklart
                    ? VilkårVurderingStatus.IkkeVurdert
                    : fastOppholdINorge.status === FastOppholdINorgeStatus.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.FastOppholdINorge,
            begrunnelse: behandlingsinformasjon.fastOppholdINorge?.begrunnelse ?? null,
            erStartet: fastOppholdINorge !== null,
        },
        {
            status:
                oppholdIUtlandet === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : oppholdIUtlandet.status === OppholdIUtlandetStatus.SkalHoldeSegINorge
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.OppholdIUtlandet,
            begrunnelse: behandlingsinformasjon.oppholdIUtlandet?.begrunnelse ?? null,
            erStartet: oppholdIUtlandet !== null,
        },
        {
            status:
                formue === null || formue.status === FormueStatus.MåInnhenteMerInformasjon
                    ? VilkårVurderingStatus.IkkeVurdert
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
    switch (personligOppmøte?.status) {
        case PersonligOppmøteStatus.MøttPersonlig:
        case PersonligOppmøteStatus.FullmektigMedLegeattest:
        case PersonligOppmøteStatus.Verge:
            return VilkårVurderingStatus.Ok;

        case PersonligOppmøteStatus.FullmektigUtenLegeattest:
        case PersonligOppmøteStatus.IkkeMøttOpp:
            return VilkårVurderingStatus.IkkeOk;

        default:
            return VilkårVurderingStatus.IkkeVurdert;
    }
}
