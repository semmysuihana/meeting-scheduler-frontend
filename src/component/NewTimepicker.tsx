import { DateTime } from "luxon";
import type {
  BlackoutInput,
  ConvertedBlackoutMeeting,
} from "../types/meeting";


export default function NewTimepicker() {
    function NewConvertBlackoutToUserRange(
      blackouts: BlackoutInput[],
      userTz: string,
      organizerTz: string
    ): ConvertedBlackoutMeeting[] {
      return blackouts.map(item => {
        let startOrg, endOrg;
    
        if (typeof item === "string") {
          startOrg = DateTime.fromISO(item, { zone: organizerTz }).startOf("day");
          endOrg   = DateTime.fromISO(item, { zone: organizerTz }).endOf("day");
        } else if (typeof item === "object" && item.start && item.end) {
          startOrg = DateTime.fromISO(item.start, { zone: organizerTz });
          endOrg   = DateTime.fromISO(item.end, { zone: organizerTz });
        }
    
        const startUser = startOrg.setZone(userTz);
        const endUser   = endOrg.setZone(userTz);
    
        return {
          dayLabel: startUser.toFormat("cccc"),
          startUser,
          endUser,
          startISO: startUser.toISO(),
          endISO: endUser.toISO(),
          startDate: startUser.toFormat("yyyy-MM-dd HH:mm"),
          endDate: endUser.toFormat("yyyy-MM-dd HH:mm"),
        };
      });
    }
    return {NewConvertBlackoutToUserRange}
}