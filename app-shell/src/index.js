const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const checkPermissions = require('./middlewares/check-permissions');
const modifyPath = require('./middlewares/modify-path');
const VCS = require('./services/vcs');

const executorRoutes = require('./routes/executor');
const vcsRoutes = require('./routes/vcs');

// Function to initialize the Git repository
function initRepo() {
    const projectId = '33592';
    return VCS.initRepo(projectId);
}

// Start the Express app on APP_SHELL_PORT (4000)
function startServer() {
    const PORT = 4000;
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
}

// Run Git check after the server is up
function runGitCheck() {
    initRepo()
      .then(result => {
          console.log(result?.message ? result.message : result);
          // Here you can add additional logic if needed
      })
      .catch(err => {
          console.error('Error during repo initialization:', err);
          // Optionally exit the process if Git check is critical:
          // process.exit(1);
      });
}

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(checkPermissions);
app.use(modifyPath);

app.use('/executor', executorRoutes);
app.use('/vcs', vcsRoutes);

// Start the app_shell server
startServer();

// Now perform Git check
runGitCheck();

module.exports = app;
