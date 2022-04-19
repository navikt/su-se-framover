import { Fradrag, IkkeVelgbareFradragstyper, VelgbareFradragstyper } from '~src/types/Fradrag';

export const fjernFradragSomIkkeErVelgbareEksludertNavYtelserTilLivsopphold = (fradrag: Fradrag[]) => {
    return fradrag.filter((f) =>
        [...Object.values(VelgbareFradragstyper), IkkeVelgbareFradragstyper.NAVytelserTilLivsopphold].includes(f.type)
    );
};
