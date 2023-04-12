import { Nullable } from '~src/lib/types';
import { OppslagsFeil, Skattegrunnlag, SkatteoppslagsFeil } from '~src/types/skatt/Skatt';

export const erSkattegrunnlag = (o: Nullable<object>): o is Skattegrunnlag => {
    return o !== null && 'fnr' in o && 'hentetTidspunkt' in o && 'årsgrunnlag' in o;
};

export const erSkatteOppslagsFeil = (o: Nullable<object>): o is SkatteoppslagsFeil => {
    return (
        o != null &&
        'httpCode' in o &&
        typeof o.httpCode === 'object' &&
        o.httpCode !== null &&
        erOppslagsfeil(o.httpCode)
    );
};

const erOppslagsfeil = (o: object): o is OppslagsFeil => {
    return 'value' in o && 'description' in o;
};
