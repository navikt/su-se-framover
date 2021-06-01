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
        //Ugyldig...
        case RevurderingErrorCodes.UGYLDIG_TILSTAND:
            return intl.formatMessage({ id: 'feil.ugyldig.tilstand' });
        case RevurderingErrorCodes.UGYLDIG_PERIODE:
            return intl.formatMessage({ id: 'feil.ugyldig.periode' });
        case RevurderingErrorCodes.UGYLDIG_ÅRSAK:
            return intl.formatMessage({ id: 'feil.ugyldig.årsak' });

        //fant ikke...
        case RevurderingErrorCodes.FANT_IKKE_REVURDERING:
            return intl.formatMessage({ id: 'feil.fant.ikke.revurdering' });
        case RevurderingErrorCodes.FANT_IKKE_AKTØR_ID:
            return intl.formatMessage({ id: 'feil.fant.ikke.aktør.id' });
        case RevurderingErrorCodes.FANT_IKKE_SAK:
            return intl.formatMessage({ id: 'feil.fant.ikke.sak' });
        case RevurderingErrorCodes.FANT_IKKE_PERSON:
            return intl.formatMessage({ id: 'feil.fant.ikke.person' });

        //kunne ikke...
        case RevurderingErrorCodes.KUNNE_IKKE_OPPRETTE_OPPGAVE:
            return intl.formatMessage({ id: 'feil.kunne.ikke.opprette.oppgave' });
        case RevurderingErrorCodes.KUNNE_IKKE_JOURNALFØRE_BREV:
            return intl.formatMessage({ id: 'feil.kunne.ikke.journalføre.brev' });
        case RevurderingErrorCodes.KUNNE_IKKE_DISTRIBUERE_BREV:
            return intl.formatMessage({ id: 'feil.kunne.ikke.distribuere.brev' });
        case RevurderingErrorCodes.KUNNE_IKKE_KONTROLL_SIMULERE:
            return intl.formatMessage({ id: 'feil.kunne.ikke.kontroll.simulere' });
        case RevurderingErrorCodes.KUNNE_IKKE_UTBETALE:
            return intl.formatMessage({ id: 'feil.kunne.ikke.utbetale' });

        //forhåndsvarsling
        case RevurderingErrorCodes.MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL:
            return intl.formatMessage({ id: 'feil.mangler.beslutning.på.forhåndsvarsel' });
        case RevurderingErrorCodes.KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET:
            return intl.formatMessage({ id: 'feil.kan.ikke.oppdatere.revurdering.som.er.forhåndsvarslet' });
        case RevurderingErrorCodes.ALLEREDE_FORHÅNDSVARSLET:
            return intl.formatMessage({ id: 'feil.allerede.forhåndsvarslet' });

        //perioder
        case RevurderingErrorCodes.INGENTING_Å_REVURDERE_I_PERIODEN:
            return intl.formatMessage({ id: 'feil.kan.ikke.revurdere' });
        case RevurderingErrorCodes.VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE:
            return intl.formatMessage({ id: 'feil.vurderinger.utenfor.revurderingsperiode' });
        case RevurderingErrorCodes.HELE_REVURDERINGSPERIODEN_MÅ_HA_VURDERINGER:
            return intl.formatMessage({ id: 'feil.mangler.revurderingsperioder' });
        case RevurderingErrorCodes.OVERLAPPENDE_VURDERINGSPERIODER:
            return intl.formatMessage({ id: 'feil.overlappende.vurderingsperioder' });

        case RevurderingErrorCodes.UFULLSTENDIG_BEHANDLINGSINFORMASJON:
            return intl.formatMessage({ id: 'feil.ufullstendig.behandlingsinformasjon' });
        case RevurderingErrorCodes.SIMULERING_FEILET:
            return intl.formatMessage({ id: 'feil.simulering.feilet' });
        case RevurderingErrorCodes.SISTE_MÅNED_VED_NEDGANG_I_STØNADEN:
            return intl.formatMessage({ id: 'feil.siste.måned.ved.nedgang.i.stønaden' });
        case RevurderingErrorCodes.G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR:
            return intl.formatMessage({ id: 'feil.gregulering.kan.ikke.føre.til.opphør' });
        case RevurderingErrorCodes.BEGRUNNELSE_KAN_IKKE_VÆRE_TOM:
            return intl.formatMessage({ id: 'feil.begrunnelse.kan.ikke.være.tom' });
        case RevurderingErrorCodes.VURDERINGENE_MÅ_HA_SAMME_RESULTAT:
            return intl.formatMessage({ id: 'feil.vurderinger.samme.resultat' });
        case RevurderingErrorCodes.ATTESTANT_OG_SAKSBEHANDLER_KAN_IKKE_VÆRE_SAMME_PERSON:
            return intl.formatMessage({ id: 'feil.attestant.og.saksbehandler.kan.ikke.være.samme.person' });

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
