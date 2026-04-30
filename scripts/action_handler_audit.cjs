const fs = require('fs');

const source = fs.readFileSync('main.ts', 'utf8');
const actions = [...source.matchAll(/data-action=\"([^\"]+)\"/g)]
  .map((m) => m[1])
  .filter((action) => action && !action.includes('${'));
const actionSet = [...new Set(actions)].sort();

const handlerCases = [...source.matchAll(/case\s+'([^']+)'\s*:/g)].map((m) => m[1]);
const handlerSet = new Set(handlerCases);

const allowedNoHandler = new Set([
  'ignore',
  'calc-set-area',
  'change-site-bg-color',
  'theme-update',
  'send-chat',
  'upload-luxury-related-image',
  'upload-package-room-image',
  'upload-portfolio-image',
  'upload-portfolio-video',
  'upload-showroom-media'
]);
const missingHandlers = actionSet.filter((action) => !handlerSet.has(action) && !allowedNoHandler.has(action));

console.log(`data-action unique count: ${actionSet.length}`);
console.log(`click handler case count: ${new Set(handlerCases).size}`);
console.log(`missing handlers: ${missingHandlers.length}`);
if (missingHandlers.length) {
  console.log(missingHandlers.join('\n'));
  process.exit(1);
}
