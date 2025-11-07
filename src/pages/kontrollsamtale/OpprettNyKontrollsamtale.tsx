import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { BodyShort, Button } from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import * as kontrollsamtaleApi from '~src/api/kontrollsamtaleApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { MonthPicker } from '~src/components/inputs/datePicker/DatePicker';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { useApiCall } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { navigateToSakIntroWithMessage } from '~src/lib/routes';
import { toIsoMonth } from '~src/utils/date/dateUtils';

import styles from './OpprettKontrollsamtale.module.less';
import { OpprettNyKontrollsamtaleFormData, opprettNyKontrollsamtaleSchema } from './OpprettKontrollsamtaleUtils';

const OpprettNyKontrollsamtale = (props: { sakId: string }) => {
    const navigate = useNavigate();
    const [status, opprett] = useApiCall(kontrollsamtaleApi.opprettNyKontrollsamtale);

    const form = useForm<OpprettNyKontrollsamtaleFormData>({
        defaultValues: {
            nyKontrollsamtaleDato: null,
        },
        resolver: yupResolver(opprettNyKontrollsamtaleSchema),
    });

    const onSubmit = (values: OpprettNyKontrollsamtaleFormData) => {
        opprett({ sakId: props.sakId, innkallingsmåned: toIsoMonth(values.nyKontrollsamtaleDato!) }, () => {
            navigateToSakIntroWithMessage(navigate, 'Ny kontrollsamtale har blitt opprettet', props.sakId);
        });
    };

    return (
        <Oppsummeringspanel
            ikon={Oppsummeringsikon.Blyant}
            farge={Oppsummeringsfarge.Grønn}
            tittel={'Opprett ny kontrollsamtale'}
            className={styles.panelContainer}
        >
            <form className={styles.opprettNyKontrollsamtaleFormContainer} onSubmit={form.handleSubmit(onSubmit)}>
                <Controller
                    control={form.control}
                    name={'nyKontrollsamtaleDato'}
                    render={({ field, fieldState }) => (
                        <MonthPicker
                            label={'Velg dato for ny kontrollsamtale'}
                            hjelpetekst={
                                <div>
                                    <BodyShort>
                                        Innkallingsdatoen må være innenfor ytterpunktene av en eller flere
                                        stønadsperioder. I tillegg, må den tidligst være neste måned
                                    </BodyShort>
                                    <br />
                                    <BodyShort>
                                        Innkallingsdatoen må også være i en aktiv måned (ikke opphørt, stanset, etc.)
                                    </BodyShort>
                                </div>
                            }
                            fromDate={(() => {
                                const today = new Date();
                                return new Date(today.getFullYear(), today.getMonth() + 1, 1);
                            })()}
                            error={fieldState.error?.message}
                            onChange={field.onChange}
                            value={field.value}
                        />
                    )}
                />

                {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                <div className={styles.buttonsContainer}>
                    <LinkAsButton
                        variant="secondary"
                        href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                    >
                        Tilbake
                    </LinkAsButton>
                    <Button>Opprett ny kontrollsamtale</Button>
                </div>
            </form>
        </Oppsummeringspanel>
    );
};

export default OpprettNyKontrollsamtale;
