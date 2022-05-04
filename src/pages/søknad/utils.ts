import { Søknadstema } from '~src/types/Søknad';

export const getSøknadstematekst = (
    søknadstema: Søknadstema,
    text: { [Søknadstema.Uføre]: string; [Søknadstema.Alder]: string }
): string => {
    switch (søknadstema) {
        case Søknadstema.Alder:
            return text[Søknadstema.Alder];
        case Søknadstema.Uføre:
            return text[Søknadstema.Uføre];
        default:
            return '';
    }
};
