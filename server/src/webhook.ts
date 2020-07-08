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

handler.on('pull_request', function (event) {
  const repository = event.payload.repository.name;
  const action = event.payload.action;

  console.log('Received a Pull Request for %s to %s', repository, action);

  if (repository === REPO_NAME && action === 'closed') {
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
