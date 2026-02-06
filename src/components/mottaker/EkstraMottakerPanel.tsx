import { Alert } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { hentMottaker, MottakerResponse, ReferanseType } from '~src/api/mottakerClient.ts';
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
    tittel?: string;
    className?: string;
}

export const EkstraMottakerPanel = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const [mottaker, setMottaker] = useState<MottakerResponse | null>(null);
    const [feil, setFeil] = useState<string | null>(null);

    useEffect(() => {
        if (!props.referanseId) {
            setMottaker(null);
            setFeil(null);
            return;
        }

        let isMounted = true;
        setMottaker(null);
        setFeil(null);

        const hentEkstraMottaker = async () => {
            const res = await hentMottaker(props.sakId, props.referanseType, props.referanseId);

            if (!isMounted) return;

            if (res.status === 'ok') {
                setMottaker(res.data ?? null);
                return;
            }

            if (res.error.statusCode === 404) {
                setMottaker(null);
                return;
            }

            setMottaker(null);
            setFeil(res.error.body?.message ?? formatMessage('feilmelding.kanIkkeHenteMottaker'));
        };

        hentEkstraMottaker();

        return () => {
            isMounted = false;
        };
    }, [formatMessage, props.referanseId, props.referanseType, props.sakId]);

    if (!mottaker && !feil) {
        return null;
    }

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Email}
            farge={Oppsummeringsfarge.Grønn}
            tittel={props.tittel ?? formatMessage('ekstramottaker.tittel')}
            className={props.className}
        >
            {feil && <Alert variant="error">{feil}</Alert>}
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
