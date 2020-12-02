import { SøknadInnhold } from '~types/Søknad';

export interface FaktablokkProps {
    søknadInnhold: SøknadInnhold;
    tittelType?: FaktablokkTitteltype;
}

export enum FaktablokkTitteltype {
    systemtittel = 'Systemtittel',
    undertittel = 'Undertittel',
}
