import type { AuthData } from '../types/account-service.js';
import type { ProfileResponseData } from '../types/fn-service.js';

// decrease profile responses
const dataOmissionGroups = [
  'Locker',
  'Quest',
];

export default async (auth: AuthData, profileId: string) => {
  const query = new URLSearchParams({
    dataOmissionGroups,
    profileId,
    rvn: '-1',
  });

  const res = await fetch(
    `https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/game/v2/profile/${auth.account_id}/client/QueryProfile?${query}`,
    {
      method: 'POST',
      headers: {
        Authorization: `${auth.token_type} ${auth.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // every profile operation requires a json object, even if there are no parameters for the operation (;
      }),
    },
  );

  const contentType = res.headers.get('content-type');

  if (!res.ok || !contentType?.startsWith('application/json')) {
    console.log(`failed fetching profile '${profileId}'`, res.status, res.statusText, await res.text());

    return {
      success: false as const,
    };
  }

  const data = <ProfileResponseData>(await res.json());
  const profile = (data?.profileChanges || [])
    .find((x) => x.changeType === 'fullProfileUpdate' && x.profile?.profileId === profileId)?.profile;

  if (!profile) {
    console.log(`failed to find profile '${profileId}'`, res.status, res.statusText, data);

    return {
      success: false as const,
    };
  }

  return {
    success: true as const,
    profile,
  };
};
