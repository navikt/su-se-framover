import { createAsyncThunk } from '@reduxjs/toolkit';

import { ApiError, ErrorMessage } from '~src/api/apiClient';
import * as revurderingApi from '~src/api/revurderingApi';
import { Uføregrunnlag } from '~src/api/revurderingApi';
import { Nullable } from '~src/lib/types';
import { TilbakekrevingsbehandlingFormData } from '~src/pages/saksbehandling/revurdering/OppsummeringPage/tilbakekreving/TilbakekrevingForm';
import { Fradrag } from '~src/types/Fradrag';
import { LovligOppholdRequest } from '~src/types/grunnlagsdataOgVilkårsvurderinger/lovligOpphold/LovligOppholdVilkår';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Periode } from '~src/types/Periode';
import {
    BeslutningEtterForhåndsvarsling,
    BosituasjonRequest,
    FastOppholdVilkårRequest,
    FlyktningVilkårRequest,
    FormuegrunnlagRequest,
    Gjenopptak,
    InformasjonSomRevurderes,
    InformasjonsRevurdering,
    IverksattRevurdering,
    OpplysningspliktRequest,
    OpprettetRevurdering,
    OpprettetRevurderingGrunn,
    PersonligOppmøteVilkårRequest,
    Revurdering,
    RevurderingTilAttestering,
    SimulertRevurdering,
    StansAvYtelse,
    UnderkjentRevurdering,
    UtenlandsoppholdRequest,
} from '~src/types/Revurdering';
import { UnderkjennelseGrunn } from '~src/types/Søknadsbehandling';

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

