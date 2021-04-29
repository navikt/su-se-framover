import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import React from 'react';
import { IntlShape } from 'react-intl';

import { ApiError, ErrorMessage } from '~api/apiClient';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import { RevurderingErrorCodes } from '~types/Revurdering';

import messages from './revurderingskallFeilet-nb';
import styles from './revurderingskallFeilet.module.less';

const feilkodeTilFeilmelding = (intl: IntlShape, feil?: Nullable<ErrorMessage>) => {
    switch (feil?.code) {
        case RevurderingErrorCodes.UGYLDIG_TILSTAND:
            return intl.formatMessage({ id: 'feil.ugyldig.tilstand' });
        case RevurderingErrorCodes.UGYLDIG_PERIODE:
            return intl.formatMessage({ id: 'feil.ugyldig.periode' });
        case RevurderingErrorCodes.UGYLDIG_ÅRSAK:
            return intl.formatMessage({ id: 'feil.ugyldig.årsak' });
        case RevurderingErrorCodes.FANT_IKKE_REVURDERING:
            return intl.formatMessage({ id: 'feil.fant.ikke.revurdering' });
        case RevurderingErrorCodes.FANT_IKKE_AKTØR_ID:
            return intl.formatMessage({ id: 'feil.fant.ikke.aktør.id' });
        case RevurderingErrorCodes.FANT_IKKE_SAK:
            return intl.formatMessage({ id: 'feil.fant.ikke.sak' });
        case RevurderingErrorCodes.FANT_IKKE_PERSON:
            return intl.formatMessage({ id: 'feil.fant.ikke.person' });
        case RevurderingErrorCodes.KUNNE_IKKE_OPPRETTE_OPPGAVE:
            return intl.formatMessage({ id: 'feil.kunne.ikke.opprette.oppgave' });
        case RevurderingErrorCodes.KUNNE_IKKE_JOURNALFØRE_BREV:
            return intl.formatMessage({ id: 'feil.kunne.ikke.journalføre.brev' });
        case RevurderingErrorCodes.KUNNE_IKKE_DISTRIBUERE_BREV:
            return intl.formatMessage({ id: 'feil.kunne.ikke.distribuere.brev' });
        case RevurderingErrorCodes.ALLEREDE_FORHÅNDSVARSLET:
            return intl.formatMessage({ id: 'feil.allerede.forhåndsvarslet' });
        case RevurderingErrorCodes.UFULLSTENDIG_BEHANDLINGSINFORMASJON:
            return intl.formatMessage({ id: 'feil.ufullstendig.behandlingsinformasjon' });
        case RevurderingErrorCodes.SIMULERING_FEILET:
            return intl.formatMessage({ id: 'feil.simulering.feilet' });
        case RevurderingErrorCodes.SISTE_MÅNED_VED_NEDGANG_I_STØNADEN:
            return intl.formatMessage({ id: 'feil.siste.måned.ved.nedgang.i.stønaden' });
        case RevurderingErrorCodes.G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR:
            return intl.formatMessage({ id: 'feil.gregulering.kan.ikke.føre.til.opphør' });
        case RevurderingErrorCodes.MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL:
            return intl.formatMessage({ id: 'feil.mangler.beslutning.på.forhåndsvarsel' });
        case RevurderingErrorCodes.INGENTING_Å_REVURDERE_I_PERIODEN:
            return intl.formatMessage({ id: 'feil.kan.ikke.revurdere' });
        case RevurderingErrorCodes.BEGRUNNELSE_KAN_IKKE_VÆRE_TOM:
            return intl.formatMessage({ id: 'feil.begrunnelse.kan.ikke.være.tom' });
        case RevurderingErrorCodes.KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET:
            return intl.formatMessage({ id: 'feil.kan.ikke.oppdatere.revurdering.som.er.forhåndsvarslet' });
        case RevurderingErrorCodes.PERIODE_OG_ÅRSAK_KOMBINASJON_ER_UGYLDIG:
            return intl.formatMessage({ id: 'feil.periode.og.årsak.kombinasjon.er.ugyldig' });

        default:
            return intl.formatMessage({ id: 'feil.ukjentFeil' });
    }
};
const RevurderingskallFeilet = (props: { error?: ApiError }) => {
    const intl = useI18n({ messages });

    return (
        <AlertStripeFeil className={styles.alertstripe}>
            {feilkodeTilFeilmelding(intl, props.error?.body)}
        </AlertStripeFeil>
    );
};

export default RevurderingskallFeilet;
