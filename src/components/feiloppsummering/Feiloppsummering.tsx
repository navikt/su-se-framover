import { ErrorSummary, ErrorSummaryItem, ErrorSummaryProps } from '@navikt/ds-react';
import * as React from 'react';

export interface FeiloppsummeringFeil {
    skjemaelementId: string;
    feilmelding: string;
}

interface Props extends Omit<ErrorSummaryProps, 'children'> {
    tittel: string;
    feil: FeiloppsummeringFeil[];
}

const Feiloppsummering = ({ tittel, feil, ...errorSummaryProps }: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
    return (
        <ErrorSummary heading={tittel} {...errorSummaryProps} ref={ref}>
            {feil.map((f) => (
                <ErrorSummaryItem href={`#${f.skjemaelementId}`} key={f.skjemaelementId}>
                    {f.feilmelding}
                </ErrorSummaryItem>
            ))}
        </ErrorSummary>
    );
};

export default React.forwardRef(Feiloppsummering);
