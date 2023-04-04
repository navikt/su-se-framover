import { OppslagsFeil, Skattegrunnlag, SkatteoppslagsFeil } from '~src/types/skatt/Skatt';

export const erSkattegrunnlag = (o: object): o is Skattegrunnlag => {
    return 'fnr' in o && 'hentetTidspunkt' in o && 'årsgrunnlag' in o;
};

export const erSkatteOppslagsFeil = (o: object): o is SkatteoppslagsFeil => {
    return 'httpCode' in o && typeof o.httpCode === 'object' && o.httpCode !== null && erOppslagsfeil(o.httpCode);
};

const erOppslagsfeil = (o: object): o is OppslagsFeil => {
    return 'value' in o && 'description' in o;
};
