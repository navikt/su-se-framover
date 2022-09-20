import { DelerBoligMed } from '~src/features/søknad/types';
import { Nullable } from '~src/lib/types';
import {
    Bosituasjon,
    BosituasjonTyper,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { SøknadInnhold } from '~src/types/Søknadinnhold';

export const hentBosituasjongrunnlag = (g: GrunnlagsdataOgVilkårsvurderinger): Bosituasjon => {
    if (g.bosituasjon.length > 1) {
        //Dette er en guard for at bosituasjon kan kun ha 1 element helt til vi støtter å ta inn fler
        return null!;
    }

    return g.bosituasjon[0];
};

export const hentOmSøkerBorMedEpsOgEpsFnr = (
    b: Nullable<Bosituasjon>,
    søknadsinnhold: SøknadInnhold
): { borSøkerMedEPS: boolean; epsFnr: Nullable<string> } => {
    if (!b) {
        return {
            borSøkerMedEPS: søknadsinnhold.boforhold.delerBoligMed === DelerBoligMed.EKTEMAKE_SAMBOER,
            epsFnr: søknadsinnhold.boforhold.ektefellePartnerSamboer?.fnr ?? null,
        };
    }
    switch (b.type) {
        case BosituasjonTyper.DELER_BOLIG_MED_VOKSNE:
        case BosituasjonTyper.UFULLSTENDIG_HAR_IKKE_EPS:
        case BosituasjonTyper.ENSLIG:
            return { borSøkerMedEPS: false, epsFnr: null };

        case BosituasjonTyper.EPS_IKKE_UFØR_FLYKTNING:
        case BosituasjonTyper.EPS_OVER_67:
        case BosituasjonTyper.EPS_UFØR_FLYKTNING:
        case BosituasjonTyper.UFULLSTENDIG_HAR_EPS:
            return { borSøkerMedEPS: true, epsFnr: b.fnr };
    }
};
