import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Heading } from '@navikt/ds-react';
import { startOfTomorrow } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';

import * as kontrollsamtaleApi from '~src/api/kontrollsamtaleApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { DatePicker } from '~src/components/inputs/datePicker/DatePicker';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useApiCall } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { navigateToSakIntroWithMessage } from '~src/lib/routes';
import { toIsoMonth } from '~src/utils/date/dateUtils';

import HentOgVisKontrollsamtaler from './HentOgVisKontrollsamtaler';
import styles from './kontrollsamtalePage.module.less';
import { OpprettNyKontrollsamtaleFormData, opprettNyKontrollsamtaleSchema } from './KontrollsamtaleUtils';

const KontrollsamtalePage = () => {
    const props = useOutletContext<SaksoversiktContext>();

    return (
        <div className={styles.pageContainer}>
            <div className={styles.headingContainer}>
                <Heading className={styles.kontrollsamtaleHeading} size="large">
                    Kontrollsamtale
                </Heading>
            </div>
            <div className={styles.mainContentContainer}>
                <OpprettNyKontrollsamtale sakId={props.sak.id} />
                <HentOgVisKontrollsamtaler sakId={props.sak.id} />
            </div>
        </div>
    );
};

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
        >
            <form className={styles.opprettNyKontrollsamtaleFormContainer} onSubmit={form.handleSubmit(onSubmit)}>
                <Controller
                    control={form.control}
                    name={'nyKontrollsamtaleDato'}
                    render={({ field, fieldState }) => (
                        <DatePicker
                            label={'Velg dato for ny kontrollsamtale'}
                            fromDate={startOfTomorrow()}
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

export default KontrollsamtalePage;
