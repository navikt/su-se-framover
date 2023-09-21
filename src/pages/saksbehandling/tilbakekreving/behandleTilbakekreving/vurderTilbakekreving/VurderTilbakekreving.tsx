import React from 'react';

import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useI18n } from '~src/lib/i18n';

import messages from '../../Tilbakekreving-nb';
const VurderTilbakekreving = () => {
    const { formatMessage } = useI18n({ messages });

    return (
        <ToKolonner tittel={formatMessage('vurderTilbakekreving.tittel')}>
            {{
                left: <div>innhold</div>,
                right: <>oppsummering</>, //<OppsummeringAvKravgrunnlag />
            }}
        </ToKolonner>
    );
};

export default VurderTilbakekreving;
