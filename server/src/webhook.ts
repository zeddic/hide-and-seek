import * as http from 'http';
import * as shell from 'shelljs';
const createHandler = require('github-webhook-handler');

const {WEBHOOK_SECRET} = process.env;
const REPO_NAME = 'lancer';
const PORT = process.env.PORT || 6767;

const handler = createHandler({path: '/', secret: WEBHOOK_SECRET});

http
  .createServer(function (req, res) {
    handler(req, res, () => {
      res.statusCode = 404;
      res.end('no such location');
    });
  })
  .listen(PORT);

handler.on('error', function (err) {
  console.error('Error:', err.message);
});

handler.on('push', function (event) {
  const repository = event.payload.repository.name;
  const ref = event.payload.ref;

  console.log('Received a Push Request for %s to %s', repository, ref);

  if (repository === REPO_NAME) {
    shell.cd('~/lancer');
    exec('git reset --hard');
    exec('git pull');
    exec('yarn install --production');

    // Build client
    shell.cd('client');
    exec('yarn run build');
    exec('cp -r build/. ~/public_html/lancer');
    shell.cd('../');

    // Build server
    shell.cd('server');
    exec('yarn run build');

    // Restart server
    // Assumes initially started as:
    // pm2 start dist/server.js --name lancer
    exec('pm2 restart lancer');

    // Restart webhook (must go last!)
    exec('pm2 restart lancer-webhook');
  }
});

function exec(command: string) {
  console.log(`> ${command}`);
  shell.exec(command);
}

console.log(`Webhook running on port ${PORT}...`);
