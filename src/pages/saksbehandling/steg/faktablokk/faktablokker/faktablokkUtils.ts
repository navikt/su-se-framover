import { SøknadInnhold } from '~types/Søknad';

export interface FaktablokkProps {
    søknadInnhold: SøknadInnhold;
    tittelType?: FaktablokkTitteltype;
}

export enum FaktablokkTitteltype {
    undertittel = 'Undertittel',
}
