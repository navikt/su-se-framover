import { Bosituasjon } from '~types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';

export const hentBosituasjongrunnlag = (g: GrunnlagsdataOgVilkårsvurderinger): Bosituasjon => {
    if (g.bosituasjon.length > 1) {
        //Dette er en guard for at bosituasjon kan kun ha 1 element helt til vi støtter å ta inn fler
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return null!;
    }

    return g.bosituasjon[0];
};
