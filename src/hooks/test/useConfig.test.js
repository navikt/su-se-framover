import { ConfigContext, ConfigProvider } from '../useConfig';
import React from 'react';
import { render } from '@testing-library/react';
import { useGet } from '../useGet';
import { useContext } from 'react';

jest.mock('../useGet');
useGet.mockReturnValue({ data: { en: 'json' }, isFetching: false });

test('fetch config', () => {
    const TestKomponent = () => {
        const config = useContext(ConfigContext);
        return <div>konfigurasjon: {config.en}</div>;
    };

    const tree = (
        <ConfigProvider>
            <TestKomponent />
        </ConfigProvider>
    );

    const { getByText } = render(tree);
    expect(getByText(/konfigurasjon/).textContent).toBe('konfigurasjon: json');
});
