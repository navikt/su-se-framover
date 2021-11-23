import * as RemoteData from '@devexperts/remote-data-ts';
import { createAsyncThunk, createSlice, Dictionary } from '@reduxjs/toolkit';

import { ApiError } from '~api/apiClient';
import * as behandlingApi from '~api/behandlingApi';
import * as dokumentApi from '~api/dokumentApi';
import * as sakApi from '~api/sakApi';
import * as søknadApi from '~api/søknadApi';
import { AvslagManglendeDokType, LukkSøknadBodyTypes } from '~api/søknadApi';
import * as klageActions from '~features/klage/klageActions';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import { pipe } from '~lib/fp';
import { Nullable } from '~lib/types';
import { createApiCallAsyncThunk, handleAsyncThunk, simpleRejectedActionToRemoteData } from '~redux/utils';
import { Behandling, UnderkjennelseGrunn } from '~types/Behandling';
import { Behandlingsinformasjon } from '~types/Behandlingsinformasjon';
import { Dokument, DokumentIdType } from '~types/dokument/Dokument';
import { Fradrag } from '~types/Fradrag';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Klage } from '~types/Klage';
import { Periode } from '~types/Periode';
import { Restans } from '~types/Restans';
import { Revurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';

export const fetchSak = createAsyncThunk<
    Sak,
    { fnr: string } | { sakId: string } | { saksnummer: string },
    { rejectValue: ApiError }
>('sak/fetch', async (arg, thunkApi) => {
    const res = await ('fnr' in arg
        ? sakApi.fetchSakByFnr(arg.fnr)
        : 'saksnummer' in arg
        ? sakApi.fetchSakBySaksnummer(arg.saksnummer)
        : sakApi.fetchSakBySakId(arg.sakId));
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const hentRestanser = createAsyncThunk<Restans[], void, { rejectValue: ApiError }>(
    'sak/hentRestanser',
    async (_, thunkApi) => {
        const res = await sakApi.hentRestanser();
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

export const hentDokumenter = createAsyncThunk<
    Dokument[],
    { id: string; idType: DokumentIdType },
    { rejectValue: ApiError }
>('sak/dokumenter', async (args, thunkApi) => {
    const res = await dokumentApi.hentDokumenter(args);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const startBehandling = createAsyncThunk<
    Behandling,
    { sakId: string; søknadId: string },
    { rejectValue: ApiError }
>('behandling/start', async ({ sakId, søknadId }, thunkApi) => {
    const res = await behandlingApi.startBehandling({ sakId, søknadId });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreVirkningstidspunkt = createApiCallAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string; fraOgMed: string; tilOgMed: string; begrunnelse: string }
>('behandling/lagreVirkningstidspunk', behandlingApi.lagreVirkningstidspunkt);

export const fetchBehandling = createAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string },
    { rejectValue: ApiError }
>('behandling/fetch', async ({ sakId, behandlingId }, thunkApi) => {
    const res = await behandlingApi.hentBehandling(sakId, behandlingId);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreVilkårsvurdering = createAsyncThunk<
    Behandling,
    {
        sakId: string;
        behandlingId: string;
        vilkårsvurderingId: string;
        vilkårtype: Vilkårtype;
        status: VilkårVurderingStatus;
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>('behandling/lagreVilkårsvurdering', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreVilkårsvurdering(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreBehandlingsinformasjon = createAsyncThunk<
    Behandling,
    {
        sakId: string;
        behandlingId: string;
        behandlingsinformasjon: Partial<Behandlingsinformasjon>;
    },
    { rejectValue: ApiError }
>('behandling/informasjon', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreBehandlingsinformasjon(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreUtenlandsopphold = createAsyncThunk<
    Behandling,
    {
        sakId: string;
        behandlingId: string;
        status: Utenlandsoppholdstatus;
        begrunnelse: Nullable<string>;
        periode: Periode<string>;
    },
    { rejectValue: ApiError }
>('behandling/vilkår/utenlandsopphold', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreUtenlandsopphold(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreUføregrunnlag = createAsyncThunk<
    Behandling,
    {
        sakId: string;
        behandlingId: string;
        periode: Periode<string>;
        uføregrad: Nullable<number>;
        forventetInntekt: Nullable<number>;
        begrunnelse: string;
        resultat: UføreResultat;
    },
    { rejectValue: ApiError }
>('behandling/grunnlag/uføre', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreUføregrunnlag(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreEpsGrunnlag = createAsyncThunk<
    Behandling,
    {
        sakId: string;
        behandlingId: string;
        epsFnr: Nullable<string>;
    },
    { rejectValue: ApiError }
>('behandling/grunnlag/bosituasjon/eps', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreGrunnlagEps(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreEpsGrunnlagSkjermet = createAsyncThunk<
    unknown,
    {
        sakId: string;
        behandlingId: string;
        epsFnr: string;
    },
    { rejectValue: ApiError }
>('behandling/grunnlag/bosituasjon/eps/skjermet', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreGrunnlagEpsSkjermet(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreBosituasjonGrunnlag = createAsyncThunk<
    Behandling,
    {
        sakId: string;
        behandlingId: string;
        bosituasjon: string;
        begrunnelse: Nullable<string>;
    },
    { rejectValue: ApiError }
>('behandling/grunnlag/bosituasjon/fullfør', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreGrunnlagBosituasjon(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const startBeregning = createAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string; begrunnelse: Nullable<string> },
    { rejectValue: ApiError }
>('beregning/start', async ({ sakId, behandlingId, begrunnelse }, thunkApi) => {
    const res = await behandlingApi.startBeregning(sakId, behandlingId, { begrunnelse });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFradrag = createAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string; fradrag: Fradrag[] },
    { rejectValue: ApiError }
>('beregning/grunnlag/fradrag', async ({ sakId, behandlingId, fradrag }, thunkApi) => {
    const res = await behandlingApi.lagreFradragsgrunnlag(sakId, behandlingId, fradrag);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const startSimulering = createAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string },
    { rejectValue: ApiError }
>('simulering/start', async ({ sakId, behandlingId }, thunkApi) => {
    const res = await behandlingApi.simulerBehandling(sakId, behandlingId);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const sendTilAttestering = createAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string; fritekstTilBrev: string },
    { rejectValue: ApiError }
>('behandling/tilAttestering', async ({ sakId, behandlingId, fritekstTilBrev }, thunkApi) => {
    const res = await behandlingApi.sendTilAttestering({ sakId, behandlingId, fritekstTilBrev });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const attesteringIverksett = createAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string },
    { rejectValue: ApiError }
>('behandling/iverksett', async ({ sakId, behandlingId }, thunkApi) => {
    const res = await behandlingApi.iverksett({ sakId, behandlingId });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const attesteringUnderkjenn = createAsyncThunk<
    Behandling,
    { sakId: string; behandlingId: string; grunn: UnderkjennelseGrunn; kommentar: string },
    { rejectValue: ApiError }
>('behandling/underkjenn', async ({ sakId, behandlingId, grunn, kommentar }, thunkApi) => {
    const res = await behandlingApi.underkjenn({ sakId, behandlingId, grunn, kommentar });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lukkSøknad = createAsyncThunk<
    Sak,
    {
        søknadId: string;
        body: LukkSøknadBodyTypes;
    },
    { rejectValue: ApiError }
>('soknad/lukkSøknad', async (arg, thunkApi) => {
    const res = await søknadApi.lukkSøknad(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const avslagManglendeDokSøknad = createAsyncThunk<
    Sak,
    {
        søknadId: string;
        body: AvslagManglendeDokType;
    },
    { rejectValue: ApiError }
>('soknad/avslag', async (arg, thunkApi) => {
    const res = await søknadApi.avslåSøknadPgaManglendeDokumentasjon(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const hentLukketSøknadBrevutkast = createAsyncThunk<
    { objectUrl: string },
    {
        søknadId: string;
        body: LukkSøknadBodyTypes;
    },
    { rejectValue: ApiError }
>('soknad/hentLukketSøknadBrevutkast', async ({ søknadId, body }, thunkApi) => {
    const res = await søknadApi.hentLukketSøknadsBrevutkast({
        søknadId,
        body,
    });
    if (res.status === 'ok') {
        return { objectUrl: URL.createObjectURL(res.data) };
    }
    return thunkApi.rejectWithValue(res.error);
});

interface SakState {
    sak: RemoteData.RemoteData<ApiError, Sak>;
    revurderingGrunnlagSimulering: Dictionary<RemoteData.RemoteData<ApiError, GrunnlagsdataOgVilkårsvurderinger>>;
    lagreVilkårsvurderingStatus: RemoteData.RemoteData<ApiError, null>;
    lagreBehandlingsinformasjonStatus: RemoteData.RemoteData<ApiError, null>;
    lagreUføregrunnlagStatus: RemoteData.RemoteData<ApiError, null>;
    beregningStatus: RemoteData.RemoteData<ApiError, null>;
    simuleringStatus: RemoteData.RemoteData<ApiError, null>;
    sendtTilAttesteringStatus: RemoteData.RemoteData<ApiError, null>;
    attesteringStatus: RemoteData.RemoteData<ApiError, null>;
    opprettRevurderingStatus: RemoteData.RemoteData<ApiError, null>;
    oppdaterRevurderingStatus: RemoteData.RemoteData<ApiError, null>;
}

const initialState: SakState = {
    sak: RemoteData.initial,
    revurderingGrunnlagSimulering: {},
    lagreVilkårsvurderingStatus: RemoteData.initial,
    lagreBehandlingsinformasjonStatus: RemoteData.initial,
    lagreUføregrunnlagStatus: RemoteData.initial,
    beregningStatus: RemoteData.initial,
    simuleringStatus: RemoteData.initial,
    sendtTilAttesteringStatus: RemoteData.initial,
    attesteringStatus: RemoteData.initial,
    opprettRevurderingStatus: RemoteData.initial,
    oppdaterRevurderingStatus: RemoteData.initial,
};

export default createSlice({
    name: 'sak',
    initialState,
    reducers: {
        resetSak(state) {
            state.sak = RemoteData.initial;
        },
        resetBeregningstatus(state) {
            state.beregningStatus = RemoteData.initial;
        },
    },
    extraReducers: (builder) => {
        handleAsyncThunk(builder, fetchSak, {
            pending: (state) => {
                state.sak = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.sak = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.sak = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, startBehandling, {
            pending: (state) => {
                state.sak = { ...state.sak };
            },
            fulfilled: (state, action) => {
                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: [...sak.behandlinger, action.payload],
                    }))
                );
            },
            rejected: (state) => {
                state.sak = { ...state.sak };
            },
        });

        handleAsyncThunk(builder, lagreVirkningstidspunkt, {
            pending: (state) => state,
            fulfilled: (state, action) => {
                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) =>
                            b.id === action.meta.arg.behandlingId ? action.payload : b
                        ),
                    }))
                );
            },
            rejected: (state) => state,
        });

        handleAsyncThunk(builder, lagreVilkårsvurdering, {
            pending: (state) => {
                state.lagreVilkårsvurderingStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.lagreVilkårsvurderingStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.lagreVilkårsvurderingStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, lagreBehandlingsinformasjon, {
            pending: (state) => {
                state.lagreBehandlingsinformasjonStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.lagreBehandlingsinformasjonStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.lagreBehandlingsinformasjonStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, lagreUføregrunnlag, {
            pending: (state) => {
                state.lagreUføregrunnlagStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.lagreUføregrunnlagStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.lagreUføregrunnlagStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, lagreEpsGrunnlag, {
            pending: (state) => {
                state.lagreUføregrunnlagStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.lagreUføregrunnlagStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.lagreUføregrunnlagStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, startBeregning, {
            pending: (state) => {
                state.beregningStatus = RemoteData.pending;
                state.simuleringStatus = RemoteData.initial;
            },
            fulfilled: (state, action) => {
                state.beregningStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.beregningStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, startSimulering, {
            pending: (state) => {
                state.simuleringStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.simuleringStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.simuleringStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, attesteringIverksett, {
            pending: (state) => {
                state.attesteringStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.attesteringStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.attesteringStatus = simpleRejectedActionToRemoteData(action);
            },
        });
        handleAsyncThunk(builder, attesteringUnderkjenn, {
            pending: (state) => {
                state.attesteringStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.attesteringStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.attesteringStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, sendTilAttestering, {
            pending: (state) => {
                state.sendtTilAttesteringStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.sendtTilAttesteringStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                    }))
                );
            },
            rejected: (state, action) => {
                state.sendtTilAttesteringStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, revurderingActions.opprettRevurdering, {
            pending: (state) => {
                state.opprettRevurderingStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.opprettRevurderingStatus = RemoteData.success(null);

                state.sak = pipe(
                    state.sak,
                    RemoteData.map((sak) => ({
                        ...sak,
                        revurderinger: [...sak.revurderinger, action.payload],
                    }))
                );
            },
            rejected: (state, action) => {
                state.opprettRevurderingStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, revurderingActions.oppdaterRevurderingsPeriode, {
            pending: (state) => {
                state.oppdaterRevurderingStatus = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.oppdaterRevurderingStatus = RemoteData.success(null);
                state.revurderingGrunnlagSimulering[action.meta.arg.revurderingId] = RemoteData.initial;

                state.sak = oppdaterRevurderingISak(state.sak, action.payload);
            },
            rejected: (state, action) => {
                state.oppdaterRevurderingStatus = simpleRejectedActionToRemoteData(action);
            },
        });

        handleAsyncThunk(builder, revurderingActions.hentGjeldendeGrunnlagsdataOgVilkårsvurderinger, {
            pending: (state, action) => {
                state.revurderingGrunnlagSimulering[action.meta.arg.revurderingId] = RemoteData.pending;
            },
            fulfilled: (state, action) => {
                state.revurderingGrunnlagSimulering[action.meta.arg.revurderingId] = RemoteData.success(action.payload);
            },
            rejected: (state, action) => {
                state.revurderingGrunnlagSimulering[action.meta.arg.revurderingId] =
                    simpleRejectedActionToRemoteData(action);
            },
        });

        builder.addCase(lukkSøknad.fulfilled, (state, action) => {
            state.sak = RemoteData.success(action.payload);
        });

        builder.addCase(avslagManglendeDokSøknad.fulfilled, (state, action) => {
            state.sak = RemoteData.success(action.payload);
        });

        builder.addCase(lagreBosituasjonGrunnlag.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                }))
            );
        });

        builder.addCase(lagreUtenlandsopphold.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                }))
            );
        });

        builder.addCase(lagreFradrag.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                }))
            );
        });

        builder.addCase(revurderingActions.opprettStans.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    revurderinger: [...sak.revurderinger, action.payload],
                }))
            );
        });

        builder.addCase(revurderingActions.gjenoppta.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    revurderinger: [...sak.revurderinger, action.payload],
                }))
            );
        });

        builder.addCase(revurderingActions.lagreUføregrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        builder.addCase(revurderingActions.lagreFradragsgrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        builder.addCase(revurderingActions.lagreBosituasjonsgrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        builder.addCase(revurderingActions.lagreUtenlandsopphold.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        builder.addCase(revurderingActions.lagreFormuegrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        builder.addCase(revurderingActions.beregnOgSimuler.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        builder.addCase(revurderingActions.sendRevurderingTilAttestering.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload);
        });

        builder.addCase(revurderingActions.iverksettRevurdering.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload);
        });
        builder.addCase(revurderingActions.underkjennRevurdering.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload);
        });

        builder.addCase(revurderingActions.lagreForhåndsvarsel.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload);
        });

        builder.addCase(revurderingActions.fortsettEtterForhåndsvarsel.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload);
        });

        builder.addCase(revurderingActions.oppdaterStans.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload);
        });

        builder.addCase(revurderingActions.oppdaterGjenopptak.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload);
        });

        builder.addCase(revurderingActions.avsluttRevurdering.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload);
        });

        builder.addCase(klageActions.opprettKlage.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((s) => ({
                    ...s,
                    klager: [...s.klager, action.payload],
                }))
            );
        });

        builder.addCase(klageActions.vurderFormkrav.fulfilled, (state, action) => {
            state.sak = oppdaterKlageISak(state.sak, action.payload);
        });

        builder.addCase(klageActions.lagreVurderingAvKlage.fulfilled, (state, action) => {
            state.sak = oppdaterKlageISak(state.sak, action.payload);
        });

        builder.addCase(klageActions.sendTilAttestering.fulfilled, (state, action) => {
            state.sak = oppdaterKlageISak(state.sak, action.payload);
        });
    },
});

function oppdaterRevurderingISak(sak: RemoteData.RemoteData<ApiError, Sak>, revurdering: Revurdering) {
    return pipe(
        sak,
        RemoteData.map((s) => ({
            ...s,
            revurderinger: s.revurderinger.map((r) => (r.id === revurdering.id ? revurdering : r)),
        }))
    );
}

function oppdaterKlageISak(sak: RemoteData.RemoteData<ApiError, Sak>, klage: Klage) {
    return pipe(
        sak,
        RemoteData.map((s) => ({
            ...s,
            klager: s.klager.map((k) => (k.id === klage.id ? klage : k)),
        }))
    );
}
