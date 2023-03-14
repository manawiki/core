import { createClient, type LiveList } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

// const client = createClient({
//    authEndpoint: "/action/authorize-liveblocks",
// });

const client = createClient({
   publicApiKey:
      "pk_dev_51CSf2wAYrJ0g-odMTEPFCPvQ-K1TIX6p85W0CfpJhNwGm-3Y5Fu_nenButYJTN-",
});

export type Presence = {
   selectedBlockId: string | null;
};

type Storage = {
   notes: LiveList<{}>;
};

type UserMeta = {
   id: string;
   info: {
      name: string;
      avatar: string;
   };
};

// Optionally, the type of custom events broadcasted and listened for in this
// room. Must be JSON-serializable.
// type RoomEvent = {};

export const {
   suspense: {
      RoomProvider,
      useMutation,
      useOthers,
      useOthersMapped,
      useSelf,
      useStorage,
      useUpdateMyPresence,
      useList,
      useRoom,
   },
} = createRoomContext<Presence, Storage, UserMeta /* RoomEvent */>(client);
