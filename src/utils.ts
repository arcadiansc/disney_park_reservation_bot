import inquirer from "inquirer";
import { IChoice, IPark } from "./interfaces";
import fs from 'fs';
import moment from "moment";

export const loginUrl: string = "https://disneyworld.disney.go.com/login/";

function getCorrectDateFormat(date: any) {
  return moment(new Date(date)).format('YYYY-MM-DD')
}
export const PARKS: IPark[] = [
  { id: "80007944", name: "Magic Kingdom" },
  { id: "80007838", name: "Epcot" },
  { id: "80007998", name: "Hollywood Studios" },
  { id: "80007823", name: "Animal Kingdom" },
];

export const refreshTokenUrl: string =
  "https://disneyworld.disney.go.com/authentication/get-client-token/";

export function formCheckReservationsUrl(
  guests: string[],
  date: string,
  parkId: string,
  segmentId: string
): string {
  let guestString = createGuestString(guests);
  return `https://disneyworld.disney.go.com/vas/api/v1/availability/dates/${getCorrectDateFormat(date)}/parks/${parkId}/reservations/${segmentId}?guestXids=${guestString}&conflictingEntitlementIds=&replacementEntitlementIds=`;
}

export function formCheckOfferUrl(offerId: string): string {
  return `https://disneyworld.disney.go.com/vas/api/v1/offers/${offerId}`;
}

export function formAcceptOfferUrl(userId: string): string {
  return `https://disneyworld.disney.go.com/vas/api/v1/park-reservation/users/%7B${userId}%7D/entitlements`;
}

export function formGetSegmentUrl(
  guests: string[],
  date: string,
  parkId: string
) {
  let guestString = createGuestString(guests);

  return `https://disneyworld.disney.go.com/vas/api/v1/park-reservation/eligibility/dates/${getCorrectDateFormat(date)}/parks/${parkId}/segments?guestXids=${guestString}`;
}


export const availableDatesUrl: string =
  "https://disneyworld.disney.go.com/vas/api/v1/park-reservation/eligibility/dates";

export function createGuestUrl(userId: string): string {
  return `https://disneyworld.disney.go.com/vas/api/v1/park-reservation/users/%7B${userId}%7D/guests`;
}

function createGuestString(guests: string[]): string {
  let guestString = "";
  for (let i = 0; i < guests.length; i++) {
    if (i !== 0) {
      guestString += ",";
    }
    guestString += guests[i];
  }

  return guestString;
}

export function getParksUrl(date: string, guests: string[]): string {
  let guestString = createGuestString(guests);
  return `https://disneyworld.disney.go.com/vas/api/v1/park-reservation/availability/dates/${getCorrectDateFormat(date)}/parks?guestXids=${guestString}`;
}

// https://disneyworld.disney.go.com/vas/api/v1/park-reservation/availability/dates/2021-06-22/parks?guestXids=F92D07DD-AF51-867D-DB0F-88C473006FFF,1C86E7DC-48C4-BE9A-2687-17AF22BB0B5E

export async function selectOptions(
  message: string,
  choices: IChoice[],
  name: string
): Promise<string[]> {
  const answer = await inquirer.prompt(
    [
      {
        type: "checkbox",
        name,
        message,
        choices,
      },
    ],
    function (answers: any) {
      // console.log("answers: ", answers);
    }
  );

  return answer[name];
}

export function cacheTokens(email: string, accessToken: string, refreshToken: string, userId: string) {
  const cacheString = accessToken + "|" + refreshToken + "|" + userId;
  try {
    fs.writeFileSync("./tokens/" + email, cacheString);
  } catch(e) {
    console.log("Please make a tokens directory in the root of this project to continue");
    throw e;
  }
}

export function checkForCachedTokens(email: string): {accessToken: string, refreshToken: string, userId: string} | boolean {
  try {
    const tokens = fs.readFileSync("./tokens/" + email, "utf8");
    if (!tokens) throw new Error("No tokens were cached");
    const [accessToken, refreshToken, userId] = tokens.split('|');
    return { accessToken, refreshToken, userId };
  } catch(e) {
    return false;
  }
}
