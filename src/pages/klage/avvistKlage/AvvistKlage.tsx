import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, BodyShort, Button, HelpText, Label, Textarea, Loader } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import * as pdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as klageActions from '~src/features/klage/klageActions';
import { useAsyncActionCreator, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import yup from '~src/lib/validering';
import { KlageSteg } from '~src/pages/saksbehandling/types';
import { Klage, KlageStatus } from '~src/types/Klage';
import { erKlageAvvist } from '~src/utils/klage/klageUtils';

import * as sharedStyles from '../klage.module.less';

import messages from './avvistKlage-nb';
import * as styles from './avvistKlage.module.less';

interface AvvistKlageFormData {
    fritekstTilBrev: string;
}

const schema = yup.object<AvvistKlageFormData>({
    fritekstTilBrev: yup.string().required(),
});

const AvvistKlage = (props: { sakId: string; klage: Klage }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const [lagreFritekstStatus, lagreFritekst] = useAsyncActionCreator(klageActions.lagreAvvistFritekst);
    const [sendTilAttesteringStatus, sendTilAttestering] = useAsyncActionCreator(klageActions.sendTilAttestering);
    const [brevStatus, hentBrev] = useBrevForhåndsvisning(pdfApi.hentBrevutkastForKlage);

    const { handleSubmit, control, getValues } = useForm<AvvistKlageFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            fritekstTilBrev: props.klage.fritekstTilBrev ?? '',
        },
    });

    const onSeBrevClick = (fritekstTilBrev: string) => {
        lagreFritekst({ sakId: props.sakId, klageId: props.klage.id, fritekstTilBrev: fritekstTilBrev }, () => {
            hentBrev({ sakId: props.sakId, klageId: props.klage.id });
        });
    };

    const handleOnLagre = (fritekstTilBrev: string) => {
        lagreFritekst({ sakId: props.sakId, klageId: props.klage.id, fritekstTilBrev: fritekstTilBrev }, () => {
            navigate(
                Routes.saksoversiktValgtSak.createURL({
                    sakId: props.sakId,
                })
            );
        });
    };

    const handleBekreftOgFortsettSubmit = (data: AvvistKlageFormData) => {
        lagreFritekst({ sakId: props.sakId, klageId: props.klage.id, fritekstTilBrev: data.fritekstTilBrev }, () => {
            sendTilAttestering({ sakId: props.sakId, klageId: props.klage.id }, () => {
                navigate(Routes.createSakIntroLocation(formatMessage('avvistKlage.sendtTilAttestering'), props.sakId));
            });
        });
    };

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
                            <Controller
                                control={control}
                                name={'fritekstTilBrev'}
                                render={({ field, fieldState }) => (
                                    <Textarea
                                        {...field}
                                        label={
                                            <div className={styles.fritekstLabelOgHjelpeTekstContainer}>
                                                <Label>{formatMessage('avvistKlage.brevTilBruker')}</Label>
                                                <HelpText>
                                                    <Label className={styles.hjelpetekst}>
                                                        {formatMessage('avvistKlage.brevTilBruker.hjelpetekst')}
                                                    </Label>
                                                </HelpText>
                                            </div>
                                        }
                                        value={field.value}
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />
                            <Button
                                className={styles.seBrevKnapp}
                                type="button"
                                variant="secondary"
                                loading={RemoteData.isPending(brevStatus)}
                                onClick={() => onSeBrevClick(getValues('fritekstTilBrev'))}
                            >
                                {formatMessage('knapp.seBrev')}
                            </Button>
                            {RemoteData.isFailure(brevStatus) && <ApiErrorAlert error={brevStatus.error} />}
                        </div>
                        <div className={styles.knapperContainer}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleOnLagre(getValues('fritekstTilBrev'))}
                            >
                                {formatMessage('knapp.lagre')}
                                {RemoteData.isPending(lagreFritekstStatus) && <Loader />}
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
                        {RemoteData.isFailure(lagreFritekstStatus) && (
                            <ApiErrorAlert error={lagreFritekstStatus.error} />
                        )}
                        {RemoteData.isFailure(sendTilAttesteringStatus) && (
                            <ApiErrorAlert error={sendTilAttesteringStatus.error} />
                        )}
                    </form>
                ),
                //Begrunnelse finnes når man har vært gjennom formkravene
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                right: <InformasjonTilAttestant formkravBegrunnelse={props.klage.begrunnelse!} />,
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
