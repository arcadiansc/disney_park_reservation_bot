import dotEnv from "dotenv";
dotEnv.config();
import apiClass from "./api";
import { ISessionAndCSRF, IGuest, IApiOptions } from "./interfaces";
import Puppeteer from "./Puppeteer";
import {checkForCachedTokens, loginUrl} from "./utils";
import {log} from "util";

async function validateTokens(
  accessToken: string,
  userId: string
): Promise<boolean> {
  const API = new apiClass({
    email: "",
    password: "",
    date: "",
    accessToken,
    refreshToken: "",
    userId
  });
  try {
    await API.getGuests();
    return true;
  } catch(e) {
    return false;
  }
}

function isValidDateFormat(date: string) {
  const isMatch = date.match(/....-..-../);
  return Boolean(isMatch);
}

async function main(): Promise<void> {
  const email: string | undefined = process.env.email;
  const password: string | undefined = process.env.password;
  const date: string | undefined = process.env.date;

  if (email === undefined || password === undefined) {
    throw new Error("Email or password not set in .env file");
  }

  if (date === undefined) {
    throw new Error("No date passed");
  }

  if (!isValidDateFormat(date)) {
    throw new Error("The date was passed in an incorrect format. Please pass the date like this YYYY-MM-DD");
  }


  const puppet = new Puppeteer(email, password);
  let accessToken = "";
  let refreshToken = "";
  let userId = "";

  try {
    const tokensCached = checkForCachedTokens(email);
    console.log("tokensCached: ", tokensCached);

    let getNewTokens = true;

    if (tokensCached && typeof tokensCached === 'object') {
      const validToken = await  validateTokens(tokensCached.accessToken, tokensCached.userId.replace(/\n/g, ''));


      if (validToken) {
        console.log("isValidToken: ", validToken);
        accessToken = tokensCached.accessToken;
        refreshToken = tokensCached.refreshToken;
        userId = tokensCached.userId;
        getNewTokens = false;
      }

    }

   if (getNewTokens) {
      const newTokens = await puppet.start(loginUrl);
      accessToken = newTokens.accessToken;
      refreshToken = newTokens.refreshToken;
      userId = newTokens.userId;
    }


    const API = new apiClass({ email, password, date, accessToken, refreshToken, userId });
    await API.getAvailableDates();
    await API.getGuests();
    await API.askForGuestsToUse();
    await API.checkForParkAvailability();

    await worker(API, puppet, loginUrl);
  } catch (e) {
    console.log(e.message);
  }
}

function sleep(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
}

async function worker(API: any, puppet: any, loginUrl: string): Promise<void> {
  try {
    const segmentResults = [];

    for (let i = 0; i < API.selectedParks.length; i++) {
      const park = API.selectedParks[i];
      const segmentId: string = await API.getSegmentId(park);
      segmentResults.push({ segmentId, parkId: park });
    }

    for (let i = 0; i < segmentResults.length; i++) {
      const result = segmentResults[i];
      const offerId = await API.getOfferId(result.segmentId, result.parkId);
      await API.acceptOffer(offerId);
    }

    console.log("Sleeping 5 seconds before next attempt");
    await sleep(5000);
    return worker(API, puppet, loginUrl);
  } catch (e) {
    if (e.message.includes(410)) {
      console.log("There are no slots available");
      console.log("Sleeping 5 seconds before next attempt");
      await sleep(5000);
      return worker(API, puppet, loginUrl);
    } else {
      console.log("Some other error: ", e.message);
      if (e && e.response && e.response.status == 401) {
        console.log("REFRESHING TOKENS");
        const tokens = await puppet.start(loginUrl)
        API.accessToken = tokens.accessToken;
        API.refreshToken = tokens.refreshToken;
        API.userId = tokens.userId;

        console.log("TOKENS REFRESHED");

        return worker(API, puppet, loginUrl);
      }

    }
  }
}

try {
  main();
} catch(e) {
  console.error(e.message);
}
