import Ikon from 'nav-frontend-ikoner-assets';
import React from 'react';

import { VilkårVurderingStatus, Vilkårtype } from '~api/behandlingApi';
import {
    Behandlingsinformasjon,
    UførhetStatus,
    FlyktningStatus,
    LovligOppholdStatus,
    FastOppholdINorgeStatus,
    FormueStatus,
    PersonligOppmøteStatus,
} from '~types/Behandlingsinformasjon';

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
            return 'Opphold i Norge';
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

type Vilkårsinformasjon = {
    status: VilkårVurderingStatus;
    vilkårtype: Vilkårtype;
};

export const mapToVilkårsinformasjon = (behandlingsinformasjon: Behandlingsinformasjon): Vilkårsinformasjon[] => {
    const { uførhet, flyktning, lovligOpphold, fastOppholdINorge, formue, personligOppmøte } = behandlingsinformasjon;

    return [
        {
            status:
                uførhet === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : uførhet.status === UførhetStatus.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.Uførhet,
        },
        {
            status:
                flyktning === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : flyktning.status === FlyktningStatus.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.Flyktning,
        },
        {
            status:
                lovligOpphold === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : lovligOpphold.status === LovligOppholdStatus.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.LovligOpphold,
        },
        {
            status:
                fastOppholdINorge === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : fastOppholdINorge.status === FastOppholdINorgeStatus.VilkårOppfylt
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.FastOppholdINorge,
        },
        {
            status:
                formue === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : formue.status === FormueStatus.Ok
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.Formue,
        },
        {
            status:
                personligOppmøte === null
                    ? VilkårVurderingStatus.IkkeVurdert
                    : personligOppmøte.status !== PersonligOppmøteStatus.IkkeMøttOpp
                    ? VilkårVurderingStatus.Ok
                    : VilkårVurderingStatus.IkkeOk,
            vilkårtype: Vilkårtype.PersonligOppmøte,
        },
    ];
};
