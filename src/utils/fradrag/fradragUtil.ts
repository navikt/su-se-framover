import { Fradrag, IkkeVelgbareFradragskategorier, VelgbareFradragskategorier } from '~src/types/Fradrag';

export const fjernFradragSomIkkeErVelgbareEksludertNavYtelserTilLivsopphold = (fradrag: Fradrag[]) => {
    return fradrag.filter((f) =>
        [
            ...Object.values(VelgbareFradragskategorier),
            IkkeVelgbareFradragskategorier.NAVytelserTilLivsopphold,
        ].includes(f.fradragskategoriWrapper.kategori)
    );
};
