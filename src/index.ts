import { execSync } from 'child_process';
import fs from 'fs';
import fsp from 'fs/promises';

import env from './utils/env.js';
import getAuth from './utils/get-auth.js';
import killToken from './utils/kill-token.js';
import getCalendarTimeline from './utils/get-calendar-timeline.js';

const outputFolder = 'output';
const timelineFile = `${outputFolder}/timeline.json`;

const main = async () => {
  if (!fs.existsSync(outputFolder)) {
    await fsp.mkdir(outputFolder, { recursive: true });
  }

  const auth = await getAuth();
  const calendarTimeline = await getCalendarTimeline(auth);

  if (calendarTimeline.success) {
    await fsp.writeFile(timelineFile, JSON.stringify(calendarTimeline.data, null, 3));
  }

  await killToken(auth);

  const gitStatus = execSync(`git status ${timelineFile}`)?.toString('utf-8') || '';
  const changes: string[] = [];

  if (gitStatus.includes(timelineFile)) {
    changes.push('Calendar Timeline');
  }

  if (!changes.length) {
    return;
  }

  const commitMessage = `Modified ${changes.join(', ')}`

  console.log(commitMessage);

  if (env.GIT_DO_NOT_COMMIT?.toLowerCase() === 'true') {
    return;
  }

  execSync('git add output');
  execSync(`git commit --no-gpg-sign -m "${commitMessage}"`, {
    env: {
      GIT_AUTHOR_NAME: "GitHub Actions",
      GIT_AUTHOR_EMAIL: `github-actions@github.com`,
      GIT_COMMITTER_NAME: "GitHub Actions",
      GIT_COMMITTER_EMAIL: `github-actions@github.com`
    }
  });

  if (env.GIT_DO_NOT_PUSH?.toLowerCase() === 'true') {
    return;
  }

  execSync('git push');
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
