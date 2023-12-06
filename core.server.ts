import {
   unstable_createViteServer,
   unstable_loadViteServerBuild,
} from "@remix-run/dev";
import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import compression from "compression";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import nodemailer from "nodemailer";
import payload from "payload";
import sourceMapSupport from "source-map-support";
import invariant from "tiny-invariant";

import { settings, corsConfig } from "./mana.config";

// patch in Remix runtime globals
installGlobals();
require("dotenv").config();
sourceMapSupport.install();

async function start() {
   const app = express();

   // Start Payload CMS
   invariant(process.env.PAYLOADCMS_SECRET, "PAYLOADCMS_SECRET is required");

   //setup mail
   const transport = nodemailer.createTransport({
      host: process.env.PAYLOAD_NODEMAILER_HOST,
      port: parseInt(process.env.PAYLOAD_NODEMAILER_PORT ?? "587"),
      secure: false,
      auth: {
         user: process.env.PAYLOAD_NODEMAILER_USER,
         pass: process.env.PAYLOAD_NODEMAILER_PASSWORD,
      },
   });

   await payload.init({
      secret: process.env.PAYLOADCMS_SECRET,
      express: app,
      onInit: () => {
         payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
      },
      ...(process.env.PAYLOAD_NODEMAILER_HOST
         ? {
              email: {
                 transport,
                 fromName: settings.fromName,
                 fromAddress: settings.fromEmail,
              },
           }
         : {
              email: {
                 fromName: "Admin",
                 fromAddress: "admin@example.com",
                 logMockCredentials: true, // Optional
              },
           }),
   });

   app.use(payload.authenticate);

   // Express Server setup
   const { corsOrigins } = await corsConfig();
   app.use(cors({ origin: corsOrigins }));
   app.use(compression());

   // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
   app.disable("x-powered-by");

   const getHost = (req: { get: (key: string) => string | undefined }) =>
      req.get("X-Forwarded-Host") ?? req.get("host") ?? "";

   app.use((req, res, next) => {
      //enforce https connection to make sure the site uses http2 protocol
      const proto = req.get("X-Forwarded-Proto");
      const host = getHost(req);
      // console.log("proto", proto, "host", host);
      if (proto === "http") {
         res.set("X-Forwarded-Proto", "https");
         res.redirect(`https://${host}${req.originalUrl}`);
         return;
      }

      // if they connect once with HTTPS, then they'll connect with HTTPS for the next hundred years
      res.set(
         "Strict-Transport-Security",
         "max-age=63072000; includeSubDomains; preload",
      );

      // no ending slashes for SEO reasons
      if (req.path.endsWith("/") && req.path.length > 1) {
         const query = req.url.slice(req.path.length);
         const safepath = req.path.slice(0, -1).replace(/\/+/g, "/");
         res.redirect(301, safepath + query);
         return;
      }

      next();
   });

   // Remix fingerprints its assets so we can cache forever.
   app.use(
      "/build",
      express.static("public/build", { immutable: true, maxAge: "1y" }),
   );

   // Aggressively cache fonts for a year
   app.use(
      "/fonts",
      express.static("public/fonts", { immutable: true, maxAge: "1y" }),
   );
   app.use(
      "/icons",
      express.static("public/icons", { immutable: true, maxAge: "1y" }),
   );

   // Everything else (like favicon.ico) is cached for an hour. You may want to be
   // more aggressive with this caching.
   app.use(express.static("public", { maxAge: "1h" }));

   app.use(morgan("tiny"));

   // handle Remix asset requests
   let vite =
      process.env.NODE_ENV === "production"
         ? undefined
         : await unstable_createViteServer();

   if (vite) {
      app.use(vite.middlewares);
   } else {
      app.use(
         "/build",
         express.static("public/build", { immutable: true, maxAge: "1y" }),
      );
   }

   // handle Remix SSR requests
   app.all(
      "*",
      // @ts-ignore
      createRequestHandler({
         // @ts-ignore
         build: vite
            ? () => {
                 if (vite) return unstable_loadViteServerBuild(vite);
              }
            : //@ts-ignore
              await import("./build/index.js"),
         getLoadContext(req, res) {
            return {
               payload: req.payload,
               user: req?.user,
               res,
            };
         },
      }),
   );

   const port = process.env.PORT || 3000;
   app.listen(port, () =>
      console.log("Express server listening on http://localhost:" + port),
   );
}

start();
