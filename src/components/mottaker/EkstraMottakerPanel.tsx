import { Alert } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { Brevtype, hentMottaker, MottakerResponse, ReferanseType } from '~src/api/mottakerClient.ts';
import { MottakerAlert, toMottakerAlert } from '~src/components/mottaker/mottakerUtils';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { useI18n } from '~src/lib/i18n';
import styles from './EkstraMottakerPanel.module.less';
import messages from './EkstraMottakerPanel-nb';

const formatMottakerAdresse = (adresse: MottakerResponse['adresse']) => {
    const adresseLinjer = [
        adresse.adresselinje1,
        adresse.adresselinje2 ?? undefined,
        adresse.adresselinje3 ?? undefined,
    ].filter(Boolean);
    const postadresse = [adresse.postnummer, adresse.poststed].filter(Boolean).join(' ');
    if (postadresse) {
        adresseLinjer.push(postadresse);
    }
    return adresseLinjer.join(', ');
};

interface Props {
    sakId: string;
    referanseId: string;
    referanseType: ReferanseType;
    brevtype: Brevtype;
    tittel?: string;
}

export const EkstraMottakerPanel = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const [mottaker, setMottaker] = useState<MottakerResponse | null>(null);
    const [feil, setFeil] = useState<MottakerAlert | null>(null);
    const manglerReferanseId = !props.referanseId;

    useEffect(() => {
        if (manglerReferanseId) {
            setMottaker(null);
            setFeil(null);
            return;
        }

        setMottaker(null);
        setFeil(null);

        const hentEkstraMottaker = async () => {
            const res = await hentMottaker(props.sakId, props.referanseType, props.referanseId, props.brevtype);

            if (res.status === 'ok') {
                setMottaker(res.data ?? null);
                return;
            }

            if (res.error.statusCode === 404) {
                setMottaker(null);
                return;
            }

            setMottaker(null);
            setFeil(toMottakerAlert(res.error, formatMessage('feilmelding.kanIkkeHenteMottaker')));
        };

        void hentEkstraMottaker();
    }, [props.referanseId, props.referanseType, props.brevtype]);

    if (manglerReferanseId) {
        return (
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Email}
                farge={Oppsummeringsfarge.Grønn}
                tittel={props.tittel ?? formatMessage('ekstramottaker.tittel')}
            >
                <Alert variant="warning">{formatMessage('ekstramottaker.manglerReferanseId')}</Alert>
            </Oppsummeringspanel>
        );
    }

    if (!mottaker && !feil) {
        return null;
    }

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Email}
            farge={Oppsummeringsfarge.Grønn}
            tittel={props.tittel ?? formatMessage('ekstramottaker.tittel')}
        >
            {feil && <Alert variant={feil.variant}>{feil.text}</Alert>}
            {mottaker && (
                <div className={styles.container}>
                    <OppsummeringPar
                        label={formatMessage('ekstramottaker.navn')}
                        verdi={mottaker.navn}
                        retning="vertikal"
                    />
                    {mottaker.foedselsnummer && (
                        <OppsummeringPar
                            label={formatMessage('ekstramottaker.fnr')}
                            verdi={mottaker.foedselsnummer}
                            retning="vertikal"
                        />
                    )}
                    {mottaker.orgnummer && (
                        <OppsummeringPar
                            label={formatMessage('ekstramottaker.orgnr')}
                            verdi={mottaker.orgnummer}
                            retning="vertikal"
                        />
                    )}
                    <OppsummeringPar
                        className={styles.adresse}
                        label={formatMessage('ekstramottaker.adresse')}
                        verdi={formatMottakerAdresse(mottaker.adresse)}
                        retning="vertikal"
                    />
                </div>
            )}
        </Oppsummeringspanel>
    );
};

export default EkstraMottakerPanel;
