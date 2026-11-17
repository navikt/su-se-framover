import * as RemoteData from '@devexperts/remote-data-ts';
import { RadioGroup } from '@navikt/ds-react';
import { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

import { AttesteringsForm, Beslutning } from './AttesteringsForm';

jest.mock('@navikt/ds-react', () => {
    const aksel = jest.requireActual<typeof import('@navikt/ds-react')>('@navikt/ds-react');
    return {
        ...aksel,
        RadioGroup: jest.fn((props: ComponentProps<typeof RadioGroup>) => <aksel.RadioGroup {...props} />),
    };
});

const props: ComponentProps<typeof AttesteringsForm> = {
    behandlingsId: 'behandling-test',
    sakId: 'sak-test',
    behandlingstype: 'SØKNAD',
    redigerbartBrev: false,
    iverksett: { fn: jest.fn(), status: RemoteData.initial },
    underkjenn: { fn: jest.fn(), status: RemoteData.initial, underkjennelsesgrunner: [] },
};

describe('AttesteringsForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('melder fra om endret beslutning uten å iverksette eller underkjenne', () => {
        const onBeslutningChange = jest.fn();
        renderToStaticMarkup(
            <MemoryRouter>
                <AttesteringsForm {...props} onBeslutningChange={onBeslutningChange} />
            </MemoryRouter>,
        );

        const radioProps = jest.mocked(RadioGroup).mock.calls[0][0];
        expect(radioProps.value).toBe('');
        expect(onBeslutningChange).not.toHaveBeenCalled();

        radioProps.onChange?.(Beslutning.UNDERKJENN);
        radioProps.onChange?.(Beslutning.IVERKSETT);

        expect(onBeslutningChange.mock.calls).toEqual([[Beslutning.UNDERKJENN], [Beslutning.IVERKSETT]]);
        expect(props.iverksett.fn).not.toHaveBeenCalled();
        expect(props.underkjenn.fn).not.toHaveBeenCalled();
    });

    it('beholder radiovalget brukbart uten en beslutningscallback', () => {
        renderToStaticMarkup(
            <MemoryRouter>
                <AttesteringsForm {...props} />
            </MemoryRouter>,
        );

        const radioProps = jest.mocked(RadioGroup).mock.calls[0][0];
        expect(() => radioProps.onChange?.(Beslutning.IVERKSETT)).not.toThrow();
    });
});
