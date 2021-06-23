import puppeteer from 'puppeteer';
import fs from 'fs';
import {cacheTokens} from "./utils";

let window: { [key: string]: any };


export default class Puppeteer {


  // @ts-ignore
  browser: puppeteer.Browser;
  // @ts-ignore
  page: puppeteer.Page;
  userAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36";


  responseUrls: string[] = [];
  responses: any[] = [];
  requests: any[] = [];

  email: string = "";
  password: string = "";

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  createPage = async (): Promise<void> => {
    // @ts-ignore
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
    });
    this.page = await this.browser.newPage();
  };


  kill = async (): Promise<void> => {
    await this.browser.close();
  };


  waitForInput = async (retry = 0): Promise<{ inputs: any[], button: any }> => {
    if (retry > 100) throw new Error("Unable to get inputs");
    const element = await this.page.$('#disneyid-iframe');
    if (!element) {
      this.page.waitForTimeout(500);
      return this.waitForInput(retry + 1);
    }

    const frame = await element.contentFrame();
    if (!frame) {
      this.page.waitForTimeout(500);
      return this.waitForInput(retry + 1);
    }


    const inputs = await frame.$$('input');
    const button = await frame.$('button');

    if (!inputs || !inputs.length) {
      this.page.waitForTimeout(500);
      return this.waitForInput(retry + 1);
    }

    return { inputs, button };
  }

  start = async (url: string): Promise<{ userId: string, accessToken: string, refreshToken: string }> => {
    await this.createPage();
    await this.page.setUserAgent(this.userAgent);

    await this.page.goto(url);

    const { inputs, button } = await this.waitForInput(0);

    await this.page.waitForTimeout(3000)

    await inputs[0].type(this.email, { delay: 20 });

    await inputs[1].type(this.password, { delay: 20 });

    await button.click();

    let accessToken = "";
    let refreshToken = "";
    let userId = "";

    const login = "https://registerdisney.go.com/jgc/v6/client/TPR-WDW-LBJS.WEB-PROD/guest/login?langPref=en-US";

    // @ts-ignore
    await this.page.waitForResponse(async (response) => {
      const matches = response.url() === login
      if (matches) {
        const text = await response.status();
        const body = await response.json();

        // console.log("MATCHES: ", text, body);
        if (body &&body.data && body.data.token) {
          accessToken = body.data.token.access_token;
          refreshToken = body.data.token.refresh_token;
          userId = body.data.token.swid.replace(/{/g, '').replace(/}/g, '');
        }
        return true;
      }

      return false;
    })


    try {
      await this.kill();
    } catch (e) {
      // logger.debug("Error killing puppetteer", e);
    }


    cacheTokens(this.email, accessToken, refreshToken, userId);

    return { accessToken, refreshToken, userId };
  };
}

