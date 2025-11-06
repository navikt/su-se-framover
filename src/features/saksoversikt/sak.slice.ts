import * as RemoteData from '@devexperts/remote-data-ts';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ApiError } from '~src/api/apiClient';
import * as dokumentApi from '~src/api/dokumentApi';
import { Behandlingstype, RevurderingOgFeilmeldinger, VilkårOgGrunnlagApiResult } from '~src/api/GrunnlagOgVilkårApi';
import * as sakApi from '~src/api/sakApi';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import * as klageActions from '~src/features/klage/klageActions';
import * as revurderingActions from '~src/features/revurdering/revurderingActions';
import * as SøknadActions from '~src/features/søknad/SøknadActions';
import * as SøknadsbehandlingActions from '~src/features/SøknadsbehandlingActions';
import * as tilbakekrevingActions from '~src/features/TilbakekrevingActions';
import * as VedtakActions from '~src/features/VedtakActions';
import { pipe } from '~src/lib/fp';
import { handleAsyncThunk, simpleRejectedActionToRemoteData } from '~src/redux/utils';
import { Behandlingssammendrag } from '~src/types/Behandlingssammendrag';
import { Dokument, DokumentIdType } from '~src/types/dokument/Dokument';
import { Klage } from '~src/types/Klage';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';
import {
    OppdaterRegistrertUtenlandsoppholdRequest,
    RegistrerteUtenlandsopphold,
    RegistrerUtenlandsoppholdRequest,
    AnnullerRegistrertUtenlandsoppholdRequest,
} from '~src/types/RegistrertUtenlandsopphold';
import { Revurdering } from '~src/types/Revurdering';
import { Sak } from '~src/types/Sak';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

export const fetchSakByIdEllerNummer = createAsyncThunk<
    Sak,
    { sakId: string } | { saksnummer: string },
    { rejectValue: ApiError }
