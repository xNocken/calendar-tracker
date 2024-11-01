import getFortniteProfile from "./get-fortnite-profile";

export default (profileResult: Awaited<ReturnType<typeof getFortniteProfile>>) => {
  if (!profileResult.success) {
    return [];
  }

  return Object
    .values(profileResult.profile.items)
    .filter((x) => x.templateId === 'ConditionalAction:generic_instance')
    .map(({ attributes }) => ({
      profileId: profileResult.profile.profileId,
      devName: attributes.devName,
      conditions: attributes.conditions,
    }));
}
