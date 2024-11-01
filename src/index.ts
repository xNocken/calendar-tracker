import { execSync } from 'child_process';
import fs from 'fs';
import fsp from 'fs/promises';

import env from './utils/env.js';
import getAuth from './utils/get-auth.js';
import killToken from './utils/kill-token.js';
import getCalendarTimeline from './utils/get-calendar-timeline.js';
import getFortniteProfile from './utils/get-fortnite-profile.js';
import getConditionalActionItemsFromResult from './utils/get-conditional-action-items-from-result.js';

const outputFolder = 'output';
const currentTimelineFile = `${outputFolder}/timeline.json`;
const latestTimelineFile = `${outputFolder}/timeline-latest.json`;
const conditionalActionsFile = `${outputFolder}/conditional-actions.json`;

const main = async () => {
  if (!fs.existsSync(outputFolder)) {
    await fsp.mkdir(outputFolder, { recursive: true });
  }

  const auth = await getAuth();
  const calendarTimeline = await getCalendarTimeline(auth);
  const athena = await getFortniteProfile(auth, 'athena');
  const campaign = await getFortniteProfile(auth, 'campaign');
  const conditionalActions = getConditionalActionItemsFromResult(athena)
    .concat(getConditionalActionItemsFromResult(campaign))
    .sort((a, b) => a.conditions.event.instanceId.localeCompare(b.conditions.event.eventName));

  if (calendarTimeline.success) {
    for (let i = 0; i < calendarTimeline.data.length; i += 1) {
      const state = calendarTimeline.data[i];

      for (let j = 0; j < state.additionalActiveEvents.length; j += 1) {
        const additionalEvent = state.additionalActiveEvents[j];
        const conditionalAction = conditionalActions
          .find((x) => x.conditions.event.eventName.trim() === additionalEvent.eventName.trim());

        additionalEvent.profileItem = conditionalAction || null;
      }
    }

    const currentTimeline = calendarTimeline.data[0];
    const latestTimeline = calendarTimeline.data[calendarTimeline.data.length - 1];

    await fsp.writeFile(currentTimelineFile, JSON.stringify(currentTimeline, null, 3));
    await fsp.writeFile(latestTimelineFile, JSON.stringify(latestTimeline, null, 3));
  }

  if (athena.success || campaign.success) {
    await fsp.writeFile(conditionalActionsFile, JSON.stringify(conditionalActions, null, 3));
  }

  await killToken(auth);

  const gitStatus = execSync(`git status ${outputFolder}/*`)?.toString('utf-8') || '';
  const changes: string[] = [];

  if (gitStatus.includes(currentTimelineFile)) {
    changes.push('Current');
  }

  if (gitStatus.includes(latestTimelineFile)) {
    changes.push('Latest');
  }

  if (gitStatus.includes(conditionalActionsFile)) {
    changes.push('Conditional Actions');
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