>('sak/fetch', async (arg, thunkApi) => {
    const res = await ('saksnummer' in arg
        ? sakApi.fetchSakBySaksnummer(arg.saksnummer)
        : sakApi.fetchSakBySakId(arg.sakId));
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const fetchSakByFnr = createAsyncThunk<Sak[], { fnr: string }, { rejectValue: ApiError }>(
    'sak/fetchfnr',
    async (arg, thunkApi) => {
        const res = await sakApi.fetchSakForFnr(arg.fnr);
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    },
);

export const hentÅpneBehandlinger = createAsyncThunk<Behandlingssammendrag[], void, { rejectValue: ApiError }>(
    'sak/apneBehandlinger',
    async (_, thunkApi) => {
        const res = await sakApi.hentÅpneBehandlinger();
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    },
);

export const hentFerdigeBehandlinger = createAsyncThunk<Behandlingssammendrag[], void, { rejectValue: ApiError }>(
    'sak/ferdigeBehandlinger',
    async (_, thunkApi) => {
        const res = await sakApi.hentFerdigeBehandlinger();
        if (res.status === 'ok') {
            return res.data;
        }
        return thunkApi.rejectWithValue(res.error);
    },
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

export const registrerUtenlandsopphold = createAsyncThunk<
    RegistrerteUtenlandsopphold,
    RegistrerUtenlandsoppholdRequest,
    { rejectValue: ApiError }
>('sak/registrerUtenlandsopphold', async (arg, thunkApi) => {
    const res = await sakApi.registrerUtenlandsopphold(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const oppdaterRegistrertUtenlandsopphold = createAsyncThunk<
    RegistrerteUtenlandsopphold,
    OppdaterRegistrertUtenlandsoppholdRequest,
    { rejectValue: ApiError }
>('sak/oppdaterRegistrertUtenlandsopphold', async (arg, thunkApi) => {
    const res = await sakApi.oppdaterRegistrertUtenlandsopphold(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const annullerRegistrertUtenlandsopphold = createAsyncThunk<
    RegistrerteUtenlandsopphold,
    AnnullerRegistrertUtenlandsoppholdRequest,
    { rejectValue: ApiError }
>('sak/ugyldiggjørRegistrertUtenlandsopphold', async (arg, thunkApi) => {
    const res = await sakApi.annullerRegistrertUtenlandsopphold(arg);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const bekreftFnrEndring = createAsyncThunk<
    Sak,
    {
        sakId: string;
        nyttFnr: string;
        forrigeFnr: string;
    },
    { rejectValue: ApiError }
>('sak/bekreftFnrEndring', async (arg, thunkApi) => {
    const res = await sakApi.bekreftFnrEndring(arg);
    if (res.status === 'ok') {
        return res.data;
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
        handleAsyncThunk(builder, fetchSakByIdEllerNummer, {
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

        builder.addCase(bekreftFnrEndring.fulfilled, (state, action) => {
            state.sak = RemoteData.success(action.payload);
        });

        builder.addCase(SøknadsbehandlingActions.startBehandling.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    behandlinger: [...sak.behandlinger, action.payload],
                })),
            );
        });

        builder.addCase(SøknadsbehandlingActions.lagreVirkningstidspunkt.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(SøknadsbehandlingActions.startBeregning.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(SøknadsbehandlingActions.startSimulering.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(SøknadsbehandlingActions.attesteringIverksett.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(SøknadsbehandlingActions.attesteringUnderkjenn.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(SøknadsbehandlingActions.sendTilAttestering.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(SøknadsbehandlingActions.hentNySkattegrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterSøknadsbehandlingISak(state.sak, action.payload);
        });

        builder.addCase(SøknadActions.lukkSøknad.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    søknader: sak.søknader.map((s) =>
                        s.id === action.payload.lukketSøknad.id ? action.payload.lukketSøknad : s,
                    ),
                    behandlinger: sak.behandlinger.map((b) =>
                        b.id === action.payload.lukketSøknadsbehandling?.id
                            ? action.payload.lukketSøknadsbehandling
                            : b,
                    ),
                })),
            );
        });

        builder.addCase(SøknadActions.avslåSøknad.fulfilled, (state, action) => {
            state.sak = RemoteData.success(action.payload);
        });

        builder.addCase(registrerUtenlandsopphold.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    utenlandsopphold: {
                        antallDager: action.payload.antallDager,
                        utenlandsopphold: action.payload.utenlandsopphold,
                    },
                    versjon: action.payload.utenlandsopphold[action.payload.utenlandsopphold.length - 1].versjon,
                })),
            );
        });
        builder.addCase(oppdaterRegistrertUtenlandsopphold.fulfilled, (state, action) => {
            state.sak = oppdaterUtenlandsoppholdISak(state.sak, action.payload);
        });
        builder.addCase(annullerRegistrertUtenlandsopphold.fulfilled, (state, action) => {
            state.sak = oppdaterUtenlandsoppholdISak(state.sak, action.payload);
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

        builder.addCase(revurderingActions.lagreBrevvalg.fulfilled, (state, action) => {
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
                })),
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

        builder.addCase(klageActions.ferdigstillOmgjøring.fulfilled, (state, action) => {
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
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreFamilieforeninggrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
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

        builder.addCase(GrunnlagOgVilkårActions.lagreBosituasjongrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreFormuegrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagrePersonligOppmøteVilkår.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreFradragsgrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterBehandlingISak(state.sak, action.payload, action.meta.arg.behandlingstype);
        });

        builder.addCase(GrunnlagOgVilkårActions.lagreOpplysningsplikt.fulfilled, (state, action) => {
            state.sak = opprettEllerOppdaterRevurderingISak(state.sak, action.payload.revurdering);
        });

        //---------------Tilbakekreving-----------------//
        builder.addCase(tilbakekrevingActions.opprettNyTilbakekrevingsbehandling.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((s) => ({
                    ...s,
                    tilbakekrevinger: [...s.tilbakekrevinger, action.payload],
                    versjon: action.payload.versjon,
                })),
            );
        });
        builder.addCase(tilbakekrevingActions.sendForhåndsvarsel.fulfilled, (state, action) => {
            state.sak = oppdaterTilbakekrevingPåSak(state.sak, action.payload);
        });
        builder.addCase(tilbakekrevingActions.vurderTilbakekrevingsbehandling.fulfilled, (state, action) => {
            state.sak = oppdaterTilbakekrevingPåSak(state.sak, action.payload);
        });
        builder.addCase(tilbakekrevingActions.brevtekstTilbakekrevingsbehandling.fulfilled, (state, action) => {
            state.sak = oppdaterTilbakekrevingPåSak(state.sak, action.payload);
        });
        builder.addCase(tilbakekrevingActions.sendTilbakekrevingTilAttestering.fulfilled, (state, action) => {
            state.sak = oppdaterTilbakekrevingPåSak(state.sak, action.payload);
        });
        builder.addCase(tilbakekrevingActions.iverksettTilbakekreving.fulfilled, (state, action) => {
            state.sak = oppdaterTilbakekrevingPåSak(state.sak, action.payload);
        });
        builder.addCase(tilbakekrevingActions.underkjennTilbakekreving.fulfilled, (state, action) => {
            state.sak = oppdaterTilbakekrevingPåSak(state.sak, action.payload);
        });
        builder.addCase(tilbakekrevingActions.avsluttTilbakekreving.fulfilled, (state, action) => {
            state.sak = oppdaterTilbakekrevingPåSak(state.sak, action.payload);
        });
        builder.addCase(tilbakekrevingActions.oppdaterKravgrunnlag.fulfilled, (state, action) => {
            state.sak = oppdaterTilbakekrevingPåSak(state.sak, action.payload);
        });
        builder.addCase(tilbakekrevingActions.behandlingsnotatTilbakekreving.fulfilled, (state, action) => {
            state.sak = oppdaterTilbakekrevingPåSak(state.sak, action.payload);
        });
        builder.addCase(tilbakekrevingActions.annullerKravgrunnlag.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((s) => ({
                    ...s,
                    uteståendeKravgrunnlag: action.payload.uteståendeKravgrunnlag,
                    tilbakekrevinger:
                        action.payload.tilbakekrevingsbehandling !== null
                            ? s.tilbakekrevinger.map((t) =>
                                  t.id === action.payload.tilbakekrevingsbehandling!.id
                                      ? action.payload.tilbakekrevingsbehandling!
                                      : t,
                              )
                            : s.tilbakekrevinger,
                })),
            );
        });

        //---------------Vedtak-----------------//
        builder.addCase(VedtakActions.startNySøknadsbehandling.fulfilled, (state, action) => {
            state.sak = pipe(
                state.sak,
                RemoteData.map((sak) => ({
                    ...sak,
                    behandlinger: [...sak.behandlinger, action.payload],
                })),
            );
        });
    },
});

const oppdaterBehandlingISak = (
    sak: RemoteData.RemoteData<ApiError, Sak>,
    v: VilkårOgGrunnlagApiResult,
    b: Behandlingstype,
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
    søknadsbehandling: Søknadsbehandling,
) =>
    pipe(
        sak,
        RemoteData.map((sak) => ({
            ...sak,
            behandlinger: sak.behandlinger.map((b) => (b.id === søknadsbehandling.id ? søknadsbehandling : b)),
        })),
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
        }),
    );
}

