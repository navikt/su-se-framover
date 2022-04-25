import { Fradrag, IkkeVelgbareFradragskategorier, VelgbareFradragskategorier } from '~src/types/Fradrag';

export const fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold = (fradrag: Fradrag[]) => {
    return fradrag.filter((f) =>
        [
            ...Object.values(VelgbareFradragskategorier),
            IkkeVelgbareFradragskategorier.NAVytelserTilLivsopphold,
        ].includes(f.type)
    );
};
