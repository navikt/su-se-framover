import { Søknadstema } from '~src/types/Søknad';

export function getSøknadstematekst<AlderTekst extends string, UføreTekst extends string>(
    søknadstema: Søknadstema,
    text: { [Søknadstema.Uføre]: UføreTekst; [Søknadstema.Alder]: AlderTekst }
): AlderTekst | UføreTekst {
    switch (søknadstema) {
        case Søknadstema.Alder:
            return text[Søknadstema.Alder];
        case Søknadstema.Uføre:
            return text[Søknadstema.Uføre];
    }
}
