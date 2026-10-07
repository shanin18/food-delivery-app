// Workaround for https://github.com/expo/expo/issues/49378 in Expo Router 57.
// Remove after the upstream linking initialization fix is included in our SDK.
const fs = require('node:fs');
const path = require('node:path');

const root = path.dirname(require.resolve('expo-router/package.json'));
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
if (!version.startsWith('57.')) throw new Error('Review the Expo Router initial-link patch before upgrading SDKs.');
const file = path.join(root, 'build/fork/NavigationContainer.js');
let source = fs.readFileSync(file, 'utf8');
const marker = '// food-delivery: defer initial linking updates until commit';
if (source.includes(marker)) {
  console.log('Expo Router initial-link patch already applied.');
} else {
  const anchor = '    const [lastUnhandledLink, setLastUnhandledLink] = react_1.default.useState();';
  const callback = '    }, setLastUnhandledLink);';
  if (!source.includes(anchor) || !source.includes(callback)) throw new Error('Expo Router linking code changed. Review the startup patch.');
  const patch = `${anchor}
    ${marker}
    const linkingLifecycle = react_1.default.useRef({ mounted: false, disposed: false, pending: undefined, hasPending: false });
    react_1.default.useEffect(() => {
        const lifecycle = linkingLifecycle.current;
        lifecycle.mounted = true;
        lifecycle.disposed = false;
        if (lifecycle.hasPending) {
            lifecycle.hasPending = false;
            setLastUnhandledLink(lifecycle.pending);
            lifecycle.pending = undefined;
        }
        return () => { lifecycle.mounted = false; lifecycle.disposed = true; };
    }, []);
    const handleUnhandledLink = react_1.default.useCallback((value) => {
        const lifecycle = linkingLifecycle.current;
        if (lifecycle.disposed) return;
        if (lifecycle.mounted) setLastUnhandledLink(value);
        else { lifecycle.pending = value; lifecycle.hasPending = true; }
    }, []);`;
  source = source.replace(anchor, patch).replace(callback, '    }, handleUnhandledLink);');
  fs.writeFileSync(file, source);
  console.log('Applied Expo Router initial-link mount patch.');
}
