import { Nullable } from '~lib/types';
import { FormuegrunnlagVerdier } from '~types/Revurdering';

export const summerFormue = (formue: number[]) => {
    return formue.reduce((prev, current) => {
        if (isNaN(current)) {
            return prev + 0;
        }
        return prev + current;
    }, 0);
};

export const regnUtFormuegrunnlag = (verdier?: Nullable<FormuegrunnlagVerdier>) => {
    if (!verdier) {
        return 0;
    }

    const innskudd = Math.max(verdier.innskudd - verdier.depositumskonto, 0);

    const skalAdderes = [
        verdier.verdiIkkePrimærbolig,
        verdier.verdiEiendommer,
        verdier.verdiKjøretøy,
        verdier.verdipapir,
        verdier.pengerSkyldt,
        verdier.kontanter,
    ];

    const formue = [...skalAdderes, innskudd];

    return summerFormue(formue);
};
