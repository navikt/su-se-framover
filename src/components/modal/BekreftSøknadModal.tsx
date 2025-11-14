import { BodyLong, BodyShort, Button, Link, Modal } from '@navikt/ds-react';
import { JSX } from 'react';
import SkjemaelementFeilmelding from '~src/components/formElements/SkjemaelementFeilmelding.tsx';
import { useI18n } from '~src/lib/i18n.ts';
import styles from '~src/pages/søknad/steg/inngang/inngang.module.less';
import nb from '~src/pages/søknad/steg/inngang/inngang-nb.ts';

interface BekreftSKnadModal {
    visModal: boolean;
    setVisModal: (vis: boolean) => void;
    isFormValid: boolean;
    hasSubmitted: boolean;
    setHasSubmitted: (value: boolean) => void;
    erBekreftet: boolean;
    handleStartSøknadKlikk: () => void;
}

export const BekreftSøknadModal = ({
    visModal,
    setVisModal,
    isFormValid,
    hasSubmitted,
    setHasSubmitted,
    erBekreftet,
    handleStartSøknadKlikk,
}: BekreftSKnadModal): JSX.Element => {
    const { formatMessage } = useI18n({ messages: nb });
    return (
        <Modal
            open={visModal}
            onClose={() => setVisModal(false)}
            header={{
                heading: formatMessage('varsel.søknad.tittel'),
            }}
        >
            <Modal.Body>
                <div className={styles.modalContent}>
                    <BodyLong>{formatMessage('varsel.søknad.pt1')}</BodyLong>
                    <BodyShort>
                        {formatMessage('varsel.søknad.pt2', {
                            Strong: (tekst) => <strong>{tekst}</strong>,
                        })}
                        <Link
                            target="_blank"
                            href="https://navno.sharepoint.com/sites/fag-og-ytelser-regelverk-og-rutiner/SitePages/Supplerende%20st%C3%B8nad.aspx?web=1"
                        >
                            servicerutine
                        </Link>
                        {formatMessage('varsel.søknad.lenke')}
                        {hasSubmitted && !erBekreftet && (
                            <SkjemaelementFeilmelding>
                                {formatMessage('husk.feil.påkrevdfelt')}
                            </SkjemaelementFeilmelding>
                        )}
                    </BodyShort>
                    <div className={styles.sikkerKnapp}>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setHasSubmitted(true);

                                if (!isFormValid) {
                                    return;
                                }
                                setVisModal(false);

                                handleStartSøknadKlikk();
                            }}
                        >
                            ja , jeg er sikker
                        </Button>
                    </div>
                    <div className={styles.avbrytKnapp}>
                        <Button variant="secondary" onClick={() => setVisModal(false)}>
                            avbryt
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};
