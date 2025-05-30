import { Nullable } from '~src/lib/types.ts';
import { Fødsel } from '~src/types/Person.ts';
import { alderSomPersonFyllerIÅrDate, alderSomPersonFyllerPåDato } from '~src/utils/person/personUtils.ts';

//Samme logikk som SjekkFødselsdatoMotVirk - må oppdateres sammen
export const forUngAlderFødselsinformasjonDato = (props: {
    stønadsperiodeFraOgMed: Nullable<Date>;
    søkerFødselsdato: string;
}): boolean => {
    return !!(
        props.stønadsperiodeFraOgMed &&
        alderSomPersonFyllerPåDato(props.stønadsperiodeFraOgMed, new Date(props.søkerFødselsdato)) < 67
    );
};

export const forUngAlderEtterFødselsår = (props: { stønadsperiodeFraOgMed: Nullable<Date>; fødselsår: number }) => {
    return !!(
        props.stønadsperiodeFraOgMed &&
        alderSomPersonFyllerIÅrDate(props.stønadsperiodeFraOgMed.getFullYear(), props.fødselsår) < 67
    );
};

export const alderPersonForUngSkalViseVilkårForAvslag = (props: {
    stønadsperiodeFraOgMed: Nullable<Date>;
    søkersFødselsinformasjon: Nullable<Fødsel>;
}): boolean => {
    if (!props.søkersFødselsinformasjon || !props.stønadsperiodeFraOgMed) {
        return false;
    }

    if (props.søkersFødselsinformasjon.dato) {
        return forUngAlderFødselsinformasjonDato({
            stønadsperiodeFraOgMed: props.stønadsperiodeFraOgMed,
            søkerFødselsdato: props.søkersFødselsinformasjon.dato,
        });
    }

    return forUngAlderEtterFødselsår({
        stønadsperiodeFraOgMed: props.stønadsperiodeFraOgMed,
        fødselsår: props.søkersFødselsinformasjon.år,
    });
};
