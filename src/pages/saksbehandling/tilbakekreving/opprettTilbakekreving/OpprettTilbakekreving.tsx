import * as RemoteData from '@devexperts/remote-data-ts';
import { Box, Button, Heading } from '@navikt/ds-react';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import OppsummeringAvKravgrunnlag from '~src/components/oppsummering/kravgrunnlag/OppsummeringAvKravgrunnlag';
import { opprettNyTilbakekrevingsbehandling } from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { Kravgrunnlag } from '~src/types/Kravgrunnlag';
import { TilbakekrevingSteg } from '~src/types/ManuellTilbakekrevingsbehandling';

import messages from '../Tilbakekreving-nb';

import styles from './OpprettTilbakekreving.module.less';

const OpprettTilbakekreving = (props: {
    sakId: string;
    sakVersjon: number;
    uteståendeKravgrunnlag: Nullable<Kravgrunnlag>;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headingContainer}>
                <Heading className={styles.tilbakekrevingHeading} size="large">
                    {formatMessage('tilbakekreving.tittel')}
                </Heading>
            </div>

            <div className={styles.mainContentContainer}>
                <KanTilbakekreves
                    sakId={props.sakId}
                    saksversjon={props.sakVersjon}
                    kravgrunnlag={props.uteståendeKravgrunnlag}
                />
            </div>
        </div>
    );
};
//TODO:
//kommenterer ut annuller siden vi må prodsette noen endringer. Funksjonaliteten fungerer ikke i backend enda heller
// const AnnullerTilbakekrevingModal = (props: {
//     sakId: string;
//     kravgrunnlagHendelseId: string;
//     saksversjon: number;
//     åpen: boolean;
//     onClose: () => void;
// }) => {
//     const navigate = useNavigate();
//     const [annullerStatus, annullerKravgtunnlag] = useAsyncActionCreator(annullerKravgrunnlag);

//     return (
//         <Modal open={props.åpen} onClose={props.onClose} header={{ heading: 'Annullering av kravgrunnlag' }}>
//             <Modal.Body>
//                 <VStack gap="2">
//                     <BodyShort>Er du sikker på at kravgrunnlaget skal bli annullert?</BodyShort>
//                     {RemoteData.isFailure(annullerStatus) && <ApiErrorAlert error={annullerStatus.error} />}
//                 </VStack>
//             </Modal.Body>
//             <Modal.Footer>
//                 <Button
//                     loading={RemoteData.isPending(annullerStatus)}
//                     variant="danger"
//                     onClick={() => {
//                         annullerKravgtunnlag(
//                             {
//                                 sakId: props.sakId,
//                                 versjon: props.saksversjon,
//                                 kravgrunnlagHendelseId: props.kravgrunnlagHendelseId,
//                             },
//                             () => {
//                                 navigateToSakIntroWithMessage(
//                                     navigate,
//                                     'Kravgrunnlaget er blitt annullert.',
//                                     props.sakId,
//                                 );
//                             },
//                         );
//                     }}
//                 >
//                     Ja, annuller
//                 </Button>
//                 <Button variant="secondary" onClick={props.onClose}>
//                     Nei, avbryt
//                 </Button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

const KanTilbakekreves = (props: { sakId: string; saksversjon: number; kravgrunnlag: Nullable<Kravgrunnlag> }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    //kommenterer ut annuller siden vi må prodsette noen endringer. Funksjonaliteten fungerer ikke i backend enda heller
    // const [vilAnnulere, setVilAnnulere] = useState<boolean>(false);
    const [opprettStatus, opprett] = useAsyncActionCreator(opprettNyTilbakekrevingsbehandling);

    return (
        <>
            {/* {vilAnnulere && (
                <AnnullerTilbakekrevingModal
                    åpen={vilAnnulere}
                    onClose={() => setVilAnnulere(false)}
                    kravgrunnlagHendelseId={props.kravgrunnlag.hendelseId}
                    sakId={props.sakId}
                    saksversjon={props.saksversjon}
                />
            )} */}
            <Box
                background={'bg-default'}
                padding="4"
                borderWidth="1"
                borderRadius="small"
                className={styles.panelContentContainer}
            >
                {props.kravgrunnlag ? (
                    <div>
                        <Heading size="medium">{formatMessage('opprettelse.kanTilbakekreves.heading')}</Heading>
                        <Heading size="small">{formatMessage('opprettelse.kanTilbakekreves.text')}</Heading>
                    </div>
                ) : (
                    <div>
                        <Heading size="medium">{formatMessage('opprettelse.utenKravrunnlag.heading')}</Heading>
                        <Heading size="small">{formatMessage('opprettelse.utenKravrunnlag.text')}</Heading>
                    </div>
                )}

                <div className={styles.knappContainer}>
                    {/* <Button variant="secondary" onClick={() => setVilAnnulere(true)}>
                        Annuler
                    </Button> */}
                    <Button
                        loading={RemoteData.isPending(opprettStatus)}
                        onClick={() =>
                            opprett({ sakId: props.sakId, versjon: props.saksversjon }, (res) => {
                                navigate(
                                    routes.tilbakekrevingValgtBehandling.createURL({
                                        sakId: props.sakId,
                                        behandlingId: res.id,
                                        steg: TilbakekrevingSteg.Forhåndsvarsling,
                                    }),
                                );
                            })
                        }
                    >
                        {formatMessage('opprettelse.kanTilbakekreves.ny')}
                    </Button>
                    <LinkAsButton
                        variant="tertiary"
                        href={routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                    >
                        {formatMessage('knapp.tilbake')}
                    </LinkAsButton>
                </div>
                {RemoteData.isFailure(opprettStatus) && <ApiErrorAlert error={opprettStatus.error} />}
            </Box>
            <OppsummeringAvKravgrunnlag kravgrunnlag={props.kravgrunnlag} medPanel={{}} />
        </>
    );
};

export default OpprettTilbakekreving;
