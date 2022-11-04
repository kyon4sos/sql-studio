module.exports = {
  productName: 'SQL Studio',
  appId: 'neko.studio',
  asar: true,
  asarUnpack: '**\\*.{node,dll}',
  files: ['dist', 'node_modules', 'package.json'],
  afterSign: '.erb/scripts/notarize.js',
  mac: {
    target: {
      target: 'default',
      arch: ['arm64'],
    },
    type: 'distribution',
    hardenedRuntime: true,
    entitlements: 'assets/entitlements.mac.plist',
    entitlementsInherit: 'assets/entitlements.mac.plist',
    gatekeeperAssess: false,
  },
  dmg: {
    contents: [
      {
        x: 130,
        y: 220,
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications',
      },
    ],
  },
  win: {
    target: ['nsis'],
  },
  linux: {
    target: ['AppImage'],
    category: 'Development',
  },
  directories: {
    app: 'release/app',
    buildResources: 'assets',
    output: 'release/build',
  },
  extraResources: ['./assets/**'],
};
