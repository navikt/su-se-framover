import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as GrunnlagOgVilkårApi from '~src/api/GrunnlagOgVilkårApi';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Fradrag } from '~src/types/Fradrag';
import { Aldersvurdering } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { UfullstendigBosituasjonRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { FastOppholdVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/fastOpphold/FastOppholdVilkår';
import { FlyktningVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/flyktning/FlyktningVilkår';
import { FormueVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { InstitusjonsoppholdVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { LovligOppholdRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import { PersonligOppmøteVilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår';
import { UførevilkårRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { UtenlandsoppholdRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { BosituasjonRequest, OpplysningspliktRequest, OpprettetRevurdering } from '~src/types/Revurdering';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

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

export const lagreAlderspensjongrunnlag = createAsyncThunk<
    Søknadsbehandling,
    {
        sakId: string;
        behandlingId: string;
        vurderinger: Aldersvurdering[];
    },
    { rejectValue: ApiError }
>('behandling/pensjon/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreAldersgrunnlag(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFamilieforeninggrunnlag = createAsyncThunk<
    Søknadsbehandling,
    {
        sakId: string;
        behandlingId: string;
        vurderinger: Array<{ status: Vilkårstatus }>;
    },
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

export const lagreUfullstendigBosituasjon = createAsyncThunk<
    Søknadsbehandling,
    UfullstendigBosituasjonRequest,
    { rejectValue: ApiError }
>('behandling/bosituasjon/ufullstendig', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreUfullstendigBosituasjon(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFormuegrunnlag = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    FormueVilkårRequest & { behandlingstype: GrunnlagOgVilkårApi.Behandlingstype },
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
    PersonligOppmøteVilkårRequest & { behandlingstype: GrunnlagOgVilkårApi.Behandlingstype },
    { rejectValue: ApiError }
>('behandling//personligOppmøte/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagrePersonligOppmøteVilkår(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFullstendigBosituasjon = createAsyncThunk<
    Søknadsbehandling,
    {
        sakId: string;
        behandlingId: string;
        bosituasjon: string;
    },
    { rejectValue: ApiError }
>('behandling/grunnlag/bosituasjon/fullfør', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreFullstendigBosituasjon(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFradragsgrunnlag = createAsyncThunk<
    GrunnlagOgVilkårApi.VilkårOgGrunnlagApiResult,
    { sakId: string; behandlingId: string; fradrag: Fradrag[] } & {
        behandlingstype: GrunnlagOgVilkårApi.Behandlingstype;
    },
    { rejectValue: ApiError }
>('beregning/fradrag/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreFradragsgrunnlag(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreBosituasjonsgrunnlag = createAsyncThunk<
    GrunnlagOgVilkårApi.RevurderingOgFeilmeldinger,
    BosituasjonRequest,
    { rejectValue: ApiError }
>('revurdering/grunnlag/bosituasjon/lagre', async (arg, thunkApi) => {
    const res = await GrunnlagOgVilkårApi.lagreBosituasjonsgrunnlag({
        sakId: arg.sakId,
        revurderingId: arg.revurderingId,
        bosituasjoner: arg.bosituasjoner,
    });
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
        id: arg.id,
        type: arg.type,
        data: arg.data,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
