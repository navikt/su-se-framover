import * as RemoteData from '@devexperts/remote-data-ts';
import { Button } from '@navikt/ds-react';
import classNames from 'classnames';

import * as PdfApi from '~src/api/pdfApi';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Sakstype } from '~src/types/Sak.ts';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { formatDate } from '~src/utils/date/dateUtils';
import { formatPeriode } from '~src/utils/periode/periodeUtils';
import { søknadMottatt } from '~src/utils/søknad/søknadUtils';

import ApiErrorAlert from '../../apiErrorAlert/ApiErrorAlert';
import UnderkjenteAttesteringer from '../../underkjenteAttesteringer/UnderkjenteAttesteringer';
import UføreVarsler from '../OppsummeringAvAldersvurdering/OppsummeringAvAldersvurdering';
import OppsummeringAvBeregningOgSimulering from '../oppsummeringAvBeregningOgsimulering/OppsummeringAvBeregningOgSimulering';
import { OppsummeringPar } from '../oppsummeringpar/OppsummeringPar';
import Oppsummeringspanel, { Oppsummeringsfarge, Oppsummeringsikon } from '../oppsummeringspanel/Oppsummeringspanel';
import SidestiltOppsummeringAvVilkårOgGrunnlag from '../sidestiltOppsummeringAvVilkårOgGrunnlag/SidestiltOppsummeringAvVilkårOgGrunnlag';

import messages from './OppsummeringAvSøknadsbehandling-nb';
import styles from './OppsummeringAvSøknadsbehandling.module.less';

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
                <div className={classNames({ [styles.headerContainer]: underkjenteAttesteringer.length > 0 })}>
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
                        {props.behandling.omgjøringsårsak && props.behandling.omgjøringsgrunn && (
                            <>
                                <OppsummeringPar
                                    label={formatMessage('label.årsak')}
                                    verdi={formatMessage(props.behandling.omgjøringsårsak)}
                                    retning={'vertikal'}
                                />
                                <OppsummeringPar
                                    label={formatMessage('label.omgjøring')}
                                    verdi={formatMessage(props.behandling.omgjøringsgrunn)}
                                    retning={'vertikal'}
                                />
                            </>
                        )}
                    </div>

                    {props.medBrevutkast && (
                        <div className={styles.brevContainer}>
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() =>
                                    hentBrevutkast(
                                        { sakId: props.medBrevutkast!.sakId, behandlingId: props.behandling.id },
                                        (b: Blob) => window.open(URL.createObjectURL(b)),
                                    )
                                }
                                loading={RemoteData.isPending(hentBrevutkastStatus)}
                            >
                                {formatMessage('knapp.vis')}
                            </Button>
                            {RemoteData.isFailure(hentBrevutkastStatus) && (
                                <ApiErrorAlert error={hentBrevutkastStatus.error} />
                            )}
                        </div>
                    )}
                    {underkjenteAttesteringer.length > 0 && (
                        <div className={styles.underkjenteAttesteringerContainer}>
                            <UnderkjenteAttesteringer attesteringer={props.behandling.attesteringer} />
                        </div>
                    )}
                    {props.behandling.aldersvurdering && props.behandling.sakstype === Sakstype.Uføre && (
                        <UføreVarsler a={props.behandling.aldersvurdering} />
                    )}
                </div>

                <div className={styles.sidestiltOppsummeringContainer}>
                    <SidestiltOppsummeringAvVilkårOgGrunnlag
                        grunnlagsdataOgVilkårsvurderinger={props.behandling.grunnlagsdataOgVilkårsvurderinger}
                        visesSidestiltMed={props.behandling.søknad.søknadInnhold}
                        eksterneGrunnlag={props.behandling.eksterneGrunnlag}
                        sakstype={props.behandling.sakstype}
                    />
                </div>
            </Oppsummeringspanel>

            <OppsummeringAvBeregningOgSimulering
                eksterngrunnlagSkatt={props.behandling.eksterneGrunnlag.skatt}
                beregning={props.behandling.beregning}
                simulering={props.behandling.simulering}
            />
        </div>
    );
};

export default OppsummeringAvSøknadsbehandling;
