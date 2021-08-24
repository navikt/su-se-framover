import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import React from 'react';
import { IntlShape } from 'react-intl';

import { ApiError, ErrorMessage } from '~api/apiClient';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import { RevurderingErrorCodes } from '~types/Revurdering';

import messages from './revurderingskallFeilet-nb';
import styles from './revurderingskallFeilet.module.less';

const revurderingErrorCodeMessageIdMap: { [key in RevurderingErrorCodes]: string } = {
    //Ugyldig...
    [RevurderingErrorCodes.UGYLDIG_TILSTAND]: 'feil.ugyldig.tilstand',
    [RevurderingErrorCodes.UGYLDIG_PERIODE]: 'feil.ugyldig.periode',
    [RevurderingErrorCodes.UGYLDIG_ÅRSAK]: 'feil.ugyldig.årsak',
    [RevurderingErrorCodes.UGYLDIG_DATA]: 'feil.ugyldig.data',
    [RevurderingErrorCodes.HULL_I_TIDSLINJE]: 'feil.ugyldig.hull.tidslinje',

    //ikke_lov...
    [RevurderingErrorCodes.IKKE_LOV_MED_OVERLAPPENDE_PERIODER]: 'feil.ikke_lov_med_overlappende_perioder',
    [RevurderingErrorCodes.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BOSITUASJONPERIODE]:
        'feil.ikke_lov_med_formueperiode_utenfor_bosituasjonperiode',
    [RevurderingErrorCodes.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BEHANDLINGSPERIODEN]:
        'feil.ikke_lov_med_formueperiode_utenfor_behandlingsperioden',
    [RevurderingErrorCodes.IKKE_LOV_MED_FORMUE_FOR_EPS_HVIS_MAN_IKKE_HAR_EPS]:
        'feil.ikke_lov_med_formue_for_eps_hvis_man_ikke_har_eps',

    //fant ikke...
    [RevurderingErrorCodes.FANT_IKKE_REVURDERING]: 'feil.fant.ikke.revurdering',
    [RevurderingErrorCodes.FANT_IKKE_AKTØR_ID]: 'feil.fant.ikke.aktør.id',
    [RevurderingErrorCodes.FANT_IKKE_SAK]: 'feil.fant.ikke.sak',
    [RevurderingErrorCodes.FANT_IKKE_PERSON]: 'feil.fant.ikke.person',

    //kunne ikke...
    [RevurderingErrorCodes.KUNNE_IKKE_OPPRETTE_OPPGAVE]: 'feil.kunne.ikke.opprette.oppgave',
    [RevurderingErrorCodes.KUNNE_IKKE_JOURNALFØRE_BREV]: 'feil.kunne.ikke.journalføre.brev',
    [RevurderingErrorCodes.KUNNE_IKKE_DISTRIBUERE_BREV]: 'feil.kunne.ikke.distribuere.brev',
    [RevurderingErrorCodes.KUNNE_IKKE_UTBETALE]: 'feil.kunne.ikke.utbetale',
    [RevurderingErrorCodes.KUNNE_IKKE_SLÅ_OPP_EPS]: 'feil.kunne.ikke.slå.opp.eps',

    //forhåndsvarsling
    [RevurderingErrorCodes.MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL]: 'feil.mangler.beslutning.på.forhåndsvarsel',
    [RevurderingErrorCodes.KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET]:
        'feil.kan.ikke.oppdatere.revurdering.som.er.forhåndsvarslet',
    [RevurderingErrorCodes.ALLEREDE_FORHÅNDSVARSLET]: 'feil.allerede.forhåndsvarslet',

    //perioder
    [RevurderingErrorCodes.INGENTING_Å_REVURDERE_I_PERIODEN]: 'feil.kan.ikke.revurdere',
    [RevurderingErrorCodes.VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE]:
        'feil.vurderinger.utenfor.revurderingsperiode',
    [RevurderingErrorCodes.HELE_REVURDERINGSPERIODEN_MÅ_HA_VURDERINGER]: 'feil.mangler.revurderingsperioder',
    [RevurderingErrorCodes.OVERLAPPENDE_VURDERINGSPERIODER]: 'feil.overlappende.vurderingsperioder',

    //generell
    [RevurderingErrorCodes.UFULLSTENDIG_BEHANDLINGSINFORMASJON]: 'feil.ufullstendig.behandlingsinformasjon',
    [RevurderingErrorCodes.SISTE_MÅNED_VED_NEDGANG_I_STØNADEN]: 'feil.siste.måned.ved.nedgang.i.stønaden',
    [RevurderingErrorCodes.G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR]: 'feil.gregulering.kan.ikke.føre.til.opphør',
    [RevurderingErrorCodes.BEGRUNNELSE_KAN_IKKE_VÆRE_TOM]: 'feil.begrunnelse.kan.ikke.være.tom',
    [RevurderingErrorCodes.VURDERINGENE_MÅ_HA_SAMME_RESULTAT]: 'feil.vurderinger.samme.resultat',
    [RevurderingErrorCodes.ATTESTANT_OG_SAKSBEHANDLER_KAN_IKKE_VÆRE_SAMME_PERSON]:
        'feil.attestant.og.saksbehandler.kan.ikke.være.samme.person',
    [RevurderingErrorCodes.EPS_ALDER_ER_NULL]: 'feil.eps.alder.er.null',
    [RevurderingErrorCodes.KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS]: 'feil.kan.ikke.ha.eps.fradrag.uten.eps',

    //revurderingsutfall som ikke støttes
    [RevurderingErrorCodes.OPPHØR_OG_ANDRE_ENDRINGER_I_KOMBINASJON]: 'feil.opphør.og.andre.endringer.i.kombinasjon',
    [RevurderingErrorCodes.OPPHØR_IKKE_FRA_FØRSTE_DATO_I_REVURDERINGSPERIODE]:
        'feil.opphør.ikke.fra.første.dato.i.revurderingsperiode',
    [RevurderingErrorCodes.DELVIS_OPPHØR]: 'feil.opphør.deler.av.revurderingsperiode',
    [RevurderingErrorCodes.OPPHØR_AV_FLERE_VILKÅR]: 'feil.opphør.flere.vilkår',
    [RevurderingErrorCodes.FEILUTBETALING_STØTTES_IKKE]: 'feil.feilutbetaling.støttes.ikke',

    //bosituasjon
    [RevurderingErrorCodes.BOSITUASJON_MED_FLERE_PERIODER_MÅ_VURDERES]:
        'feil.bosituasjon.med.flere.perioder.må.vurderes',
    [RevurderingErrorCodes.BOSITUASJON_FLERE_PERIODER_OG_EPS_INNTEKT]:
        'feil.eps.inntekt.med.flere.perioder.må.revurderes',

    //Formue
    [RevurderingErrorCodes.GJELDENDE_EPS_HAR_FORMUE]: 'feil.gjeldende.eps.har.formue',
    [RevurderingErrorCodes.FORMUE_SOM_FØRER_TIL_OPPHØR_MÅ_REVURDERES]: 'feil.formue.som.fører.til.opphør.må.revurderes',
    [RevurderingErrorCodes.DEPOSITUM_KAN_IKKE_VÆRE_HØYERE_ENN_INNSKUDD]:
        'feil.depositum.kan.ikke.være.høyere.enn.innskudd',
    [RevurderingErrorCodes.EPS_FORMUE_MED_FLERE_PERIODER_MÅ_REVURDERES]:
        'feil.eps.formue.med.flere.perioder.må.revurderes',

    //Simulering
    [RevurderingErrorCodes.SIMULERING_FEILET]: 'feil.simulering.feilet',
    [RevurderingErrorCodes.SIMULERING_FEILET_OPPDRAG_STENGT_ELLER_NEDE]:
        'feil.simulering.feilet.oppdragStengtEllerNede',
    [RevurderingErrorCodes.SIMULERING_FEILET_FINNER_IKKE_PERSON]: 'feil.simulering.feilet.finnerIkkePerson',
    [RevurderingErrorCodes.SIMULERING_FEILET_FINNER_IKKE_KJØRETIDSPLAN_FOR_FOM]:
        'feil.simulering.feilet.finnerIkkeKjøreplansperiodeForFom',
    [RevurderingErrorCodes.SIMULERING_FEILET_OPPDRAGET_FINNES_IKKE]: 'feil.simulering.feilet.oppdragetFinnesIkke',
};

export const feilkodeTilFeilmelding = (intl: IntlShape, feil?: Nullable<ErrorMessage>) => {
    const messageId = revurderingErrorCodeMessageIdMap[(feil?.code ?? '') as RevurderingErrorCodes];
    return intl.formatMessage({ id: messageId ?? 'feil.ukjentFeil' });
};

const RevurderingskallFeilet = (props: { error?: ApiError }) => {
    const { intl } = useI18n({ messages });

    return (
        <AlertStripeFeil className={styles.alertstripe}>
            {feilkodeTilFeilmelding(intl, props.error?.body)}
        </AlertStripeFeil>
    );
};

export default RevurderingskallFeilet;
