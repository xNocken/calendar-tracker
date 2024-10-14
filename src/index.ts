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
  execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
  execSync('git config user.name "github-actions[bot]"');
  execSync('git config commit.gpgsign false');
  execSync(`git commit -m "${commitMessage}"`);

  if (env.GIT_DO_NOT_PUSH?.toLowerCase() === 'true') {
    return;
  }

  execSync('git push');
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
