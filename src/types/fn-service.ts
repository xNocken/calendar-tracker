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
