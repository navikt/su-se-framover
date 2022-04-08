import { Fradrag, Fradragstype, VelgbareFradragstyper } from '~src/types/Fradrag';

export const fjernFradragSomIkkeErValgbare = (fradrag: Fradrag[]) =>
    fradrag.filter((f) => (Object.values(VelgbareFradragstyper) as Fradragstype[]).includes(f.type));
