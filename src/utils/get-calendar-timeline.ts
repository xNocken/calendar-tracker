import type { AuthData } from '../types/account-service.js';
import type { CalendarData } from '../types/fn-service.js';

const festivalSongsPrefix = 'PilgrimSong.';

export default async (auth: AuthData) => {
  const res = await fetch(
    'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/calendar/v1/timeline',
    {
      headers: {
        Authorization: `${auth.token_type} ${auth.access_token}`,
      },
    },
  );

  const contentType = res.headers.get('content-type');

  if (!res.ok || !contentType?.startsWith('application/json')) {
    console.log('failed fetching calendar timeline data', res.status, res.statusText, await res.text());

    return {
      success: false as const,
    };
  }

  const data = <CalendarData>(await res.json());
  const clientEventsChannel = data?.channels?.['client-events'];

  if (!clientEventsChannel) {
    console.log('failed to find client events channel', res.status, res.statusText, data);

    return {
      success: false as const,
    };
  }

  return {
    success: true as const,
    data: clientEventsChannel.states.map(({ state, activeEvents = [] }) => ({
      season: {
        seasonNumber: state.seasonNumber ?? null,
        seasonTemplateId: state.seasonTemplateId || null,
        seasonBegin: state.seasonBegin || null,
        seasonEnd: state.seasonBegin || null,
        seasonDisplayedEnd: state.seasonDisplayedEnd || null,
      },
      activeEvents: activeEvents
        .filter((x) => !x.eventType.startsWith(festivalSongsPrefix))
        .sort((a, b) => a.eventType.localeCompare(b.eventType)),
      additionalActiveEvents: (state.activeEvents || [])
        .filter((x) => !x.eventType.startsWith(festivalSongsPrefix))
        .sort((a, b) => a.eventType.localeCompare(b.eventType)),
    })),
  };
};
