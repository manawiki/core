import pluralize from "pluralize";
const { plural, singular } = pluralize;

const capitalizeFirstLetter = (string: string): string =>
   string.charAt(0).toUpperCase() + string.slice(1);

//We need to construct the Graphql label the same way payload does from the slug
//Following functions are copied over from payload core
function toWords(inputString: string, joinWords = false): string {
   const notNullString = inputString || "";
   const trimmedString = notNullString.trim();
   const arrayOfStrings = trimmedString.split(/[\s-]/);
   const splitStringsArray = [] as any;
   arrayOfStrings.forEach((tempString) => {
      if (tempString !== "") {
         const splitWords = tempString.split(/(?=[A-Z])/).join(" ");
         splitStringsArray.push(capitalizeFirstLetter(splitWords));
      }
   });

   return joinWords
      ? splitStringsArray.join("").replace(/\s/gi, "")
      : splitStringsArray.join(" ");
}

// packages/payload/src/collections/graphql/init.ts

export function gqlFormat(collectionId: string, type: "single" | "list") {
   const pluralFormattedName = plural(toWords(collectionId, true));

   const singularFormattedName = singular(toWords(collectionId, true));

   if (type == "list") {
      // For collections named 'Media' or similar,
      // there is a possibility that the singular name
      // will equal the plural name. Append `all` to the beginning
      // of potential conflicts
      if (pluralFormattedName === singularFormattedName) {
         return `all${singularFormattedName}`;
      }
      return pluralFormattedName;
   }
   if (type == "single") {
      return singularFormattedName;
   }

   return;
}
