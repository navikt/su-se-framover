import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as GrunnlagOgVilkårApi from '~src/api/GrunnlagOgVilkårApi';
import { FastOppholdVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår';
import { FlyktningVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/FlyktningVilkår';
import { InstitusjonsoppholdVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { LovligOppholdRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import { PersonligOppmøteVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår';
import { UførevilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { UtenlandsoppholdRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { OpprettetRevurdering } from '~src/types/Revurdering';

export const lagreUføregrunnlag = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult<OpprettetRevurdering>,
    UførevilkårRequest & { behandlingstype: GrunnlagOgVilkårApi.Behandlingstype },
    { rejectValue: ApiError }
>('behandling/uføre/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreUføregrunnlag(arg);

    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFlyktningVilkår = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    FlyktningVilkårRequest & { behandlingstype: GrunnlagOgVilkårApi.Behandlingstype },
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
    LovligOppholdRequest & { behandlingstype: GrunnlagOgVilkårApi.Behandlingstype },
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
    FastOppholdVilkårRequest & { behandlingstype: GrunnlagOgVilkårApi.Behandlingstype },
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
    InstitusjonsoppholdVilkårRequest & { behandlingstype: GrunnlagOgVilkårApi.Behandlingstype },
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
    UtenlandsoppholdRequest & { behandlingstype: GrunnlagOgVilkårApi.Behandlingstype },
    { rejectValue: ApiError }
>('behandling/utlandsopphold/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreUtenlandsopphold(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

/*
TODO - Formue trenger litt mer arbeid
export const lagreFormuegrunnlag = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    FormuegrunnlagRequest & { behandlingstype: GrunnlagOgVilkårApi.Behandlingstype },
    { rejectValue: ApiError }
>('behandling/formue/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreFormuegrunnlag(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
*/

export const lagrePersonligOppmøteVilkår = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    PersonligOppmøteVilkårRequest & { behandlingstype: GrunnlagOgVilkårApi.Behandlingstype },
    { rejectValue: ApiError }
>('behandling//personligOppmøte/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagrePersonligOppmøteVilkår(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
