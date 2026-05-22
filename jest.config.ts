import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

// Wrap to override transformIgnorePatterns so ESM-only packages are transpiled
const makeConfig = createJestConfig(config)

export default async () => {
  const jestConfig = await (makeConfig as () => Promise<Config>)()
  return {
    ...jestConfig,
    transformIgnorePatterns: [
      '/node_modules/(?!(next-intl|use-intl|intl-messageformat|@formatjs)/).*/',
      '^.+\\.module\\.(css|sass|scss)$',
    ],
  }
}
