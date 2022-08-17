import * as RemoteData from '@devexperts/remote-data-ts';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as behandlingApi from '~src/api/behandlingApi';
import * as dokumentApi from '~src/api/dokumentApi';
import * as sakApi from '~src/api/sakApi';
import * as søknadApi from '~src/api/søknadApi';
import { AvslagManglendeDokType, LukkSøknadBodyTypes } from '~src/api/søknadApi';
import * as klageActions from '~src/features/klage/klageActions';
import * as revurderingActions from '~src/features/revurdering/revurderingActions';
import { pipe } from '~src/lib/fp';
import { Nullable } from '~src/lib/types';
import { FormueSøknadsbehandlingForm } from '~src/pages/saksbehandling/revurdering/formue/formueUtils';
import { createApiCallAsyncThunk, handleAsyncThunk, simpleRejectedActionToRemoteData } from '~src/redux/utils';
import { UnderkjennelseGrunn } from '~src/types/Behandling';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Dokument, DokumentIdType } from '~src/types/dokument/Dokument';
import { Fradrag } from '~src/types/Fradrag';
import { Aldersvurdering } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { InstitusjonsoppholdVurderingRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/institusjonsopphold/Institusjonsopphold';
import { LovligOppholdRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import { PersonligOppmøteÅrsak } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøte';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Klage } from '~src/types/Klage';
import { Periode } from '~src/types/Periode';
import { Restans } from '~src/types/Restans';
import { Revurdering } from '~src/types/Revurdering';
import { Sak } from '~src/types/Sak';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

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

export const hentÅpneBehandlinger = createAsyncThunk<Restans[], void, { rejectValue: ApiError }>(
    'sak/apneBehandlinger',
    async (_, thunkApi) => {
        const res = await sakApi.hentÅpneBehandlinger();
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    }
);

export const hentFerdigeBehandlinger = createAsyncThunk<Restans[], void, { rejectValue: ApiError }>(
    'sak/ferdigeBehandlinger',
    async (_, thunkApi) => {
        const res = await sakApi.hentFerdigeBehandlinger();
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
    Søknadsbehandling,
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
    Søknadsbehandling,
    { sakId: string; behandlingId: string; fraOgMed: string; tilOgMed: string }
>('behandling/lagreVirkningstidspunk', behandlingApi.lagreVirkningstidspunkt);

export const fetchBehandling = createAsyncThunk<
    Søknadsbehandling,
    { sakId: string; behandlingId: string },
    { rejectValue: ApiError }
>('behandling/fetch', async ({ sakId, behandlingId }, thunkApi) => {
    const res = await behandlingApi.hentBehandling(sakId, behandlingId);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFlyktningVilkår = createAsyncThunk<
    Søknadsbehandling,
    {
        sakId: string;
        behandlingId: string;
        vurderinger: Array<{
            vurdering: Vilkårstatus;
            periode: Periode<string>;
        }>;
    },
    { rejectValue: ApiError }
>('behandling/flyktning', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreFlyktningVilkår(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFastOppholdVilkår = createAsyncThunk<
    Søknadsbehandling,
    {
        sakId: string;
        behandlingId: string;
        vurderinger: Array<{
            vurdering: Vilkårstatus;
            periode: Periode<string>;
        }>;
    },
    { rejectValue: ApiError }
>('behandling/fastOpphold', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreFastOppholdVilkår(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreInstitusjonsoppholdVilkår = createAsyncThunk<
    Søknadsbehandling,
    {
        sakId: string;
        behandlingId: string;
        vurderingsperioder: InstitusjonsoppholdVurderingRequest[];
    },
    { rejectValue: ApiError }
>('behandling/institusjonsopphold', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreInstitusjonsoppholdVilkår(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagrePersonligOppmøteVilkår = createAsyncThunk<
    Søknadsbehandling,
    {
        sakId: string;
        behandlingId: string;
        vurderinger: Array<{
            vurdering: PersonligOppmøteÅrsak;
            periode: Periode<string>;
        }>;
    },
    { rejectValue: ApiError }
>('behandling/personligoppmøte', async (arg, thunkApi) => {
    const res = await behandlingApi.lagrePersonligOppmøteVilkår(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreUtenlandsopphold = createAsyncThunk<
    Søknadsbehandling,
    {
        sakId: string;
        behandlingId: string;
        status: Utenlandsoppholdstatus;
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
    Søknadsbehandling,
    {
        sakId: string;
        behandlingId: string;
        vurderinger: Array<{
            periode: Periode<string>;
            uføregrad: Nullable<number>;
            forventetInntekt: Nullable<number>;
            resultat: UføreResultat;
        }>;
    },
    { rejectValue: ApiError }
>('behandling/grunnlag/uføre', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreUføregrunnlag(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreLovligOppholdVilkår = createAsyncThunk<
    Søknadsbehandling,
    LovligOppholdRequest,
    { rejectValue: ApiError }
>('behandling/lovligopphold', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreLovligOppholdVilkår(arg);
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
>('behandling/grunnlag/pensjon', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreAldersgrunnlag(arg);
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
>('behandling/grunnlag/familieforening', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreFamilieforeningsgrunnlag(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFormuegrunnlag = createAsyncThunk<
    Søknadsbehandling,
    {
        sakId: string;
        behandlingId: string;
        vurderinger: FormueSøknadsbehandlingForm[];
    },
    { rejectValue: ApiError }
>('behandling/grunnlag/formue', async (arg, thunkApi) => {
    const res = await behandlingApi.lagreFormuegrunnlag(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreEpsGrunnlag = createAsyncThunk<
    Søknadsbehandling,
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
    Søknadsbehandling,
    {
        sakId: string;
        behandlingId: string;
        bosituasjon: string;
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
    Søknadsbehandling,
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
    Søknadsbehandling,
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
    Søknadsbehandling,
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
    Søknadsbehandling,
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
    Søknadsbehandling,
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
    Søknadsbehandling,
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
}

const initialState: SakState = {
    sak: RemoteData.initial,
};

export default createSlice({
    name: 'sak',
    initialState,
    reducers: {
        resetSak(state) {
            state.sak = RemoteData.initial;
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

        builder.addCase(startBehandling.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    behandlinger: [...sak.behandlinger, action.payload],
                }))
            );
        });

        builder.addCase(lagreVirkningstidspunkt.fulfilled, (state, action) => {
            state.sak = oppaderSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(lagreUføregrunnlag.fulfilled, (state, action) => {
            state.sak = oppaderSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(lagreEpsGrunnlag.fulfilled, (state, action) => {
            state.sak = oppaderSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(startBeregning.fulfilled, (state, action) => {
            state.sak = oppaderSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(startSimulering.fulfilled, (state, action) => {
            state.sak = oppaderSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(attesteringIverksett.fulfilled, (state, action) => {
            state.sak = oppaderSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(attesteringUnderkjenn.fulfilled, (state, action) => {
            state.sak = oppaderSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(sendTilAttestering.fulfilled, (state, action) => {
            state.sak = oppaderSøknadsbehandlingISak(state.sak, action.payload);
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

        builder.addCase(lagreLovligOppholdVilkår.fulfilled, (state, action) => {
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

        builder.addCase(lagreFormuegrunnlag.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                }))
            );
        });

        builder.addCase(lagreAlderspensjongrunnlag.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                }))
            );
        });

        builder.addCase(lagreFamilieforeninggrunnlag.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                }))
            );
        });

        builder.addCase(lagreFlyktningVilkår.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                }))
            );
        });

        builder.addCase(lagreFastOppholdVilkår.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                }))
            );
        });

        builder.addCase(lagreInstitusjonsoppholdVilkår.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    behandlinger: sak.behandlinger.map((b) => (b.id === action.payload.id ? action.payload : b)),
                }))
            );
        });

        builder.addCase(lagrePersonligOppmøteVilkår.fulfilled, (state, action) => {
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

        builder.addCase(revurderingActions.opprettRevurdering.fulfilled, (state, action) => {
            state.sak = opprettEllerOppdaterRevurderingISak(state.sak, action.payload);
        });

        builder.addCase(revurderingActions.oppdaterRevurderingsPeriode.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload);
        });

        builder.addCase(revurderingActions.opprettStans.fulfilled, (state, action) => {
            state.sak = opprettEllerOppdaterRevurderingISak(state.sak, action.payload);
        });

        builder.addCase(revurderingActions.gjenoppta.fulfilled, (state, action) => {
            state.sak = opprettEllerOppdaterRevurderingISak(state.sak, action.payload);
        });

        builder.addCase(revurderingActions.lagreFlyktningVilkår.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        builder.addCase(revurderingActions.lagreFastOppholdVilkår.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        builder.addCase(revurderingActions.lagreInstitusjonsoppholdVilkår.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        builder.addCase(revurderingActions.lagrePersonligOppmøteVilkår.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload.revurdering);
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

        builder.addCase(revurderingActions.lagreOpplysningsplikt.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        builder.addCase(revurderingActions.lagreLovligOppholdVilkår.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        builder.addCase(revurderingActions.beregnOgSimuler.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        builder.addCase(revurderingActions.sendRevurderingTilAttestering.fulfilled, (state, action) => {
            state.sak = oppdaterRevurderingISak(state.sak, action.payload);
        });

        builder.addCase(revurderingActions.lagreTilbakekrevingsbehandling.fulfilled, (state, action) => {
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

        builder.addCase(klageActions.bekreftFormkrav.fulfilled, (state, action) => {
            state.sak = oppdaterKlageISak(state.sak, action.payload);
        });

        builder.addCase(klageActions.lagreVurderingAvKlage.fulfilled, (state, action) => {
            state.sak = oppdaterKlageISak(state.sak, action.payload);
        });

        builder.addCase(klageActions.bekreftVurderinger.fulfilled, (state, action) => {
            state.sak = oppdaterKlageISak(state.sak, action.payload);
        });

        builder.addCase(klageActions.lagreAvvistFritekst.fulfilled, (state, action) => {
            state.sak = oppdaterKlageISak(state.sak, action.payload);
        });

        builder.addCase(klageActions.sendTilAttestering.fulfilled, (state, action) => {
            state.sak = oppdaterKlageISak(state.sak, action.payload);
        });

        builder.addCase(klageActions.oversend.fulfilled, (state, action) => {
            state.sak = oppdaterKlageISak(state.sak, action.payload);
        });

        builder.addCase(klageActions.iverksattAvvist.fulfilled, (state, action) => {
            state.sak = oppdaterKlageISak(state.sak, action.payload);
        });

        builder.addCase(klageActions.underkjenn.fulfilled, (state, action) => {
            state.sak = oppdaterKlageISak(state.sak, action.payload);
        });

        builder.addCase(klageActions.avsluttKlage.fulfilled, (state, action) => {
            state.sak = oppdaterKlageISak(state.sak, action.payload);
        });
    },
});

function opprettEllerOppdaterRevurderingISak(sak: RemoteData.RemoteData<ApiError, Sak>, revurdering: Revurdering) {
    return pipe(
        sak,
        RemoteData.map((s) => {
            if (s.revurderinger.some((r) => r.id === revurdering.id)) {
                return {
                    ...s,
                    revurderinger: s.revurderinger.map((r) => (r.id === revurdering.id ? revurdering : r)),
                };
            }
            return {
                ...s,
                revurderinger: [...s.revurderinger, revurdering],
            };
        })
    );
}

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

function oppaderSøknadsbehandlingISak(sak: RemoteData.RemoteData<ApiError, Sak>, søknadsbehandling: Søknadsbehandling) {
    return pipe(
        sak,
        RemoteData.map((sak) => ({
            ...sak,
            behandlinger: sak.behandlinger.map((b) => (b.id === søknadsbehandling.id ? søknadsbehandling : b)),
        }))
    );
}
