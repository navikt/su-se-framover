import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as GrunnlagOgVilkårApi from '~src/api/GrunnlagOgVilkårApi';
import { Fradragsgrunnlagrequest } from '~src/types/Fradrag';
import { AlderspensjonVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { BosituasjongrunnlagRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { Familiegjenforeningrequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/familieforening/Familieforening';
import { FastOppholdVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår';
import { FlyktningVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/FlyktningVilkår';
import { FormueVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { InstitusjonsoppholdVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { LovligOppholdRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import { OpplysningspliktRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';
import { PersonligOppmøteVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår';
import { UførevilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { UtenlandsoppholdRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { OpprettetRevurdering } from '~src/types/Revurdering';

export const lagreUføregrunnlag = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult<OpprettetRevurdering>,
    GrunnlagOgVilkårApi.BehandlingstypeMedApiRequest<UførevilkårRequest>,
    { rejectValue: ApiError }
>('behandling/uføre/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreUføregrunnlag(arg);

    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreAlderspensjongrunnlag = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult<OpprettetRevurdering>,
    GrunnlagOgVilkårApi.BehandlingstypeMedApiRequest<AlderspensjonVilkårRequest>,
    { rejectValue: ApiError }
>('behandling/pensjon/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreAldersgrunnlag(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFamilieforeninggrunnlag = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult<OpprettetRevurdering>,
    GrunnlagOgVilkårApi.BehandlingstypeMedApiRequest<Familiegjenforeningrequest>,
    { rejectValue: ApiError }
>('behandling/familieforening/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreFamilieforeningsgrunnlag(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFlyktningVilkår = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    GrunnlagOgVilkårApi.BehandlingstypeMedApiRequest<FlyktningVilkårRequest>,
    { rejectValue: ApiError }
>('behandling/flyktning/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreFlyktningVilkår(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreLovligOppholdVilkår = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    GrunnlagOgVilkårApi.BehandlingstypeMedApiRequest<LovligOppholdRequest>,
    { rejectValue: ApiError }
>('behandling/lovligopphold/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreLovligOppholdVilkår(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFastOppholdVilkår = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    GrunnlagOgVilkårApi.BehandlingstypeMedApiRequest<FastOppholdVilkårRequest>,
    { rejectValue: ApiError }
>('behandling/fastopphold/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreFastOppholdVilkår(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreInstitusjonsoppholdVilkår = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    GrunnlagOgVilkårApi.BehandlingstypeMedApiRequest<InstitusjonsoppholdVilkårRequest>,
    { rejectValue: ApiError }
>('behandling/institusjonsopphold/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreInstitusjonsoppholdVilkår(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreUtenlandsopphold = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    GrunnlagOgVilkårApi.BehandlingstypeMedApiRequest<UtenlandsoppholdRequest>,
    { rejectValue: ApiError }
>('behandling/utlandsopphold/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreUtenlandsopphold(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreBosituasjongrunnlag = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    GrunnlagOgVilkårApi.BehandlingstypeMedApiRequest<BosituasjongrunnlagRequest>,
    { rejectValue: ApiError }
>('behandling/bosituasjon', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreBosituasjon(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFormuegrunnlag = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    GrunnlagOgVilkårApi.BehandlingstypeMedApiRequest<FormueVilkårRequest>,
    { rejectValue: ApiError }
>('behandling/formue/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreFormuegrunnlag(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagrePersonligOppmøteVilkår = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    GrunnlagOgVilkårApi.BehandlingstypeMedApiRequest<PersonligOppmøteVilkårRequest>,
    { rejectValue: ApiError }
>('behandling//personligOppmøte/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagrePersonligOppmøteVilkår(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFradragsgrunnlag = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    GrunnlagOgVilkårApi.BehandlingstypeMedApiRequest<Fradragsgrunnlagrequest>,
    { rejectValue: ApiError }
>('beregning/fradrag/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreFradragsgrunnlag(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreOpplysningsplikt = createAsyncThunk<
    GrunnlagOgVilkårApi.RevurderingOgFeilmeldinger,
    OpplysningspliktRequest,
    { rejectValue: ApiError }
>('revurdering/grunnlag/opplysningsplikt/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreOpplysningsplikt({
        behandlingId: arg.behandlingId,
        type: arg.type,
        data: arg.data,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
