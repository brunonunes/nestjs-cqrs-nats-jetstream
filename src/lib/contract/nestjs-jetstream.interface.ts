export interface IEventStoreMessage {
  subjectPrefix: string
  created: Date
  eventId: string
  eventNumber?: number
  eventType: string
  eventData: object
}
