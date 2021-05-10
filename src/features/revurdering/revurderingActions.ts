import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import * as revurderingApi from '~api/revurderingApi';
import { Nullable } from '~lib/types';
import { UnderkjennRevurderingGrunn } from '~pages/attestering/attesterRevurdering/AttesterRevurdering';
import { Fradrag } from '~types/Fradrag';
import { Periode } from '~types/Periode';
import {
    RevurderingTilAttestering,
    IverksattRevurdering,
    OpprettetRevurdering,
    SimulertRevurdering,
    UnderkjentRevurdering,
    OpprettetRevurderingGrunn,
    RevurderingErrorCodes,
    BeslutningEtterForhåndsvarsling,
    LeggTilUføreResponse,
    InformasjonSomRevurderes,
} from '~types/Revurdering';
import { UføreResultat, Vilkårsvurderinger } from '~types/Vilkår';

export const opprettRevurdering = createAsyncThunk<
    OpprettetRevurdering,
    {
        sakId: string;
        fraOgMed: Date;
        årsak: OpprettetRevurderingGrunn;
        informasjonSomRevurderes: InformasjonSomRevurderes[];
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>(
    'revurdering/opprettRevurdering',
    async ({ sakId, fraOgMed, årsak, informasjonSomRevurderes, begrunnelse }, thunkApi) => {
        const res = await revurderingApi.opprettRevurdering(
            sakId,
            fraOgMed,
            årsak,
            informasjonSomRevurderes,
            begrunnelse
        );
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

export const oppdaterRevurderingsPeriode = createAsyncThunk<
    OpprettetRevurdering,
    {
        sakId: string;
        revurderingId: string;
        fraOgMed: Date;
        årsak: OpprettetRevurderingGrunn;
        informasjonSomRevurderes: InformasjonSomRevurderes[];
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>(
    'revurdering/oppdaterRevurderingsPeriode',
    async ({ sakId, revurderingId, fraOgMed, årsak, informasjonSomRevurderes, begrunnelse }, thunkApi) => {
        const res = await revurderingApi.oppdaterRevurdering(
            sakId,
            revurderingId,
            fraOgMed,
            årsak,
            informasjonSomRevurderes,
            begrunnelse
        );
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

export const beregnOgSimuler = createAsyncThunk<
    SimulertRevurdering,
    { sakId: string; revurderingId: string; periode: Periode<string>; fradrag: Fradrag[] },
    { rejectValue: ApiError }
>('revurdering/beregnOgSimuler', async ({ sakId, revurderingId, periode, fradrag }, thunkApi) => {
    const res = await revurderingApi.beregnOgSimuler(sakId, {
        revurderingId,
        periode,
        fradrag,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const forhåndsvarsleEllerSendTilAttestering = createAsyncThunk<
    SimulertRevurdering,
    {
        sakId: string;
        revurderingId: string;
        revurderingshandling: revurderingApi.Revurderingshandling;
        fritekstTilBrev: string;
    },
    { rejectValue: ApiError<RevurderingErrorCodes> }
>('revurdering/forhandsvarsle', async ({ sakId, revurderingId, revurderingshandling, fritekstTilBrev }, thunkApi) => {
    const res = await revurderingApi.forhåndsvarsleEllerSendTilAttestering(
        sakId,
        revurderingId,
        revurderingshandling,
        fritekstTilBrev
    );
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const sendRevurderingTilAttestering = createAsyncThunk<
    RevurderingTilAttestering,
    { sakId: string; revurderingId: string; fritekstTilBrev: string; skalFøreTilBrevutsending?: boolean },
    { rejectValue: ApiError<RevurderingErrorCodes> }
>(
    'revurdering/sendTilAttestering',
    async ({ sakId, revurderingId, fritekstTilBrev, skalFøreTilBrevutsending: skalFøreTilBrevutsending }, thunkApi) => {
        const res = await revurderingApi.sendTilAttestering(
            sakId,
            revurderingId,
            fritekstTilBrev,
            skalFøreTilBrevutsending
        );
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

export const iverksettRevurdering = createAsyncThunk<
    IverksattRevurdering,
    { sakId: string; revurderingId: string },
    { rejectValue: ApiError }
>('revurdering/iverksett', async ({ sakId, revurderingId }, thunkApi) => {
    const res = await revurderingApi.iverksett(sakId, revurderingId);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const underkjennRevurdering = createAsyncThunk<
    UnderkjentRevurdering,
    { sakId: string; revurderingId: string; grunn: UnderkjennRevurderingGrunn; kommentar?: string },
    { rejectValue: ApiError }
>('revurdering/underkjenn', async ({ sakId, revurderingId, grunn, kommentar }, thunkApi) => {
    const res = await revurderingApi.underkjenn(sakId, revurderingId, grunn, kommentar);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const fortsettEtterForhåndsvarsel = createAsyncThunk<
    SimulertRevurdering | RevurderingTilAttestering,
    {
        sakId: string;
        revurderingId: string;
        begrunnelse: string;
        valg: BeslutningEtterForhåndsvarsling;
        fritekstTilBrev: string;
    },
    { rejectValue: ApiError }
>(
    'revurdering/fortsettEtterForhåndsvarsel',
    async ({ sakId, revurderingId, begrunnelse, valg, fritekstTilBrev }, thunkApi) => {
        const res = await revurderingApi.fortsettEtterForhåndsvarsel(
            sakId,
            revurderingId,
            begrunnelse,
            valg,
            fritekstTilBrev
        );
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

export const lagreUføregrunnlag = createAsyncThunk<
    LeggTilUføreResponse,
    {
        sakId: string;
        revurderingId: string;
        vurderinger: Array<{
            periode: Periode<string>;
            uføregrad: Nullable<number>;
            forventetInntekt: Nullable<number>;
            resultat: UføreResultat;
            begrunnelse: Nullable<string>;
        }>;
    },
    { rejectValue: ApiError }
>('revurdering/grunnlag/uføre/lagre', async (arg, thunkApi) => {
    const res = await revurderingApi.lagreUføregrunnlag(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const hentUføregrunnlag = createAsyncThunk<
    Vilkårsvurderinger,
    {
        sakId: string;
        revurderingId: string;
    },
    { rejectValue: ApiError }
>('revurdering/grunnlag/uføre/hent', async ({ sakId, revurderingId }, thunkApi) => {
    const res = await revurderingApi.hentUføregrunnlag(sakId, revurderingId);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
