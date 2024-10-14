import type { AuthData } from '../types/account-service.js';
import type { CalendarData } from '../types/fn-service.js';

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
      success: false,
    };
  }

  const data = <CalendarData>(await res.json());
  const clientEventsChannel = data?.channels?.['client-events'];

  if (!clientEventsChannel) {
    console.log('failed to find client events channel', res.status, res.statusText, data);

    return {
      success: false,
    };
  }

  const currentClientEventsState = clientEventsChannel.states?.[0];

  if (!currentClientEventsState) {
    console.log('failed to find current client events channel state', res.status, res.statusText, clientEventsChannel);

    return {
      success: false,
    };
  }

  const { state, activeEvents = [] } = currentClientEventsState;

  const result = {
    season: {
      seasonNumber: state.seasonNumber ?? null,
      seasonTemplateId: state.seasonTemplateId || null,
      seasonBegin: state.seasonBegin || null,
      seasonEnd: state.seasonBegin || null,
      seasonDisplayedEnd: state.seasonDisplayedEnd || null,
    },
    activeEvents: activeEvents.sort((a, b) => a.eventType.localeCompare(b.eventType)),
    additionalActiveEvents: (state.activeEvents || []).sort((a, b) => a.eventType.localeCompare(b.eventType)),
  };

  return {
    success: true,
    data: result,
  };
};
