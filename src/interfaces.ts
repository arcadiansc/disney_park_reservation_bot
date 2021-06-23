export interface IApiOptions {
  email: string;
  password: string;
  date: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export interface ISessionAndCSRF {
  cookie: string;
  csrf: string;
}

export interface IAvailableDatesResponse {
  endDate: string;
  startDate: string;
}

export interface IGuest {
  xid: string;
  firstName: string;
  lastName: string;
  active: boolean;
  avatarId: string;
}

export interface IChoice {
  name: string;
  value: string;
}

export interface IAvailablePark {
  name: string;
  value: string;
}

export interface IPark {
  name: string;
  id: string;
}

export interface IOffer {
  id: string;
  isLocked: boolean;
  startDateTime: string;
  endDateTime: string;
  hasConflictingPlanAtTime: boolean;
}
