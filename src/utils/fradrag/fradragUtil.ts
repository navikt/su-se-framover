import { Fradrag, Fradragstype } from '~types/Fradrag';

export const velgbareFradragstyper = Object.values(Fradragstype).filter(
    (f) =>
        ![
            Fradragstype.BeregnetFradragEPS,
            Fradragstype.UnderMinstenivå,
            Fradragstype.AvkortingUtenlandsopphold,
            Fradragstype.ForventetInntekt,
        ].includes(f)
);

export const fjernFradragSomIkkeErValgbare = (fradrag: Fradrag[]) =>
    fradrag.filter((f) => (f.type ? velgbareFradragstyper.includes(f.type) : true));
