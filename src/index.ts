import { execSync } from 'child_process';
import fs from 'fs';
import fsp from 'fs/promises';

import env from './utils/env.js';
import getAuth from './utils/get-auth.js';
import killToken from './utils/kill-token.js';
import getCalendarTimeline from './utils/get-calendar-timeline.js';

const outputFolder = 'output';
const currentTimelineFile = `${outputFolder}/timeline.json`;
const latestTimelineFile = `${outputFolder}/timeline-latest.json`;

const main = async () => {
  if (!fs.existsSync(outputFolder)) {
    await fsp.mkdir(outputFolder, { recursive: true });
  }

  const auth = await getAuth();
  const calendarTimeline = await getCalendarTimeline(auth);

  if (calendarTimeline.success) {
    const currentTimeline = calendarTimeline.data[0];
    const latestTimeline = calendarTimeline.data[calendarTimeline.data.length - 1];

    await fsp.writeFile(currentTimelineFile, JSON.stringify(currentTimeline, null, 3));
    await fsp.writeFile(latestTimelineFile, JSON.stringify(latestTimeline, null, 3));
  }

  await killToken(auth);

  const gitStatus = execSync(`git status ${outputFolder}/*`)?.toString('utf-8') || '';
  const changes: string[] = [];

  if (gitStatus.includes(currentTimelineFile)) {
    changes.push('Current Calendar Timeline');
  }

  if (gitStatus.includes(latestTimelineFile)) {
    changes.push('Latest Calendar Timeline');
  }

  if (!changes.length) {
    return;
  }

  const commitMessage = `Modified ${changes.join(', ')}`;

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
