import * as RemoteData from '@devexperts/remote-data-ts';
import { Button } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';

import * as PdfApi from '~src/api/pdfApi';
import BeregningOgSimulering from '~src/components/beregningOgSimulering/BeregningOgSimulering';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { formatDate, formatPeriode } from '~src/utils/date/dateUtils';
import { søknadMottatt } from '~src/utils/søknad/søknadUtils';

import ApiErrorAlert from '../../apiErrorAlert/ApiErrorAlert';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '../../revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import UnderkjenteAttesteringer from '../../underkjenteAttesteringer/UnderkjenteAttesteringer';
import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import SidestiltOppsummeringAvVilkårOgGrunnlag from '../sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag';

import messages from './OppsummeringAvSøknadsbehandling-nb';
import * as styles from './OppsummeringAvSøknadsbehandling.module.less';

const OppsummeringAvSøknadsbehandling = (props: {
    behandling: Søknadsbehandling;
    medBrevutkast?: { sakId: string };
}) => {
    const { formatMessage } = useI18n({ messages });
    const [hentBrevutkastStatus, hentBrevutkast] = useApiCall(PdfApi.fetchBrevutkastForSøknadsbehandling);
    const underkjenteAttesteringer = props.behandling.attesteringer.filter((att) => att.underkjennelse != null);

    return (
        <div className={styles.oppsummeringsContainer}>
            <Oppsummeringspanel
                ikon={Oppsummeringsikon.Liste}
                farge={Oppsummeringsfarge.Lilla}
                tittel={formatMessage('oppsummering.søknadsbehandling')}
            >
                <div
                    className={classNames({
                        [styles.headerContainer]: underkjenteAttesteringer.length > 0,
                    })}
                >
                    <div className={styles.tilleggsinfoContainer}>
                        <OppsummeringPar
                            label={formatMessage('vurdering.tittel')}
                            verdi={formatMessage(props.behandling.status)}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('behandlet.av')}
                            verdi={props.behandling.saksbehandler ?? formatMessage('feil.fantIkkeSaksbehandlerNavn')}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('behandling.søknadsdato')}
                            verdi={søknadMottatt(props.behandling.søknad)}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('behandling.saksbehandlingStartet')}
                            verdi={formatDate(props.behandling.opprettet)}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('virkningstidspunkt.tittel')}
                            verdi={formatPeriode(props.behandling.stønadsperiode!.periode)}
                            retning={'vertikal'}
                        />
                    </div>
                    {underkjenteAttesteringer.length > 0 && (
                        <UnderkjenteAttesteringer attesteringer={props.behandling.attesteringer} />
                    )}
                </div>

                <div className={styles.sidestiltOppsummeringContainer}>
                    <SidestiltOppsummeringAvVilkårOgGrunnlag
                        grunnlagsdataOgVilkårsvurderinger={props.behandling.grunnlagsdataOgVilkårsvurderinger}
                        visesSidestiltMed={props.behandling.søknad.søknadInnhold}
                    />
                </div>
            </Oppsummeringspanel>

            <BeregningOgSimulering beregning={props.behandling.beregning} simulering={props.behandling.simulering} />
            {props.medBrevutkast && (
                <>
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() =>
                            hentBrevutkast(
                                { sakId: props.medBrevutkast!.sakId, behandlingId: props.behandling.id },
                                (b: Blob) => window.open(URL.createObjectURL(b))
                            )
                        }
                        loading={RemoteData.isPending(hentBrevutkastStatus)}
                    >
                        {formatMessage('knapp.vis')}
                    </Button>
                    {RemoteData.isFailure(hentBrevutkastStatus) && <ApiErrorAlert error={hentBrevutkastStatus.error} />}
                </>
            )}
        </div>
    );
};

export default OppsummeringAvSøknadsbehandling;
