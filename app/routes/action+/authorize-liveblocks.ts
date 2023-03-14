import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authorize } from "@liveblocks/node";

const API_KEY = process.env.LIVEBLOCKS_SECRET_KEY;

export const action: ActionFunction = async ({
   context: { payload, user },
   request,
}) => {
   if (!API_KEY) {
      return json({ status: 403 });
   }
   const { room } = await request.json();
   const response = await authorize({
      room,
      secret: API_KEY,
      userId: user ? user?.id : "guest",
      userInfo: {
         name: user?.username,
         //@ts-ignore
         avatar: user?.avatar?.url,
      },
   });
   const token = JSON.parse(response.body);
   return json(token);
};
