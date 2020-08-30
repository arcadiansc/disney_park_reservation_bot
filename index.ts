import dotEnv from "dotenv";
dotEnv.config();
import apiClass from "./api";
import { ISessionAndCSRF, IGuest, IApiOptions } from "./interfaces";

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

  const API = new apiClass({ email, password, date });

  try {
    await API.getAvailableDates();
    const { cookie, csrf }: ISessionAndCSRF = await API.getSessionAndCsrf();
    await API.login(cookie, csrf);
    await API.getGuests();
    await API.askForGuestsToUse();
    await API.checkForParkAvailability();

    await worker(API);
  } catch (e) {
    console.log(e.message);
  }
}

function sleep(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
}

async function worker(API: any) {
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
    worker(API);
  } catch (e) {
    if (e.message.includes(410)) {
      console.log("There are no slots available");
      console.log("Sleeping 5 seconds before next attempt");
      await sleep(5000);
      worker(API);
    } else {
      console.log("Error: ", e.message);
    }
  }
}

main();
