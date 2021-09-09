import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import React from 'react';
import { IntlShape } from 'react-intl';

import { ApiError, ErrorMessage } from '~api/apiClient';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import {
    BeregningOgSimuleringErrors,
    BostiuasjonErrors,
    BrevErrors,
    ForhåndsvarslingErrors,
    FormueErrors,
    FradragErrors,
    GenerellErrors,
    OpprettelseOgOppdateringErrors,
    PeriodeErrors,
    RevurderingErrorCodes,
    UføreErrors,
    UtfallSomIkkeStøttesErrors,
} from '~types/Revurdering';

import messages from './revurderingskallFeilet-nb';
import styles from './revurderingskallFeilet.module.less';

const revurderingErrorCodeMessageIdMap: { [key in RevurderingErrorCodes]: keyof typeof messages } = {
    [GenerellErrors.G_REGULERING_KAN_IKKE_FØRE_TIL_OPPHØR]: 'generell.gregulering.kan.ikke.føre.til.opphør',
    [GenerellErrors.ATTESTANT_OG_SAKSBEHANDLER_KAN_IKKE_VÆRE_SAMME_PERSON]:
        'generell.attestant.og.saksbehandler.kan.ikke.være.samme.person',
    [GenerellErrors.FEILUTBETALING_STØTTES_IKKE]: 'generell.feilutbetaling.støttes.ikke',
    [GenerellErrors.FANT_IKKE_SAK]: 'generell.fant.ikke.sak',
    [GenerellErrors.FANT_IKKE_PERSON]: 'generell.fant.ikke.person',
    [GenerellErrors.FANT_IKKE_AKTØR_ID]: 'generell.fant.ikke.aktør.id',
    [GenerellErrors.FANT_IKKE_REVURDERING]: 'generell.fant.ikke.revurdering',
    [GenerellErrors.UGYLDIG_PERIODE]: 'generell.ugyldig.periode',
    [GenerellErrors.UGYLDIG_TILSTAND]: 'generell.ugyldig.tilstand',
    [GenerellErrors.UGYLDIG_ÅRSAK]: 'generell.ugyldig.årsak',
    [GenerellErrors.UGYLDIG_BODY]: 'generell.ugyldig.body',
    [GenerellErrors.KUNNE_IKKE_OPPRETTE_OPPGAVE]: 'generell.kunne.ikke.opprette.oppgave',
    [GenerellErrors.KUNNE_IKKE_UTBETALE]: 'generell.kunne.ikke.utbetale',
    [GenerellErrors.KUNNE_IKKE_SLÅ_OPP_EPS]: 'generell.kunne.ikke.slå.opp.eps',

    [PeriodeErrors.INGENTING_Å_REVURDERE_I_PERIODEN]: 'periode.ingenting.å.revurdere',
    [PeriodeErrors.OVERLAPPENDE_VURDERINGSPERIODER]: 'periode.overlappende.vurderingsperioder',
    [PeriodeErrors.VURDERINGSPERIODE_UTENFOR_REVURDERINGSPERIODE]: 'periode.vurdering.utenfor.revurderingsperioden',

    [ForhåndsvarslingErrors.ALLEREDE_FORHÅNDSVARSLET]: 'forhåndsvarsel.allerede.forhåndsvarslet',
    [ForhåndsvarslingErrors.KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET]:
        'forhåndsvarsel.kan.ikke.oppdatere.er.forhåndsvarslet',
    [ForhåndsvarslingErrors.MANGLER_BESLUTNING_PÅ_FORHÅNDSVARSEL]: 'forhåndsvarsel.mangler.beslutning',
    [ForhåndsvarslingErrors.UGYLDIG_VALG]: 'forhåndsvarsel.ugyldig.valg',
    [ForhåndsvarslingErrors.ER_BESLUTTET]: 'forhåndsvarsel.er.besluttet',
    [ForhåndsvarslingErrors.IKKE_FORHÅNDSVARSLET]: 'forhåndsvarsel.ikke.varslet',
    [ForhåndsvarslingErrors.IKKE_RIKTIG_TILSTAND_FOR_BESLUTTNING]: 'forhåndsvarsel.feil.tilstand.for.beslutning',

    [UtfallSomIkkeStøttesErrors.DELVIS_OPPHØR]: 'opphør.deler.av.revurderingsperiode',
    [UtfallSomIkkeStøttesErrors.OPPHØR_AV_FLERE_VILKÅR]: 'opphør.flere.vilkår',
    [UtfallSomIkkeStøttesErrors.OPPHØR_OG_ANDRE_ENDRINGER_I_KOMBINASJON]: 'opphør.andre.endringer.i.kombinasjon',
    [UtfallSomIkkeStøttesErrors.OPPHØR_IKKE_FRA_FØRSTE_DATO_I_REVURDERINGSPERIODE]:
        'opphør.ikke.fra.første.dato.i.revurderingsperiode',

    [OpprettelseOgOppdateringErrors.MÅ_VELGE_INFORMASJON_SOM_REVURDERES]:
        'opprettelseOgOppdatering.må.velge.info.som.revurderes',
    [OpprettelseOgOppdateringErrors.HULL_I_TIDSLINJE]: 'opprettelseOgOppdatering.vedtak.ikke.kontinuerlig',
    [OpprettelseOgOppdateringErrors.BEGRUNNELSE_KAN_IKKE_VÆRE_TOM]: 'opprettelseOgOppdatering.tom.begrunnelse',
    [OpprettelseOgOppdateringErrors.UGYLDIG_ÅRSAK]: 'opprettelseOgOppdatering.ugyldig.årsak',
    [OpprettelseOgOppdateringErrors.BOSITUASJON_MED_FLERE_PERIODER_MÅ_VURDERES]:
        'opprettelseOgOppdatering.bosituasjon.flere.perioder',
    [OpprettelseOgOppdateringErrors.BOSITUASJON_FLERE_PERIODER_OG_EPS_INNTEKT]:
        'opprettelseOgOppdatering.bosituasjon.flere.perioder.og.eps.inntekt',
    [OpprettelseOgOppdateringErrors.FORMUE_SOM_FØRER_TIL_OPPHØR_MÅ_REVURDERES]:
        'opprettelseOgOppdatering.formue.til.opphør',
    [OpprettelseOgOppdateringErrors.EPS_FORMUE_MED_FLERE_PERIODER_MÅ_REVURDERES]:
        'opprettelseOgOppdatering.eps.formue.flere.perioder',
    [OpprettelseOgOppdateringErrors.KAN_IKKE_OPPDATERE_REVURDERING_SOM_ER_FORHÅNDSVARSLET]:
        'opprettelseOgOppdatering.oppdaterer.forhåndsvarslet.revurdering',

    [UføreErrors.UFØREGRAD_MÅ_VÆRE_MELLOM_EN_OG_HUNDRE]: 'uføre.uføregrad.må.være.mellom.en.og.hundre',
    [UføreErrors.UFØREGRAD_OG_FORVENTET_INNTEKT_MANGLER]: 'uføre.grad.og.forventetinntekt.mangler',
    [UføreErrors.PERIODE_FOR_GRUNNLAG_OG_VURDERING_ER_FORSKJELLIG]: 'uføre.grunnlag.og.vurdering.forskjellige',
    [UføreErrors.VURDERINGENE_MÅ_HA_SAMME_RESULTAT]: 'uføre.vurderinger.samme.resultat',
    [UføreErrors.HELE_BEHANDLINGSPERIODEN_MÅ_HA_VURDERING]: 'uføre.hele.behandlingsperioden.må.ha.vurdering',
    [UføreErrors.VURDERINGSPERIODER_MANGLER]: 'uføre.vurderingsperiode.mangler',

    [BostiuasjonErrors.KUNNE_IKKE_LEGGE_TIL_BOSITUASJONSGRUNNLAG]: 'bosituasjon.kunne.ikke.legge.til',
    [BostiuasjonErrors.EPS_ALDER_ER_NULL]: 'bosituasjon.eps.alder.er.null',
    [BostiuasjonErrors.KUNNE_IKKE_SLÅ_OPP_EPS]: 'bosituasjon.kunne.ikke.slå.opp.eps',

    [FormueErrors.DEPOSITUM_MINDRE_ENN_INNSKUDD]: 'formue.depositum.høyere.enn.innskudd',
    [FormueErrors.VERDIER_KAN_IKKE_VÆRE_NEGATIV]: 'formue.kan.ikke.ha.negative.verdier',
    [FormueErrors.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BEHANDLINGSPERIODEN]: 'formue.periode.utenfor.behandlingsperiode',
    [FormueErrors.IKKE_LOV_MED_FORMUEPERIODE_UTENFOR_BOSITUASJONPERIODE]: 'formue.periode.utenfor.bosituasjonsperiode',
    [FormueErrors.IKKE_LOV_MED_FORMUE_FOR_EPS_HVIS_MAN_IKKE_HAR_EPS]: 'formue.ikke.lov.eps.formue.uten.eps',

    [FradragErrors.KUNNE_IKKE_LEGGE_TIL_FRADRAGSGRUNNLAG]: 'fradrag.kunne.ikke.legge.til',
    [FradragErrors.FRADRAG_UGYLDIG_FRADRAGSTYPE]: 'fradrag.ugyldig.type',
    [FradragErrors.KUNNE_IKKE_LAGE_FRADRAG]: 'fradrag.kunne.ikke.lage',
    [FradragErrors.KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS]: 'fradrag.ikke.lov.eps.fradrag.uten.eps',
    [FradragErrors.PERIODE_MANGLER]: 'fradrag.mangler.periode',

    [BeregningOgSimuleringErrors.SISTE_MÅNED_VED_NEDGANG_I_STØNADEN]:
        'beregningOgSimulering.kan.ikke.velge.siste.måned.ved.nedgang',
    [BeregningOgSimuleringErrors.UGYLDIG_BEREGNINGSGRUNNLAG]: 'beregningOgSimulering.ugyldig.beregnignsgrunnlag',
    [BeregningOgSimuleringErrors.KAN_IKKE_HA_EPS_FRADRAG_UTEN_EPS]:
        'beregningOgSimulering.ikke.lov.eps.fradrag.uten.eps',
    [BeregningOgSimuleringErrors.FEILET]: 'beregningOgSimulering.simulering.feilet',
    [BeregningOgSimuleringErrors.OPPDRAG_STENGT_ELLER_NEDE]: 'beregningOgSimulering.oppdrag.stengt.eller.nede',
    [BeregningOgSimuleringErrors.FINNER_IKKE_PERSON]: 'beregningOgSimulering.finner.ikke.person',
    [BeregningOgSimuleringErrors.FINNER_IKKE_KJØRETIDSPLAN_FOR_FOM]: 'beregningOgSimulering.finner.ikke.kjøretidsplan',
    [BeregningOgSimuleringErrors.OPPDRAGET_FINNES_IKKE]: 'beregningOgSimulering.oppdraget.finnes.ikke',

    [BrevErrors.NAVNEOPPSLAG_SAKSBEHANDLER_ATTESTTANT_FEILET]: 'brev.navnoppslag.feilet',
    [BrevErrors.FANT_IKKE_GJELDENDEUTBETALING]: 'brev.fant.ikke.gjeldende.utbetaling',
    [BrevErrors.KUNNE_IKKE_DISTRIBUERE]: 'brev.kunne.ikke.distribuere',
    [BrevErrors.KUNNE_IKKE_JOURNALFØRE]: 'brev.kunne.ikke.journalføre',
    [BrevErrors.KUNNE_IKKE_GENERERE_BREV]: 'brev.kunne.ikke.generere',
    [BrevErrors.KUNNE_IKKE_LAGE_BREV]: 'brev.kunne.ikke.lage',
    [BrevErrors.FEIL_VED_GENERERING_AV_DOKUMENT]: 'brev.generering.dokument.feilet',
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
