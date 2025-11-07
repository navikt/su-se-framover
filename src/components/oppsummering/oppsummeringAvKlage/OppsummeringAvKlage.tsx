import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Button, Heading, VStack } from '@navikt/ds-react';

import * as DokumentApi from '~src/api/dokumentApi';
import * as pdfApi from '~src/api/pdfApi';
import { InformationIcon } from '~src/assets/Icons';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { FormkravInfo } from '~src/components/oppsummering/oppsummeringAvKlage/FormkravInfo';
import { KlageInfo } from '~src/components/oppsummering/oppsummeringAvKlage/KlageInfo';
import { VurderInfo } from '~src/components/oppsummering/oppsummeringAvKlage/VurderInfo';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import UnderkjenteAttesteringer from '~src/components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useApiCall, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import { Klage, KlageStatus, KlageVurderingType } from '~src/types/Klage';
import { Vedtak } from '~src/types/Vedtak';
import * as DateUtils from '~src/utils/date/dateUtils';
import { getBlob } from '~src/utils/dokumentUtils';
import { erKlageOmgjort, erKlageOversendtUtfylt } from '~src/utils/klage/klageUtils';
import styles from './oppsummeringAvKlage.module.less';
import oppsummeringMessages from './oppsummeringAvKlage-nb';

const OppsummeringAvKlage = (props: { klage: Klage; klagensVedtak: Vedtak }) => {
    const { formatMessage } = useI18n({ messages: oppsummeringMessages });

    const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi.hentBrevutkastForKlage);
    const [hentDokumenterStatus, hentDokumenter] = useApiCall(DokumentApi.hentDokumenter);

    const hentVurderingstekstId = (klage: Klage): keyof typeof oppsummeringMessages => {
        if (klage.vedtaksvurdering?.type === KlageVurderingType.OPPRETTHOLD) return 'label.vurdering.opprettholdt';
        else if (
            klage.vedtaksvurdering?.type === KlageVurderingType.OMGJØR ||
            klage.vedtaksvurdering?.type === KlageVurderingType.DELVIS_OMGJØRING_EGEN_VEDTAKSINSTANS
        )
            return 'label.vurdering.omgjort';
        else if (
            [KlageStatus.AVVIST, KlageStatus.TIL_ATTESTERING_AVVIST, KlageStatus.IVERKSATT_AVVIST].includes(
                klage.status,
            )
        )
            return 'label.vurdering.avvist';

        return 'label.vurdering.ukjent';
    };
    const erOmgjort = erKlageOmgjort(props.klage);

    return (
        <div>
            <Oppsummeringspanel
                tittel={formatMessage('oppsummering.heading')}
                farge={Oppsummeringsfarge.Lilla}
                ikon={Oppsummeringsikon.Liste}
            >
                <div className={styles.panelInnholdContainer}>
                    <KlageInfo klage={props.klage} />
                    <FormkravInfo klage={props.klage} klagensVedtak={props.klagensVedtak} />
                    {props.klage.vedtaksvurdering && <VurderInfo klage={props.klage} />}
                </div>

                <div className={styles.vurdering}>
                    <InformationIcon className={styles.tag} />
                    <Heading size="xsmall" level="6">
                        {`${formatMessage('label.vurdering.tittel')}: ${formatMessage(
                            hentVurderingstekstId(props.klage),
                        )}`}
                    </Heading>
                </div>

                {props.klage.klagevedtakshistorikk.length > 0 && (
                    <div className={styles.utfallshistorikkContainer}>
                        <Heading size="xsmall" level="6">
                            Utfallshistorikk
                        </Heading>
                        <VStack gap="2">
                            {props.klage.klagevedtakshistorikk.map((vedtattUtfall, idx) => (
                                <div key={`${props.klage.id} - ${idx}`}>
                                    <BodyShort>{vedtattUtfall.utfall ?? 'Anke'}</BodyShort>
                                    {vedtattUtfall.klageinstansMottok && (
                                        <BodyShort>
                                            Klageinstans mottok klagen:{' '}
                                            {DateUtils.formatDateTime(vedtattUtfall.klageinstansMottok)}
                                        </BodyShort>
                                    )}
                                </div>
                            ))}
                        </VStack>
                    </div>
                )}
                {!erOmgjort && (
                    <>
                        {erKlageOversendtUtfylt(props.klage) ? (
                            <div className={styles.seBrevContainer}>
                                <Button
                                    variant="secondary"
                                    loading={RemoteData.isPending(hentDokumenterStatus)}
                                    onClick={() =>
                                        hentDokumenter(
                                            { id: props.klage.id, idType: DokumentIdType.Klage },
                                            (dokumenter) => window.open(URL.createObjectURL(getBlob(dokumenter[0]))),
                                        )
                                    }
                                >
                                    {formatMessage('knapp.seBrev')}
                                </Button>
                                {RemoteData.isFailure(hentDokumenterStatus) && (
                                    <ApiErrorAlert error={hentDokumenterStatus.error} />
                                )}
                            </div>
                        ) : (
                            <div className={styles.seBrevContainer}>
                                <Button
                                    variant="secondary"
                                    loading={RemoteData.isPending(brevStatus)}
                                    onClick={() => hentBrev({ sakId: props.klage.sakid, klageId: props.klage.id })}
                                >
                                    {formatMessage('knapp.seBrev')}
                                </Button>
                                {RemoteData.isFailure(brevStatus) && <ApiErrorAlert error={brevStatus.error} />}
                            </div>
                        )}
                    </>
                )}
                <UnderkjenteAttesteringer attesteringer={props.klage.attesteringer} />
            </Oppsummeringspanel>
        </div>
    );
};

export default OppsummeringAvKlage;
