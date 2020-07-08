import * as http from 'http';
import * as shell from 'shelljs';
const createHandler = require('github-webhook-handler');

const {WEBHOOK_SECRET} = process.env;
const REPO_NAME = 'my_repo';
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
    shell.exec('git pull');
    shell.exec('yarn install production');
    shell.cd('server');
    shell.exec('yarn run build');
    shell.exec('pm2 restart lancer');

    // assumes initially started as:
    //  pm2 start dist/server.js --name lancer
  }
});
