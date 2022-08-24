import * as RemoteData from '@devexperts/remote-data-ts';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as behandlingApi from '~src/api/behandlingApi';
import * as dokumentApi from '~src/api/dokumentApi';
import { Behandlingstype, RevurderingOgFeilmeldinger, VilkårOgGrunnlagApiResult } from '~src/api/GrunnlagOgVilkårApi';
import * as sakApi from '~src/api/sakApi';
import * as søknadApi from '~src/api/søknadApi';
import { AvslagManglendeDokType, LukkSøknadBodyTypes } from '~src/api/søknadApi';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import * as klageActions from '~src/features/klage/klageActions';
import * as revurderingActions from '~src/features/revurdering/revurderingActions';
import { pipe } from '~src/lib/fp';
import { Nullable } from '~src/lib/types';
import { createApiCallAsyncThunk, handleAsyncThunk, simpleRejectedActionToRemoteData } from '~src/redux/utils';
import { UnderkjennelseGrunn } from '~src/types/Behandling';
import { Dokument, DokumentIdType } from '~src/types/dokument/Dokument';
import { Klage } from '~src/types/Klage';
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
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(startBeregning.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(startSimulering.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(attesteringIverksett.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(attesteringUnderkjenn.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(sendTilAttestering.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(lukkSøknad.fulfilled, (state, action) => {
            state.sak = RemoteData.success(action.payload);
        });

        builder.addCase(avslagManglendeDokSøknad.fulfilled, (state, action) => {
            state.sak = RemoteData.success(action.payload);
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

        builder.addCase(GrunnlagOgVilkårActions.lagreUføregrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreAlderspensjongrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreFamilieforeninggrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreFlyktningVilkår.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreLovligOppholdVilkår.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreFastOppholdVilkår.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreInstitusjonsoppholdVilkår.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreUtenlandsopphold.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreUfullstendigBosituasjon.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreFormuegrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagrePersonligOppmøteVilkår.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreFullstendigBosituasjon.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreFradragsgrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreBosituasjonsgrunnlag.fulfilled, (state, action) => {
            state.sak = opprettEllerOppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreOpplysningsplikt.fulfilled, (state, action) => {
            state.sak = opprettEllerOppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });
    },
});

const oppdaterBehandlingISak = (
    sak: RemoteData.RemoteData<ApiError, Sak>,
    v: VilkårOgGrunnlagApiResult,
    b: Behandlingstype
) => {
    switch (b) {
        case Behandlingstype.Søknadsbehandling:
            return oppdaterSøknadsbehandlingISak(sak, v as Søknadsbehandling);
        case Behandlingstype.Revurdering:
            return oppdaterRevurderingISak(sak, (v as RevurderingOgFeilmeldinger).revurdering);
    }
};

const oppdaterSøknadsbehandlingISak = (
    sak: RemoteData.RemoteData<ApiError, Sak>,
    søknadsbehandling: Søknadsbehandling
) =>
    pipe(
        sak,
        RemoteData.map((sak) => ({
            ...sak,
            behandlinger: sak.behandlinger.map((b) => (b.id === søknadsbehandling.id ? søknadsbehandling : b)),
        }))
    );

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
