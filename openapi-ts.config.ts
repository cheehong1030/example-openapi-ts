import { defaultPlugins, defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: 'http://localhost/api/swagger/openapi.json',
    output: {
        format: 'prettier',
        lint: 'eslint',
        path: './src/client',
    },
    plugins: [
        ...defaultPlugins,
        {
            bundle: true,
            name: '@hey-api/client-axios',
            // runtimeConfigPath: './src/requestSetting.ts',
        },
        {
            enums: 'typescript',
            name: '@hey-api/typescript',
        },
        {
            name: '@hey-api/schemas',
            type: 'json',
        },
        {
            asClass: true,
            serviceNameBuilder: '{{name}}',
            name: '@hey-api/sdk',
        },
        '@hey-api/sdk',
        '@tanstack/react-query',
    ],
});
