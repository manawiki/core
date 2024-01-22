import { useFetcher } from "@remix-run/react";
import { useTranslation } from "react-i18next";

import {
   Alert,
   AlertActions,
   AlertDescription,
   AlertTitle,
} from "~/components/Alert";
import { Button } from "~/components/Button";
import { Icon } from "~/components/Icon";
import { isAdding, isProcessing } from "~/utils/form";

export const PostDeleteModal = ({
   isDeleteOpen,
   setDeleteOpen,
}: {
   isDeleteOpen: boolean;
   setDeleteOpen: (open: boolean) => void;
}) => {
   const fetcher = useFetcher();
   const deleting = isAdding(fetcher, "deletePost");
   const { t } = useTranslation("post");
   const disabled = isProcessing(fetcher.state);

   return (
      <Alert open={isDeleteOpen} onClose={setDeleteOpen}>
         <AlertTitle>
            Are you sure you want to delete this post permanently?
         </AlertTitle>
         <AlertDescription>You cannot undo this action.</AlertDescription>
         <AlertActions>
            <Button
               plain
               disabled={disabled}
               className="text-sm cursor-pointer"
               onClick={() => setDeleteOpen(false)}
            >
               Cancel
            </Button>
            <Button
               disabled={disabled}
               className="text-sm cursor-pointer"
               color="red"
               onClick={() =>
                  fetcher.submit({ intent: "deletePost" }, { method: "delete" })
               }
            >
               {deleting ? (
                  <Icon
                     name="loader-2"
                     size={16}
                     className="mx-auto animate-spin"
                  />
               ) : (
                  t("actions.delete")
               )}
            </Button>
         </AlertActions>
      </Alert>
   );
};
