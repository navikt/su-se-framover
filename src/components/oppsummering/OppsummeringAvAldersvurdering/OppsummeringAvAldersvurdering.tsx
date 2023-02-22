import { Alert } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { Aldersvurdering, MaskinellVurderingsresultat } from '~src/types/Aldersvurdering';

import messages from './OppsummeringAvAldersvurdering-nb';

//TODO: lage en faktisk oppsummering, of denne komponenten flytt et annet sted

const AldersvurderingAdvarsel = (props: { a: Aldersvurdering }) => {
    const { formatMessage } = useI18n({ messages });

    switch (props.a.maskinellVurderingsresultat) {
        case MaskinellVurderingsresultat.HISTORISK:
            return null;
        case MaskinellVurderingsresultat.RETT_PÅ_ALDER:
            return <Alert variant="warning">{formatMessage('person.rettPåAlder')}</Alert>;
        case MaskinellVurderingsresultat.RETT_PÅ_UFØRE:
            return null;
        case MaskinellVurderingsresultat.SKAL_IKKE_VURDERES:
            return null;
        case MaskinellVurderingsresultat.UKJENT:
            return <Alert variant="warning">{formatMessage('person.ukjentFødselsinformasjon')}</Alert>;
    }
};

export default AldersvurderingAdvarsel;