function oppdaterRevurderingISak(sak: RemoteData.RemoteData<ApiError, Sak>, revurdering: Revurdering) {
    return pipe(
        sak,
        RemoteData.map((s) => ({
            ...s,
            revurderinger: s.revurderinger.map((r) => (r.id === revurdering.id ? revurdering : r)),
        })),
    );
}

function oppdaterKlageISak(sak: RemoteData.RemoteData<ApiError, Sak>, klage: Klage) {
    return pipe(
        sak,
        RemoteData.map((s) => ({
            ...s,
            klager: s.klager.map((k) => (k.id === klage.id ? klage : k)),
        })),
    );
}

function oppdaterUtenlandsoppholdISak(
    sak: RemoteData.RemoteData<ApiError, Sak>,
    utenlandsopphold: RegistrerteUtenlandsopphold,
) {
    return pipe(
        sak,
        RemoteData.map((s) => ({
            ...s,
            versjon: utenlandsopphold.utenlandsopphold[utenlandsopphold.utenlandsopphold.length - 1].versjon,
            utenlandsopphold: {
                utenlandsopphold: utenlandsopphold.utenlandsopphold,
                antallDager: utenlandsopphold.antallDager,
            },
        })),
    );
}

function oppdaterTilbakekrevingPåSak(
    sak: RemoteData.RemoteData<ApiError, Sak>,
    tilbakekreving: ManuellTilbakekrevingsbehandling,
) {
    return pipe(
        sak,
        RemoteData.map((s) => ({
            ...s,
            tilbakekrevinger: s.tilbakekrevinger.map((t) => (t.id === tilbakekreving.id ? tilbakekreving : t)),
            versjon: tilbakekreving.versjon,
        })),
    );
}
