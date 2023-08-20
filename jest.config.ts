module.exports = {
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    transform: { '^.+\\.ts?$': 'ts-jest', '^.+\\.tsx?$': 'ts-jest' },
    testEnvironment: 'node',
    testRegex: '\\.(test|spec)\\.(ts|tsx)?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    silent: true,
};
