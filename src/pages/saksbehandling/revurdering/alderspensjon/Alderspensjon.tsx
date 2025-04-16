import { Heading } from '~node_modules/@navikt/ds-react';
import ToKolonner from '~src/components/toKolonner/ToKolonner.tsx';
import { useI18n } from '~src/lib/i18n.ts';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader.tsx';
import sharedMessages from '~src/pages/saksbehandling/søknadsbehandling/sharedI18n-nb.ts';
import { RevurderingStegProps } from '~src/types/Revurdering.ts';

import messages from './alderspensjon-nb.ts';


const Alderspensjon = (props: RevurderingStegProps) => {
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: <></>,
                right: (
                    <>
                        <Heading size="large" level="2" spacing>
                            {formatMessage('gjeldende.overskrift')}
                        </Heading>
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default Alderspensjon;
