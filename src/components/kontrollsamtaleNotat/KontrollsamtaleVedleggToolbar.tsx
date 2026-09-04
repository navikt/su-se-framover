import { Button } from '@navikt/ds-react';

type Props = {
    antallVedlegg: number;
    onOpenVedlegg: () => void;
};

const KontrollsamtaleVedleggToolbar = ({ antallVedlegg, onOpenVedlegg }: Props) => {
    return (
        <Button type="button" size="small" variant="secondary" onClick={onOpenVedlegg}>
            {antallVedlegg === 0 ? 'Legg til vedlegg' : `Vis vedlegg (${antallVedlegg})`}
        </Button>
    );
};
export default KontrollsamtaleVedleggToolbar;
