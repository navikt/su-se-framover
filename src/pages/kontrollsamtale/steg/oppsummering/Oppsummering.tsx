import { Textarea } from '@navikt/ds-react';
import { useNavigate, useParams } from 'react-router-dom';
import KontrollsamtaleOppsummering from 'src/pages/kontrollsamtale/steg/oppsummering/components/Kontrollsamtaleoppsummering/KontrollsamtaleOppsummering.tsx';
import { fritekstUpdated } from '~src/features/kontrollsamtale/kontrollsamtale.slice.ts';
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
    const { sakId } = useParams<{
        sakId: string;
    }>();

    const onSubmit = async () => {
        if (!sakId) {
            throw new Error('Mangler sakId');
        }

        if (
            kontrollsamtale.personligOppmøte === null ||
            (kontrollsamtale.personligOppmøte === false && kontrollsamtale.fullmaktOgLegeerklæring === null) ||
            kontrollsamtale.originalPass === null ||
            kontrollsamtale.gyldigPass === null ||
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
                sakId: sakId,
                personligOppmøte: kontrollsamtale.personligOppmøte,
                fullmaktOgLegeerklæring: kontrollsamtale.fullmaktOgLegeerklæring,
                originalPass: kontrollsamtale.originalPass,
                gyldigPass: kontrollsamtale.gyldigPass,
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
                fritekst: kontrollsamtale.fritekst?.trim() ? kontrollsamtale.fritekst.trim() : null,
            }),
        );

        if (sendKontrollsamtaleNotat.fulfilled.match(resultat)) {
            navigate(nesteUrl);
        }
    };
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
            className={sharedStyles.container}
        >
            <KontrollsamtaleOppsummering />
            <div style={{ marginTop: '2rem' }}>
                <Textarea
                    label="Kommentarer"
                    description={formatMessage('kommentar.label')}
                    value={kontrollsamtale.fritekst ?? ''}
                    onChange={(e) => {
                        dispatch(fritekstUpdated(e.target.value));
                    }}
                    minRows={5}
                />
            </div>
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
    );
};
export default Oppsummering;
