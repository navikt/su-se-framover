import { Button, Modal } from '@navikt/ds-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KontrollsamtaleOppsummering from 'src/pages/kontrollsamtale/steg/oppsummering/components/Kontrollsamtaleoppsummering/KontrollsamtaleOppsummering.tsx';
import { sendKontrollsamtaleNotat } from '~src/features/søknad/innsending.slice.ts';
import { useI18n } from '~src/lib/i18n.ts';
import messages from '~src/pages/kontrollsamtale/steg/oppsummering/oppsummering-nb.ts';
import Bunnknapper from '~src/pages/søknad/bunnknapper/Bunnknapper.tsx';
import sharedStyles from '~src/pages/søknad/steg-shared.module.less';
import { useAppDispatch, useAppSelector } from '~src/redux/Store.ts';

type Props = {
    forrigeUrl: string;
    nesteUrl: string;
    avbrytUrl: string;
};

const Oppsummering = ({ forrigeUrl, nesteUrl, avbrytUrl }: Props) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages } });
    const dispatch = useAppDispatch();
    const kontrollsamtale = useAppSelector((state) => state.kontrollsamtale);
    const [visModal, setModal] = useState(false);

    const onSubmit = async () => {
        if (
            kontrollsamtale.personligOppmøte === null ||
            kontrollsamtale.fullmaktOgLegeerklæring === null ||
            kontrollsamtale.originalPass === null ||
            kontrollsamtale.harVærtUtenlands === null ||
            kontrollsamtale.harPlanerOmUtenlandsreise === null ||
            kontrollsamtale.reisedokumentasjon === null ||
            kontrollsamtale.økonomiskSituasjon === null ||
            kontrollsamtale.andreForhold === null ||
            kontrollsamtale.skatteOpplysninger === null
        ) {
            return;
        }

        const resultat = await dispatch(
            sendKontrollsamtaleNotat({
                personligOppmøte: kontrollsamtale.personligOppmøte,
                fullmaktOgLegeerklæring: kontrollsamtale.fullmaktOgLegeerklæring,
                originalPass: kontrollsamtale.originalPass,
                harVærtUtenlands: kontrollsamtale.harVærtUtenlands,
                utenlandsoppholdDatoer: kontrollsamtale.utenlandsoppholdDatoer.map((dato) => ({
                    utreiseDato: dato.utreisedato,
                    innreiseDato: dato.innreisedato,
                })),
                harPlanerOmUtenlandsreise: kontrollsamtale.harPlanerOmUtenlandsreise,
                planlagteUtenlandsreiseDatoer: kontrollsamtale.planlagteUtenlandsreiseDatoer.map((dato) => ({
                    utreiseDato: dato.utreisedato,
                    innreiseDato: dato.innreisedato,
                })),
                reiseDokumentasjon: kontrollsamtale.reisedokumentasjon,
                økonomiskSituasjon: kontrollsamtale.økonomiskSituasjon,
                andreForhold: kontrollsamtale.andreForhold,
                skatteOpplysninger: kontrollsamtale.skatteOpplysninger,
            }),
        );

        //Todo: Midlertidig visning med modal, skal endres i annen pr
        if (sendKontrollsamtaleNotat.fulfilled.match(resultat)) {
            setModal(true);
        }
    };
    return (
        <>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit();
                }}
                className={sharedStyles.container}
            >
                <KontrollsamtaleOppsummering />
                <div style={{ marginTop: '2rem' }}>
                    <Bunnknapper
                        previous={{
                            onClick: () => {
                                navigate(forrigeUrl);
                            },
                        }}
                        next={{
                            label: formatMessage('sendInnSkjema'),
                        }}
                        avbryt={{
                            toRoute: avbrytUrl,
                        }}
                    />
                </div>
            </form>
            <Modal
                open={visModal}
                onClose={() => {
                    setModal(false);
                    navigate(nesteUrl);
                }}
                header={{
                    heading: 'Skjemaet er lagret',
                }}
            >
                <Modal.Body>Kontrollsamtalenotatet er lagret.</Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => {
                            setModal(false);
                            navigate(nesteUrl);
                        }}
                    >
                        Ok
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
export default Oppsummering;
