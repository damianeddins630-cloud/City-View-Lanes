import type { League } from "./types";

/**
 * Starter rows from the CityView Fall Season 2026-2027 printed menu.
 * Add / edit the rest in Admin → League Manager so every line matches the flyer.
 */
export const FALL_LEAGUES_SEED: League[] = [
  {
    id: "lg_fall_young_at_heart",
    day: "Mon",
    time: "1:00 PM",
    name: "Young At Heart",
    type: "Senior",
    teamSize: "4",
    startDate: "09/14/26",
    meetingInfo: "See center for meeting",
    createdAt: "2026-07-18T00:00:00.000Z",
  },
  {
    id: "lg_fall_monday_nite_mixers",
    day: "Mon",
    time: "6:30 PM",
    name: "Monday Nite Mixers",
    type: "Adult",
    teamSize: "4",
    startDate: "09/14/26",
    meetingInfo: "See center for meeting",
    createdAt: "2026-07-18T00:00:00.000Z",
  },
  {
    id: "lg_fall_cecil_baker",
    day: "Tues",
    time: "6:30 PM",
    name: "Cecil Baker",
    type: "Adult",
    teamSize: "4",
    startDate: "09/15/26",
    meetingInfo: "See center for meeting",
    createdAt: "2026-07-18T00:00:00.000Z",
  },
  {
    id: "lg_fall_happy_rollers",
    day: "Tues",
    time: "1:00 PM",
    name: "Happy Rollers",
    type: "Senior",
    teamSize: "3",
    startDate: "09/15/26",
    meetingInfo: "See center for meeting",
    createdAt: "2026-07-18T00:00:00.000Z",
  },
  {
    id: "lg_fall_youth_saturday",
    day: "Sat",
    time: "10:00 AM",
    name: "CityView Youth League",
    type: "Youth",
    teamSize: "4",
    startDate: "09/12/26",
    meetingInfo: "Parents meeting — see front desk",
    createdAt: "2026-07-18T00:00:00.000Z",
  },
  {
    id: "lg_fall_youth_sunday",
    day: "Sun",
    time: "1:00 PM",
    name: "Junior Scratch Practice",
    type: "Youth",
    teamSize: "Open",
    startDate: "09/13/26",
    meetingInfo: "Ask for youth coach",
    createdAt: "2026-07-18T00:00:00.000Z",
  },
];
