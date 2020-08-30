import axios from "axios";
import {
  IApiOptions,
  ISessionAndCSRF,
  IAvailableDatesResponse,
  IGuest,
  IChoice,
  IAvailablePark,
  IOffer,
} from "./interfaces";
import {
  loginUrl,
  formLoginBody,
  phpSessionUrl,
  availableDatesUrl,
  createGuestUrl,
  selectOptions,
  getParksUrl,
  PARKS,
  formGetSegmentUrl,
  formCheckReservationsUrl,
  formAcceptOfferUrl,
  formCheckOfferUrl,
} from "./utils";
import { parse } from "node-html-parser";
import moment from "moment";

export default class API {
  email: string = "";
  password: string = "";
  date: string = "";
  startDate: string = "";
  endDate: string = "";
  userId: string = "";
  pep_jwt_token: string = "";
  pep_oath_token: string = "";
  pep_oauth_refresh_token: string = "";
  pep_oauth_refresh_token_pp: string = "";
  sessionId: string = "";
  guests: IGuest[] | null = null;
  selectedGuests: string[] = [];
  selectedParks: string[] = [];

  constructor(options: IApiOptions) {
    this.email = options.email;
    this.password = options.password;
    this.date = options.date;
  }

  async getSessionAndCsrf(): Promise<ISessionAndCSRF> {
    try {
      const response = await axios.get(phpSessionUrl);
      const { headers, data } = response;
      const setCookie = headers["set-cookie"];

      let cookie: string = "";

      for (let i: number = 0; i < setCookie.length; i++) {
        if (setCookie[i].includes("PHP")) {
          cookie += setCookie[i] + "; ";
        }
      }

      cookie = cookie.split(";")[0];

      const root = parse(data);

      const csrfInput = root.querySelector("#pep_csrf");
      const { rawAttributes } = csrfInput;
      const { value } = rawAttributes;
      this.sessionId = cookie.split("=")[1];
      return { csrf: value, cookie };
    } catch (e) {
      throw e;
    }
  }

