import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Label, Heading, Button, VStack } from '@navikt/ds-react';
import classNames from 'classnames';

import * as DokumentApi from '~src/api/dokumentApi';
import * as pdfApi from '~src/api/pdfApi';
import { InformationIcon } from '~src/assets/Icons';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import UnderkjenteAttesteringer from '~src/components/underkjenteAttesteringer/UnderkjenteAttesteringer';
import { useApiCall, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import formkravMessages from '~src/pages/klage/vurderFormkrav/vurderFormkrav-nb';
import vurderingMessages from '~src/pages/klage/vurderingAvKlage/VurderingAvKlage-nb';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import { Klage, KlageStatus, KlageVurderingType } from '~src/types/Klage';
import { Vedtak } from '~src/types/Vedtak';
import * as DateUtils from '~src/utils/date/dateUtils';
import { getBlob } from '~src/utils/dokumentUtils';
import { erKlageOmgjort, erKlageOpprettholdt, erKlageOversendt } from '~src/utils/klage/klageUtils';

import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';

import oppsummeringMessages from './oppsummeringAvKlage-nb';
import styles from './oppsummeringAvKlage.module.less';

const OppsummeringAvKlage = (props: { klage: Klage; klagensVedtak: Vedtak }) => {
    const { formatMessage } = useI18n({ messages: oppsummeringMessages });

    const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi.hentBrevutkastForKlage);
    const [hentDokumenterStatus, hentDokumenter] = useApiCall(DokumentApi.hentDokumenter);

    const hentVurderingstekstId = (klage: Klage): keyof typeof oppsummeringMessages => {
        if (klage.vedtaksvurdering?.type === KlageVurderingType.OPPRETTHOLD) return 'label.vurdering.opprettholdt';
        else if (klage.vedtaksvurdering?.type === KlageVurderingType.OMGJØR) return 'label.vurdering.omgjort';
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
                        {erKlageOversendt(props.klage) ? (
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

const KlageInfo = (props: { klage: Klage }) => {
    const { formatMessage } = useI18n({ messages: oppsummeringMessages });

    return (
        <div className={classNames(styles.informasjonsContainer, styles.informasjonsContentContainer)}>
            {[
                {
                    tittel: formatMessage('label.saksbehandler'),
                    verdi: props.klage.saksbehandler,
                },
                {
                    tittel: formatMessage('label.journalpostId'),
                    verdi: props.klage.journalpostId,
                },
                {
                    tittel: formatMessage('label.klageMottatt'),
                    verdi: DateUtils.formatDate(props.klage.datoKlageMottatt),
                },
            ].map((item) => (
                <OppsummeringPar key={item.tittel} label={item.tittel} verdi={item.verdi} retning={'vertikal'} />
            ))}
        </div>
    );
};

export const FormkravInfo = (props: { klage: Klage; klagensVedtak: Vedtak }) => {
    const { formatMessage } = useI18n({
        messages: { ...oppsummeringMessages, ...formkravMessages, ...vurderingMessages },
    });

    return (
        <div className={styles.informasjonsContainer}>
            <div className={styles.informasjonsContentContainer}>
                <OppsummeringPar
                    label={formatMessage('label.vedtak.type')}
                    verdi={formatMessage(props.klagensVedtak.type)}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('label.vedtak.dato')}
                    verdi={DateUtils.formatDateTime(props.klagensVedtak.opprettet)}
                    retning={'vertikal'}
                />
            </div>
            <div className={styles.informasjonsContentContainer}>
                <OppsummeringPar
                    label={formatMessage('formkrav.klagesPåKonkreteElementer.label')}
                    verdi={
                        props.klage.klagesDetPåKonkreteElementerIVedtaket
                            ? formatMessage('label.ja')
                            : formatMessage('label.nei')
                    }
                    retning={'vertikal'}
                    className={styles.tekstMaxBredde}
                />
                <OppsummeringPar
                    label={formatMessage('formkrav.innenforFrist.label')}
                    verdi={props.klage.innenforFristen && formatMessage(props.klage.innenforFristen)}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('formkrav.signert.label')}
                    verdi={props.klage.erUnderskrevet && formatMessage(props.klage.erUnderskrevet)}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('formkrav.fremsattrettslig.label')}
                    verdi={
                        props.klage.fremsattRettsligKlageinteresse &&
                        formatMessage(props.klage.fremsattRettsligKlageinteresse)
                    }
                    retning={'vertikal'}
                />
            </div>

            {props.klage.begrunnelse && (
                <OppsummeringPar
                    label={formatMessage('formkrav.begrunnelse.label')}
                    verdi={props.klage.begrunnelse}
                    retning={'vertikal'}
                    className={styles.formkravBegrunnelse}
                />
            )}
        </div>
    );
};

export const VurderInfo = (props: { klage: Klage }) => {
    const { formatMessage } = useI18n({
        messages: { ...oppsummeringMessages, ...formkravMessages, ...vurderingMessages },
    });

    return (
        <div className={styles.informasjonsContainer}>
            <div className={styles.informasjonsContentContainer}>
                <OppsummeringPar
                    label={formatMessage('form.vurdering.label')}
                    verdi={formatMessage(props.klage.vedtaksvurdering!.type)}
                    retning={'vertikal'}
                />

                {erKlageOmgjort(props.klage) ? (
                    <>
                        <OppsummeringPar
                            label={formatMessage('form.omgjørVedtak.årsak.label')}
                            verdi={formatMessage(props.klage.vedtaksvurdering.omgjør.årsak)}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('label.årsaksutfall')}
                            verdi={formatMessage(props.klage.vedtaksvurdering.omgjør.utfall)}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('label.begrunnelse')}
                            verdi={props.klage.vedtaksvurdering.omgjør.begrunnelse}
                            retning={'vertikal'}
                        />
                    </>
                ) : erKlageOpprettholdt(props.klage) ? (
                    <div>
                        <Label>{formatMessage('form.opprettholdVedtak.hjemmel.label')}</Label>
                        <div className={styles.hjemlerContainer}>
                            {props.klage.vedtaksvurdering.oppretthold.hjemler.map((hjemel) => (
                                <BodyShort key={hjemel}>{formatMessage(hjemel)}</BodyShort>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default OppsummeringAvKlage;
