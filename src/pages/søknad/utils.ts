import { Sakstype } from '~src/types/Søknad';

export function getSøknadstematekst<AlderTekst extends string, UføreTekst extends string>(
    sakstype: Sakstype,
    text: { [Sakstype.Uføre]: UføreTekst; [Sakstype.Alder]: AlderTekst }
): AlderTekst | UføreTekst {
    switch (sakstype) {
        case Sakstype.Alder:
            return text[Sakstype.Alder];
        case Sakstype.Uføre:
            return text[Sakstype.Uføre];
    }
}
