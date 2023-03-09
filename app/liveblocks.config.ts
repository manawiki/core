import { createClient, type LiveList } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
   authEndpoint: "/action/authorize-liveblocks",
});

export type Presence = {
   selectedBlockId: string | null;
};

type Storage = {
   notes: LiveList<{ mdx: string }>;
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
