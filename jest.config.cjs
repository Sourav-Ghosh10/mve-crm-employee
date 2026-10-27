module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    roots: ["<rootDir>/src"],
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
    moduleNameMapper: {
        "\\.(css|less|sass|scss)$": "identity-obj-proxy",
        "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/src/mocks/fileMock.ts",
        "\\.(mp4|webm)$": "<rootDir>/src/mocks/fileMock.ts",
        "^../../lib/utils$": "<rootDir>/src/lib/utils.ts",
        "^../../components/(.*)$": "<rootDir>/src/components/$1",
        "^@/(.*)$": "<rootDir>/src/$1",
        "^firebase/app$": "<rootDir>/src/mocks/firebaseMock.ts",
        "^firebase/auth$": "<rootDir>/src/mocks/firebaseMock.ts",
        ".*utils/env$": "<rootDir>/src/mocks/env.ts",
        ".*config/firebase$": "<rootDir>/src/mocks/firebaseConfigMock.ts",
        ".*pushNotificationService.*$": "<rootDir>/src/mocks/pushNotificationServiceMock.ts"
    },
    transform: {
        "^.+\\.tsx?$": ["ts-jest", {
            tsconfig: {
                target: "es5",
                lib: ["dom", "dom.iterable", "esnext"],
                allowJs: true,
                skipLibCheck: true,
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                strict: true,
                forceConsistentCasingInFileNames: true,
                noFallthroughCasesInSwitch: true,
                module: "commonjs",
                moduleResolution: "node",
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                jsx: "react-jsx"
            }
        }]
    },
};
