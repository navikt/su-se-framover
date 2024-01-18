import { ErrorSummary, ErrorSummaryProps } from '@navikt/ds-react';
import { ForwardedRef, forwardRef } from 'react';

export interface FeiloppsummeringFeil {
    skjemaelementId: string;
    feilmelding: string;
}

interface Props extends Omit<ErrorSummaryProps, 'children'> {
    tittel: string;
    feil: FeiloppsummeringFeil[];
}

const Feiloppsummering = ({ tittel, feil, ...errorSummaryProps }: Props, ref: ForwardedRef<HTMLDivElement>) => {
    return (
        <ErrorSummary heading={tittel} {...errorSummaryProps} ref={ref}>
            {feil.map((f) => (
                <ErrorSummary.Item href={`#${f.skjemaelementId}`} key={f.skjemaelementId}>
                    {f.feilmelding}
                </ErrorSummary.Item>
            ))}
        </ErrorSummary>
    );
};

export default forwardRef(Feiloppsummering);
