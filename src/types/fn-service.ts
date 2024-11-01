export interface CalendarData {
  channels: Channels
  cacheIntervalMins: number
  currentTime: string
}

export interface Channels {
  "client-events": ClientEventsChannel
}

export interface ClientEventsChannel {
  states: ClientEventsChannelState[]
  cacheExpire: string
}

export interface ClientEventsChannelState {
  validFrom: string
  activeEvents: ActiveEvent[]
  state: ClientEventsChannelStateData
}

export interface ActiveEvent {
  eventType: string
  activeUntil: string
  activeSince: string
}

export interface ClientEventsChannelStateData {
  activeEvents: ActiveEventState[]
  seasonNumber: number
  seasonTemplateId: string
  seasonBegin: string
  seasonEnd: string
  seasonDisplayedEnd: string
}

export interface ActiveEventState {
  instanceId: string
  devName: string
  eventName: string
  eventStart: string
  eventEnd: string
  eventType: string
}

export interface ProfileResponseData {
  profileRevision: number
  profileId: string
  profileChangesBaseRevision: number
  profileChanges: ProfileChange[]
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
}

export interface ProfileChange {
  changeType: string
  profile: Profile
}

export interface Profile {
  _id: string
  created: string
  updated: string
  rvn: number
  wipeNumber: number
  accountId: string
  profileId: string
  version: string
  stats: Stats
  commandRevision: number
  items: Record<string, ItemTemplate>
}

export interface Stats {
  attributes: Record<string, unknown>
}

export interface ItemTemplate {
  templateId: string
  attributes: ItemTemplateAttributes
  quantity: number
}

export interface ItemTemplateAttributes {
  devName: string
  conditions: {
    event: {
      instanceId: string
      eventName: string
    }
  };

  [key: string]: unknown
}
