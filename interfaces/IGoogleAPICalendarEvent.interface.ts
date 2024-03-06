export interface IGoogleAPICalendarEvent {
  id: string;
  summary: string;
  status: "confirmed" | "tentative" | "cancelled";
  start: {
    date?: string;
    dateTime?: string;
    timeZone: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone: string;
  };
}