  async login(cookie: string, csrf: string): Promise<void> {
    try {
      const loginBody: string = formLoginBody(this.email, this.password, csrf);
      await axios.post(loginUrl, loginBody, {
        maxRedirects: 0,
        headers: {
          Cookie: cookie,
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36",
        },
      });

      throw new Error("No redirect. Something has changed. Create an issue.");
    } catch (e) {
      const { status, headers } = e.response;
      if (status === 302) {
        // console.log("Success Login in: ", headers);
        const cookies = headers["set-cookie"];

        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];

          const value = cookie.substring(cookie.indexOf("=") + 1).split(";")[0];
          const key = cookie.substring(0, cookie.indexOf("="));

          if (key === "SWID") {
            const initialSplit: string = cookie
              .split(";")[0]
              .replace(/{/g, "")
              .replace(/}/g, "");
            const userId = initialSplit.split("=")[1];
            this.userId = userId;
          }

          if (key === "pep_oauth_token") {
            this.pep_oath_token = value;
          }

          if (key === "pep_oauth_refresh_token") {
            this.pep_oauth_refresh_token = value;
          }

          if (key === "pep_oauth_refresh_token_pp") {
            this.pep_oauth_refresh_token_pp = value;
          }

          if (key === "pep_jwt_token") {
            this.pep_jwt_token = value;
          }
        }
        const userIdHeader = cookies.find((item: string) =>
          item.includes("SWID")
        );

        if (!userIdHeader) {
          throw new Error("Unable to get userId");
        }
      } else {
        throw e;
      }
    }
  }

  async getAvailableDates(): Promise<void> {
    try {
      const response = await axios.get(availableDatesUrl);
      const data: IAvailableDatesResponse = response.data;
      const { endDate, startDate } = data;
      console.log("data: ", data);

      if (moment(startDate).isAfter(this.date)) {
        throw new Error("Your configured date is before any available dates.");
      }

      if (moment(endDate).isBefore(this.date)) {
        throw new Error("Your configured date is after any available dates");
      }
      this.startDate = startDate;
      this.endDate = endDate;
    } catch (e) {
      throw e;
    }
  }

  formAuthCookie(): string {
    return `pep_jwt_token=${this.pep_jwt_token}; pep_oauth_token=${this.pep_oath_token}; pep_oauth_refresh_token=${this.pep_oauth_refresh_token}; pep_oauth_refresh_token_pp=${this.pep_oauth_refresh_token_pp}; SWID={${this.userId}}; PHPSESSID=${this.sessionId}`;
  }

  async getGuests(): Promise<void> {
    try {
      const response = await axios.get(createGuestUrl(this.userId), {
        headers: { Authorization: `BEARER ${this.pep_oath_token}` },
      });
      const { data } = response;
      const guests: IGuest[] = data.guests;
      this.guests = guests;
    } catch (e) {
      throw e;
    }
  }

  async checkForParkAvailability() {
    try {
      const response = await axios.get(
        getParksUrl(this.date, this.selectedGuests),
        { headers: { Authorization: `BEARER ${this.pep_oath_token}` } }
      );
      const { data } = response;
      const { parks } = data;

      const availableParks: IAvailablePark[] = [];

      for (let i = 0; i < parks.length; i++) {
        const park = parks[i];
        const { available, id } = park;
        if (available) {
          const parkFound = PARKS.find((item) => item.id === id);
          if (parkFound !== undefined) {
            availableParks.push({ name: parkFound.name, value: id });
          }
        }
      }

      if (!availableParks || !availableParks.length) {
        throw new Error("No parks are available at this time");
      }

      const message: string =
        "Select the parks you would like to search. Press the spacebar to select. Enter to submit.";

      const selectedParks: string[] = await selectOptions(
        message,
        availableParks,
        "selectedParks"
      );
      this.selectedParks = selectedParks;
    } catch (e) {
      throw e;
    }
  }

  async askForGuestsToUse() {
    if (!this.guests || !this.guests.length) {
      throw new Error("There are no guests attached to this session.");
    }

    const choices: IChoice[] = [];

    for (let i = 0; i < this.guests.length; i++) {
      const guest: IGuest = this.guests[i];
      const { firstName, lastName, xid } = guest;
      choices.push({ name: `${firstName} ${lastName}`, value: xid });
    }

    const message: string =
      "Select which users you would like to make reservations for. Press the spacebar to select. Enter to submit.";

    const selectedUsers: string[] = await selectOptions(
      message,
      choices,
      "selectedUsers"
    );
    this.selectedGuests = selectedUsers;
  }

  async getSegmentId(parkId: string): Promise<string> {
    try {
      const segmentUrl: string = formGetSegmentUrl(
        this.selectedGuests,
        this.date,
        parkId
      );

      const response = await axios.get(segmentUrl, {
        headers: {
          Authorization: `BEARER ${this.pep_oath_token}`,
        },
      });
      const { data } = response;
      const { segments } = data;
      if (!segments || !segments.length) {
        throw new Error("No Segments available");
      }

      const firstSegent = segments[0];
      const segmentId: string = firstSegent.segmentId;
      return segmentId;
    } catch (e) {
      throw e;
    }
  }

  async getOfferId(segmentId: string, parkId: string): Promise<string> {
    try {
      const checkUrl = formCheckReservationsUrl(
        this.selectedGuests,
        this.date,
        parkId,
        segmentId
      );

      const response = await axios.get(checkUrl, {
        headers: {
          Authorization: `BEARER ${this.pep_oath_token}`,
        },
      });

      const { data } = response;
      const { experience } = data;

      if (!experience)
        throw new Error("No experience available for this configuration.");
      const offers: IOffer[] = experience.offers;

      if (!offers || !offers.length)
        throw new Error("No offers available for this configuration");

      const offerWithNoConflict = offers.find(
        (offer) => !offer.hasConflictingPlanAtTime && !offer.isLocked
      );

      if (!offerWithNoConflict)
        throw new Error("All the offers have conflicts");

      const checkOfferUrl = formCheckOfferUrl(offerWithNoConflict.id);

      const checkOnOfferResponse = await axios.put(
        checkOfferUrl,
        {},
        {
          headers: {
            Authorization: `BEARER ${this.pep_oath_token}`,
          },
        }
      );

      if (checkOnOfferResponse.data.offer) {
        return checkOnOfferResponse.data.offer.id;
      }

      throw new Error("Offer is not available anymore.");
    } catch (e) {
      throw e;
    }
  }

  async acceptOffer(offerId: string) {
    try {
      const acceptUrl: string = formAcceptOfferUrl(this.userId);
      const body = { offerId };
      const response = await axios.post(acceptUrl, body, {
        headers: {
          Authorization: `BEARER ${this.pep_oath_token}`,
        },
      });
      const { data } = response;
      console.log("OFFER  SUCCESSFULLY ACEPTED exiting");
      process.exit(0);
    } catch (e) {
      throw e;
    }
  }
}
