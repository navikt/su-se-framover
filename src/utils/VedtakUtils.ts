import { Behandling } from '~src/types/Behandling';
import { Klage } from '~src/types/Klage';
import { ManuellTilbakekrevingsbehandling } from '~src/types/ManuellTilbakekrevingsbehandling';
import { Regulering } from '~src/types/Regulering';
import { Sak } from '~src/types/Sak';
import { Dokumenttilstand, Vedtak, VedtakType } from '~src/types/Vedtak';

export const getVedtakstype = (v: Vedtak) => {
    switch (v.type) {
        case VedtakType.AVSLAG:
            return 'søknad';
        case VedtakType.AVVIST_KLAGE:
            return 'klage';
        case VedtakType.ENDRING:
            return 'revurdering';
        case VedtakType.GJENOPPTAK_AV_YTELSE:
            return 'gjenopptak';
        case VedtakType.OPPHØR:
            return 'revurdering';
        case VedtakType.REGULERING:
            return 'regulering';
        case VedtakType.STANS_AV_YTELSE:
            return 'stans';
        case VedtakType.SØKNAD:
            return 'søknad';
        case VedtakType.TILBAKEKREVING:
            return 'tilbakekreving';
    }
};

export const getVedtaketsbehandling = (
    v: Vedtak,
    sak: Sak,
): Behandling | Regulering | Klage | ManuellTilbakekrevingsbehandling => {
    switch (v.type) {
        case VedtakType.SØKNAD:
        case VedtakType.AVSLAG:
            return sak.behandlinger.find((b) => b.id === v.behandlingId)!;
        case VedtakType.REGULERING:
            return sak.reguleringer.find((r) => r.id === v.behandlingId)!;
        case VedtakType.ENDRING:
        case VedtakType.GJENOPPTAK_AV_YTELSE:
        case VedtakType.OPPHØR:
        case VedtakType.STANS_AV_YTELSE:
            return sak.revurderinger.find((r) => r.id === v.behandlingId)!;
        case VedtakType.AVVIST_KLAGE:
            return sak.klager.find((k) => k.id === v.behandlingId)!;
        case VedtakType.TILBAKEKREVING:
            return sak.tilbakekrevinger.find((t) => t.id === v.behandlingId)!;
    }
};

export const erDokumentGenerertEllerSenere = (v: Vedtak) =>
    v.dokumenttilstand === Dokumenttilstand.GENERERT ||
    v.dokumenttilstand === Dokumenttilstand.JOURNALFØRT ||
    v.dokumenttilstand === Dokumenttilstand.SENDT;

export const skalDokumentIkkeGenereres = (v: Vedtak) => v.dokumenttilstand === Dokumenttilstand.SKAL_IKKE_GENERERE;
export const erDokumentIkkeGenerertEnda = (v: Vedtak) => v.dokumenttilstand === Dokumenttilstand.IKKE_GENERERT_ENDA;
