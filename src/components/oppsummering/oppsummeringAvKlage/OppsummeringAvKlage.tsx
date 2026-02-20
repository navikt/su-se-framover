import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Button, Heading, VStack } from '@navikt/ds-react';

import * as DokumentApi from '~src/api/dokumentApi';
import * as pdfApi from '~src/api/pdfApi';
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
import { Klage, utfallTilVisning } from '~src/types/Klage';
import { Vedtak } from '~src/types/Vedtak';
import * as DateUtils from '~src/utils/date/dateUtils';
import { openDokumentInNewTab } from '~src/utils/dokumentUtils';
import {
    erKlageDelvisomgjortEgenVedtaksinstans,
    erKlageOmgjort,
    erKlageOversendtUtfylt,
} from '~src/utils/klage/klageUtils';
import styles from './oppsummeringAvKlage.module.less';
import oppsummeringMessages from './oppsummeringAvKlage-nb';

const OppsummeringAvKlage = (props: { klage: Klage; klagensVedtak: Vedtak }) => {
    const { formatMessage } = useI18n({ messages: oppsummeringMessages });

    const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi.hentBrevutkastForKlage);
    const [hentDokumenterStatus, hentDokumenter] = useApiCall(DokumentApi.hentDokumenter);

    const skalBehandlesIEgenVedtaksinstans =
        erKlageOmgjort(props.klage) || erKlageDelvisomgjortEgenVedtaksinstans(props.klage);

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

                {props.klage.klagevedtakshistorikk.length > 0 && (
                    <div className={styles.utfallshistorikkContainer}>
                        <Heading size="xsmall" level="6">
                            Utfallshistorikk fra Kabal
                        </Heading>
                        <VStack gap="2">
                            {props.klage.klagevedtakshistorikk.map((vedtattUtfall, idx) => (
                                <div key={`${props.klage.id} - ${idx}`}>
                                    <BodyShort>
                                        {vedtattUtfall.utfall ? utfallTilVisning(vedtattUtfall.utfall) : 'Anke'}
                                    </BodyShort>
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
                {!skalBehandlesIEgenVedtaksinstans && (
                    <>
                        {erKlageOversendtUtfylt(props.klage) ? (
                            <div className={styles.seBrevContainer}>
                                <Button
                                    variant="secondary"
                                    loading={RemoteData.isPending(hentDokumenterStatus)}
                                    onClick={() =>
                                        hentDokumenter(
                                            { id: props.klage.id, idType: DokumentIdType.Klage },
                                            (dokumenter) => {
                                                const [dokument] = dokumenter;
                                                if (dokument) {
                                                    openDokumentInNewTab(dokument);
                                                }
                                            },
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