export const opprettStans = createAsyncThunk<
    StansAvYtelse,
    {
        sakId: string;
        fraOgMed: Date;
        årsak: OpprettetRevurderingGrunn;
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>('revurdering/opprettStans', async ({ sakId, fraOgMed, årsak, begrunnelse }, thunkApi) => {
    const res = await revurderingApi.opprettStans({ sakId, fraOgMed, årsak, begrunnelse });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const oppdaterStans = createAsyncThunk<
    StansAvYtelse,
    {
        sakId: string;
        revurderingId: string;
        fraOgMed: Date;
        årsak: OpprettetRevurderingGrunn;
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>('revurdering/oppdaterStans', async ({ sakId, revurderingId, fraOgMed, årsak, begrunnelse }, thunkApi) => {
    const res = await revurderingApi.oppdaterStans({ sakId, revurderingId, fraOgMed, årsak, begrunnelse });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const gjenoppta = createAsyncThunk<
    Gjenopptak,
    {
        sakId: string;
        årsak: OpprettetRevurderingGrunn;
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>('revurdering/gjenoppta', async ({ sakId, årsak, begrunnelse }, thunkApi) => {
    const res = await revurderingApi.gjenoppta({ sakId, årsak, begrunnelse });

    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const oppdaterGjenopptak = createAsyncThunk<
    Gjenopptak,
    {
        sakId: string;
        revurderingId: string;
        årsak: OpprettetRevurderingGrunn;
        begrunnelse: string;
    },
    { rejectValue: ApiError }
>('revurdering/oppdaterGjenopptak', async ({ sakId, årsak, begrunnelse, revurderingId }, thunkApi) => {
    const res = await revurderingApi.oppdaterGjenopptak({ sakId, årsak, begrunnelse, revurderingId });

    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

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
    { revurdering: SimulertRevurdering; feilmeldinger: ErrorMessage[]; varselmeldinger: ErrorMessage[] },
    { sakId: string; revurderingId: string; periode: Periode<string> },
    { rejectValue: ApiError }
>('revurdering/beregnOgSimuler', async ({ sakId, revurderingId, periode }, thunkApi) => {
    const res = await revurderingApi.beregnOgSimuler(sakId, {
        revurderingId,
        periode,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreForhåndsvarsel = createAsyncThunk<
    SimulertRevurdering,
    {
        sakId: string;
        revurderingId: string;
        forhåndsvarselhandling: revurderingApi.Forhåndsvarselhandling;
        fritekstTilBrev: string;
    },
    { rejectValue: ApiError }
>('revurdering/forhandsvarsle', async ({ sakId, revurderingId, forhåndsvarselhandling, fritekstTilBrev }, thunkApi) => {
    const res = await revurderingApi.lagreForhåndsvarsel(sakId, revurderingId, forhåndsvarselhandling, fritekstTilBrev);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreTilbakekrevingsbehandling = createAsyncThunk<
    SimulertRevurdering,
    {
        sakId: string;
        revurderingId: string;
        tilbakekrevingsbehandling: TilbakekrevingsbehandlingFormData;
    },
    { rejectValue: ApiError }
>('revurdering/tilbakekreving', async ({ sakId, revurderingId, tilbakekrevingsbehandling }, thunkApi) => {
    const res = await revurderingApi.lagreTilbakekrevingsbehandling(sakId, revurderingId, tilbakekrevingsbehandling);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const sendRevurderingTilAttestering = createAsyncThunk<
    RevurderingTilAttestering,
    { sakId: string; revurderingId: string; fritekstTilBrev: string; skalFøreTilBrevutsending?: boolean },
    { rejectValue: ApiError }
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
    { sakId: string; revurderingId: string; grunn: UnderkjennelseGrunn; kommentar?: string },
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
    Uføregrunnlag,
    {
        sakId: string;
        revurderingId: string;
        vurderinger: Array<{
            periode: Periode<string>;
            uføregrad: Nullable<number>;
            forventetInntekt: Nullable<number>;
            resultat: UføreResultat;
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

export const lagreFradragsgrunnlag = createAsyncThunk<
    { revurdering: InformasjonsRevurdering; feilmeldinger: ErrorMessage[] },
    {
        sakId: string;
        revurderingId: string;
        fradrag: Fradrag[];
    },
    { rejectValue: ApiError }
>('revurdering/grunnlag/fradrag/lagre', async (arg, thunkApi) => {
    const res = await revurderingApi.lagreFradragsgrunnlag(arg.sakId, arg.revurderingId, arg.fradrag);
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreBosituasjonsgrunnlag = createAsyncThunk<
    { revurdering: InformasjonsRevurdering; feilmeldinger: ErrorMessage[] },
    BosituasjonRequest,
    { rejectValue: ApiError }
>('revurdering/grunnlag/bosituasjon/lagre', async (arg, thunkApi) => {
    const res = await revurderingApi.lagreBosituasjonsgrunnlag({
        sakId: arg.sakId,
        revurderingId: arg.revurderingId,
        bosituasjoner: arg.bosituasjoner,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreUtenlandsopphold = createAsyncThunk<
    { revurdering: Revurdering; feilmeldinger: ErrorMessage[] },
    UtenlandsoppholdRequest,
    { rejectValue: ApiError }
>('revurdering/grunnlag/utlandsopphold/lagre', async (arg, thunkApi) => {
    const res = await revurderingApi.lagreUtenlandsopphold({
        sakId: arg.sakId,
        revurderingId: arg.revurderingId,
        utenlandsopphold: arg.utenlandsopphold,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreOpplysningsplikt = createAsyncThunk<
    { revurdering: Revurdering; feilmeldinger: ErrorMessage[] },
    OpplysningspliktRequest,
    { rejectValue: ApiError }
>('revurdering/grunnlag/opplysningsplikt/lagre', async (arg, thunkApi) => {
    const res = await revurderingApi.lagreOpplysningsplikt({
        id: arg.id,
        type: arg.type,
        data: arg.data,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFormuegrunnlag = createAsyncThunk<
    { revurdering: InformasjonsRevurdering; feilmeldinger: ErrorMessage[] },
    FormuegrunnlagRequest,
    { rejectValue: ApiError }
>('revurdering/grunnlag/formue/lagre', async (arg, thunkApi) => {
    const res = await revurderingApi.lagreFormuegrunnlag({
        sakId: arg.sakId,
        revurderingId: arg.revurderingId,
        formue: arg.formue,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreLovligOppholdVilkår = createAsyncThunk<
    { revurdering: InformasjonsRevurdering; feilmeldinger: ErrorMessage[] },
    LovligOppholdRequest,
    { rejectValue: ApiError }
>('revurdering/vilkår/lovligOpphold/lagre', async (arg, thunkApi) => {
    const res = await revurderingApi.lagreLovligOppholdVilkår({
        sakId: arg.sakId,
        behandlingId: arg.behandlingId,
        vurderinger: arg.vurderinger,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFlyktningVilkår = createAsyncThunk<
    { revurdering: Revurdering; feilmeldinger: ErrorMessage[] },
    FlyktningVilkårRequest,
    { rejectValue: ApiError }
>('revurdering/vilkår/flyktning/lagre', async (arg, thunkApi) => {
    const res = await revurderingApi.lagreFlyktningvilkår({
        sakId: arg.sakId,
        revurderingId: arg.revurderingId,
        vurderinger: arg.vurderinger,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagreFastOppholdVilkår = createAsyncThunk<
    { revurdering: Revurdering; feilmeldinger: ErrorMessage[] },
    FastOppholdVilkårRequest,
    { rejectValue: ApiError }
>('revurdering/vilkår/fastOpphold/lagre', async (arg, thunkApi) => {
    const res = await revurderingApi.lagreFastOppholdVilkår({
        sakId: arg.sakId,
        revurderingId: arg.revurderingId,
        vurderinger: arg.vurderinger,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const lagrePersonligOppmøteVilkår = createAsyncThunk<
    { revurdering: Revurdering; feilmeldinger: ErrorMessage[] },
    PersonligOppmøteVilkårRequest,
    { rejectValue: ApiError }
>('revurdering/vilkår/personligOppmøte/lagre', async (arg, thunkApi) => {
    const res = await revurderingApi.lagrePersonligOppmøteVilkår({
        sakId: arg.sakId,
        revurderingId: arg.revurderingId,
        vurderinger: arg.vurderinger,
    });
    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});

export const avsluttRevurdering = createAsyncThunk<
    Revurdering,
    { sakId: string; revurderingId: string; begrunnelse: string; fritekst: Nullable<string> },
    { rejectValue: ApiError }
>('revurdering/avsluttRevurdering', async (arg, thunkApi) => {
    const res = await revurderingApi.avsluttRevurdering({
        sakId: arg.sakId,
        revurderingId: arg.revurderingId,
        begrunnelse: arg.begrunnelse,
        fritekst: arg.fritekst,
    });

    if (res.status === 'ok') {
        return res.data;
    }
    return thunkApi.rejectWithValue(res.error);
});
