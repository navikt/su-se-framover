import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, BodyShort, Button, HelpText, Label, Loader } from '@navikt/ds-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FritekstTyper, hentFritekst, redigerFritekst } from '~src/api/fritekstApi.ts';
import * as pdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import TextareaWithAutosave from '~src/components/inputs/textareaWithAutosave/TextareaWithAutosave.tsx';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as klageActions from '~src/features/klage/klageActions';
import { useApiCall, useAsyncActionCreator, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import yup from '~src/lib/validering';
import { Klage, KlageStatus, KlageSteg } from '~src/types/Klage';
import { erKlageAvvist } from '~src/utils/klage/klageUtils';
import sharedStyles from '../klage.module.less';
import styles from './avvistKlage.module.less';
import messages from './avvistKlage-nb';

interface AvvistKlageFormData {
    fritekst: string;
}

const schema = yup.object<AvvistKlageFormData>({
    fritekst: yup.string().required(),
});

const AvvistKlage = (props: { sakId: string; klage: Klage }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const [lagreFritekstStatus, lagreFritekst] = useApiCall(redigerFritekst);

    const [fritekstLagreStatus, fritekstLagre] = useAsyncActionCreator(klageActions.lagreAvvistFritekst);
    const [sendTilAttesteringStatus, sendTilAttestering] = useAsyncActionCreator(klageActions.sendTilAttestering);
    const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi.hentBrevutkastForKlage);

    const { handleSubmit, control, getValues, watch, setValue } = useForm<AvvistKlageFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            fritekst: '',
        },
    });
    const handleOnLagre = (fritekstTilBrev: string) => {
        fritekstLagre({ sakId: props.sakId, klageId: props.klage.id, fritekstTilBrev: fritekstTilBrev }, () => {
            navigate(
                Routes.saksoversiktValgtSak.createURL({
                    sakId: props.sakId,
                }),
            );
        });
    };

    const handleBekreftOgFortsettSubmit = (data: AvvistKlageFormData) => {
        fritekstLagre({ sakId: props.sakId, klageId: props.klage.id, fritekstTilBrev: data.fritekst }, () => {
            sendTilAttestering({ sakId: props.sakId, klageId: props.klage.id }, () => {
                Routes.navigateToSakIntroWithMessage(
                    navigate,
                    formatMessage('avvistKlage.sendtTilAttestering'),
                    props.sakId,
                );
            });
        });
    };

    useEffect(() => {
        hentFritekst({
            referanseId: props.klage.id,
            sakId: props.sakId,
            type: FritekstTyper.VEDTAKSBREV_KLAGE,
        }).then((result) => {
            if (result.status === 'ok' && result.data) {
                setValue('fritekst', result.data.fritekst);
            }
        });
    }, [props.klage.id, props.sakId, setValue]);

    const iGyldigStatusForÅAvvise = (k: Klage) =>
        k.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET_AVVIST || erKlageAvvist(k);

    if (!iGyldigStatusForÅAvvise(props.klage)) {
        return (
            <div className={sharedStyles.feilTilstandContainer}>
                <Alert variant="error">{formatMessage('feil.ikkeRiktigTilstandForÅVurdere')}</Alert>
                <Link
                    to={Routes.klage.createURL({
                        sakId: props.sakId,
                        klageId: props.klage.id,
                        steg: KlageSteg.Formkrav,
                    })}
                >
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>
        );
    }

    return (
        <ToKolonner tittel={formatMessage('avvistKlage.tittel')}>
            {{
                left: (
                    <form onSubmit={handleSubmit(handleBekreftOgFortsettSubmit)}>
                        <Label className={styles.resultatLabel}>{formatMessage('avvistKlage.resultat')}</Label>
                        <div className={styles.fritesktOgVisBrevContainer}>
                            <TextareaWithAutosave
                                textarea={{
                                    name: 'fritekst',
                                    label: (
                                        <div className={styles.fritekstLabelOgHjelpeTekstContainer}>
                                            <Label>{formatMessage('avvistKlage.brevTilBruker')}</Label>
                                            <HelpText>
                                                {/*Er mulig Folka fra designsystemet tillatter rikt innhold da noen har hatt et issue med det  */}
                                                {/*@ts-ignore */}
                                                <Label className={styles.hjelpetekst}>
                                                    {formatMessage('avvistKlage.brevTilBruker.hjelpetekst')}
                                                </Label>
                                            </HelpText>
                                        </div>
                                    ),
                                    control: control,
                                    value: watch('fritekst') ?? '',
                                }}
                                save={{
                                    handleSave: () => {
                                        lagreFritekst({
                                            referanseId: props.klage.id,
                                            sakId: props.sakId,
                                            type: FritekstTyper.VEDTAKSBREV_KLAGE,
                                            fritekst: watch('fritekst') ?? '',
                                        });
                                    },
                                    status: lagreFritekstStatus,
                                }}
                                brev={{
                                    handleSeBrev: () =>
                                        hentBrev({
                                            sakId: props.sakId,
                                            klageId: props.klage.id,
                                        }),
                                    status: brevStatus,
                                }}
                            />
                            {RemoteData.isFailure(brevStatus) && <ApiErrorAlert error={brevStatus.error} />}
                        </div>
                        <div className={styles.knapperContainer}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleOnLagre(getValues('fritekst'))}
                            >
                                {formatMessage('knapp.lagre')}
                                {RemoteData.isPending(fritekstLagreStatus) && <Loader />}
                            </Button>
                            <Button>
                                {formatMessage('knapp.sendTilAttestering')}
                                {RemoteData.isPending(sendTilAttesteringStatus) && <Loader />}
                            </Button>
                            <LinkAsButton
                                variant="secondary"
                                href={Routes.klage.createURL({
                                    sakId: props.sakId,
                                    klageId: props.klage.id,
                                    steg: KlageSteg.Formkrav,
                                })}
                            >
                                {formatMessage('knapp.tilbake')}
                            </LinkAsButton>
                        </div>
                        {RemoteData.isFailure(fritekstLagreStatus) && (
                            <ApiErrorAlert error={fritekstLagreStatus.error} />
                        )}
                        {RemoteData.isFailure(sendTilAttesteringStatus) && (
                            <ApiErrorAlert error={sendTilAttesteringStatus.error} />
                        )}
                    </form>
                ),
                right: props.klage.begrunnelse ? (
                    <InformasjonTilAttestant formkravBegrunnelse={props.klage.begrunnelse} />
                ) : null,
            }}
        </ToKolonner>
    );
};

const InformasjonTilAttestant = (props: { formkravBegrunnelse: string }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div>
            <Label>{formatMessage('avvistKlage.infoTilAttestant')}</Label>
            <BodyShort className={styles.formkravBegrunnelse}>{props.formkravBegrunnelse}</BodyShort>
        </div>
    );
};

export default AvvistKlage;
