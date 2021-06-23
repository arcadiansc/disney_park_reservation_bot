import axios from "axios";
import {
  IApiOptions,
  IAvailableDatesResponse,
  IGuest,
  IChoice,
  IAvailablePark,
  IOffer,
} from "./interfaces";
import {
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
import moment from "moment";
import fs from 'fs';
import exp from "constants";
// @ts-ignore
const uuid = require('uuid');
export default class API {
  email: string = "";
  password: string = "";
  date: string = "";
  startDate: string = "";
  endDate: string = "";
  userId: string = "";
  guests: IGuest[] | null = null;
  selectedGuests: string[] = [];
  selectedParks: string[] = [];
  gCaptcha: string | undefined = "";

  correlationId: string = "";
  conversationId: string = "";

  apiKey: string = "";
  accessToken: string = "";
  refreshToken: string = "";

  constructor(options: IApiOptions) {
    this.email = options.email;
    this.password = options.password;
    this.date = options.date;
    this.userId = options.userId;
    this.accessToken = options.accessToken;
    this.refreshToken = options.refreshToken;
    this.correlationId = uuid.v4();
    this.conversationId = uuid.v4();
  }

  genericHeaders() {
    const headers = {
      authorization: `BEARER ${this.accessToken}`
    }

    return headers;
  }

  async getAvailableDates(): Promise<void> {
    try {
      const response = await axios.get(availableDatesUrl);
      const data: IAvailableDatesResponse = response.data;
      const { endDate, startDate } = data;

      if (moment(startDate).isAfter(new Date(this.date))) {
        throw new Error("Your configured date is before any available dates.");
      }

      if (moment(endDate).isBefore(new Date(this.date))) {
        throw new Error("Your configured date is after any available dates");
      }
      this.startDate = startDate;
      this.endDate = endDate;
    } catch (e) {
      throw e;
    }
  }


  async getGuests(): Promise<void> {
    try {

      const response = await axios.get(createGuestUrl(this.userId), {
        headers: this.genericHeaders(),
      });
      const { data } = response;
      const guests: IGuest[] = data.guests;
      this.guests = guests;
    } catch (e) {
      console.log("guests error: ", e.response.data);
      throw e;
    }
  }

  async checkForParkAvailability() {
    try {
      const parksUrl = getParksUrl(this.date, this.selectedGuests);
      const response = await axios.get(
        parksUrl,
        { headers: this.genericHeaders() }
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
        headers: this.genericHeaders()
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
        headers: this.genericHeaders()
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
          headers: this.genericHeaders()
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
      console.log('acceptUrl: ', acceptUrl, 'body: ', body);
      const response = await axios.post(acceptUrl, body, {
        headers: this.genericHeaders()
      });
      const { data } = response;
      console.log("OFFER  SUCCESSFULLY ACEPTED exiting");
      process.exit(0);
    } catch (e) {
      console.log("e: ", e.response.data);
      throw e;
    }
  }
}
