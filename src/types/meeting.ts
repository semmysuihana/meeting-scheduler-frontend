import { DateTime } from "luxon";

export type LuxonDateTime = InstanceType<typeof DateTime>;

/* ---------------------------
   WORKING HOURS (Format Internal)
---------------------------- */
export interface WorkingHour {
  start: string;
  end: string;
}

export interface WorkingHoursMap {
  [day: string]: WorkingHour;
}

/* ---------------------------
   BLACKOUT (Internal Format)
---------------------------- */
export interface BlackoutRange {
  id?: number;
  start: string;
  end: string;
}

/* ---------------------------
   BLACKOUT RESULT (Timepicker)
---------------------------- */
export interface ConvertedBlackoutMeeting {
  dayLabel: string;               // ← dipakai oleh FormData & Timepicker
  startUser: LuxonDateTime;
  endUser: LuxonDateTime;
  startISO?: string;              // ← tambahan opsional (biar tidak error)
  endISO?: string;
  startDate?: string;
  endDate?: string;
}

/* ---------------------------
   MEETING DETAIL (Internal)
---------------------------- */
export interface MeetingDetail {
  id: number;
  name: string;
  timezone: string;

  meeting_duration: number;
  buffer_before: number;
  buffer_after: number;
  min_notice_minutes: number;

  working_hours: WorkingHoursMap;  
  blackouts: BlackoutRange[];      
}

/* ---------------------------
   MEETING SIMPLE (API Original)
   (TIDAK DIHAPUS)
---------------------------- */
export interface MeetingSimple {
  id: number;
  name: string;
  timezone: string;
  meeting_duration: number;
  buffer_before: number;
  buffer_after: number;
  min_notice_minutes: number;

  working_hours: Record<string, string>;
  blackouts: string[];
}

/* ---------------------------
   HANDLE DAY LABEL OUTPUT
   (Kompatibel getTimeOption)
---------------------------- */
export interface WorkingHourItem {
  dayLabel: string;
  hours: string;   // "09:00-17:00"
}

/* ---------------------------
   FORM PROPS
---------------------------- */
export type HandleDayLabelFn = (
  fromTz: string,
  toTz: string,
  workingHours: Record<string, string>
) => WorkingHourItem[];

export type GetTimeOptionFn = (
  dayName: string,
  workingHours: WorkingHourItem[],    // ← sesuai Timepicker
  meetingDuration: number,
  bufferBefore: number,
  bufferAfter: number,
  minNoticeMinutes: number,
  selectedDate: LuxonDateTime
) => string[];

export type IsTimeOverlapFn = (
  aStart: LuxonDateTime,
  aEnd: LuxonDateTime,
  bStart: LuxonDateTime,
  bEnd: LuxonDateTime
) => boolean;

export type GetSelectedTimeRangeFn = (
  date: Date,
  time: string,
  timezone: string
) => { start: LuxonDateTime; end: LuxonDateTime } | null;

/* FORM DATA PROPS */
export interface FormDataProps {
  meeting: MeetingDetail;
  tzOption: string[];
  timezones: string;
  handleDayLabel: HandleDayLabelFn;
  getSelectedTimeRange: GetSelectedTimeRangeFn;
  isTimeOverlap: IsTimeOverlapFn;
}

export interface BlackoutInput {
  start: string;
  end: string;
}


