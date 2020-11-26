import { DelerBoligMed } from '~features/søknad/types';
import { Nullable } from '~lib/types';

export function delerBoligMedFormatted(delerBoligMed: Nullable<DelerBoligMed>) {
    switch (delerBoligMed) {
        case DelerBoligMed.ANNEN_VOKSEN:
            return 'Annen voksen';
        case DelerBoligMed.EKTEMAKE_SAMBOER:
            return 'Ektefelle eller samboer';
        case DelerBoligMed.VOKSNE_BARN:
            return 'Voksne barn';
        default:
            return '-';
    }
}
