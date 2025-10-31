import { ErrorSummary, ErrorSummaryProps } from '@navikt/ds-react';
import { ForwardedRef } from 'react';

export interface FeiloppsummeringFeil {
    skjemaelementId: string;
    feilmelding: string;
}

interface Props extends Omit<ErrorSummaryProps, 'children'> {
    tittel: string;
    feil: FeiloppsummeringFeil[];
    ref?: ForwardedRef<HTMLDivElement>;
}

const Feiloppsummering = ({ tittel, feil, ref, ...errorSummaryProps }: Props) => {
    console.log('Feiloppsummering feil: ', feil);
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

export default Feiloppsummering;
