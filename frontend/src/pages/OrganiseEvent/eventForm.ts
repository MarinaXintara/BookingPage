export interface EventFormData {
  title: string;
  category: string;
  eventType: string;
  venue: string;
  address: string;
  city: string;
  country: string;
  startDateTime: string;
  endDateTime: string;
  capacity: string;
  description: string;
}

export type EventStatus = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";

export const emptyEventFormData: EventFormData = {
  title: "",
  category: "",
  eventType: "",
  venue: "",
  address: "",
  city: "",
  country: "",
  startDateTime: "",
  endDateTime: "",
  capacity: "1",
  description: "",
};

export function getScheduleError(startDateTime: string, endDateTime: string) {
  if (new Date(endDateTime) <= new Date(startDateTime)) {
    return "End time must be after the start time.";
  }

  return null;
}
