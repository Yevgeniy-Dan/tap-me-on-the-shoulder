import { Moment } from "moment";

export interface IAppCalendarEvent {
  id: string;
  summary: string;
  startDateTime: Moment;
}
