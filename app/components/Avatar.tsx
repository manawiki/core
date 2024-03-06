import React from "react";

import {
   Button as HeadlessButton,
   type ButtonProps as HeadlessButtonProps,
} from "@headlessui/react";
import clsx from "clsx";

import { Image } from "~/components/Image";

import { TouchTarget } from "./Button";
import { Link } from "./Link";

interface AvatarProps extends React.ComponentPropsWithoutRef<"span"> {
   src?: string | null;
   square?: boolean;
   initials?: string;
   alt?: string;
   className?: string;
   options?: string;
}

export function Avatar({
   src = null,
   square = false,
   initials,
   alt = "",
   className,
   options,
   ...props
}: AvatarProps) {
   return (
      <span
         data-slot="avatar"
         className={clsx(
            className,

            // Basic layout
            "grid align-middle *:col-start-1 *:row-start-1 dark:bg-dark450 bg-white",

            // Add the correct border radius
            square
               ? "rounded-[20%] *:rounded-[20%]"
               : "rounded-full *:rounded-full",
         )}
         {...props}
      >
         {initials && (
            <svg
               className="select-none fill-current text-[48px] font-medium uppercase"
               viewBox="0 0 100 100"
               aria-hidden={alt ? undefined : "true"}
            >
               {alt && <title>{alt}</title>}
               <text
                  x="50%"
                  y="50%"
                  alignmentBaseline="middle"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  dy=".125em"
               >
                  {initials}
               </text>
            </svg>
         )}
         {src && <Image url={src} alt={alt} options={options} loading="lazy" />}
         {/* Add an inset border that sits on top of the image */}
         <span
            className="ring-1 ring-inset ring-black/10 dark:ring-white/5 forced-colors:outline"
            aria-hidden="true"
         />
      </span>
   );
}

export const AvatarButton = React.forwardRef(function AvatarButton(
   {
      src,
      square = false,
      initials,
      alt,
      className,
      options,
      ...props
   }: AvatarProps &
      (HeadlessButtonProps | React.ComponentPropsWithoutRef<typeof Link>),
   ref: React.ForwardedRef<HTMLElement>,
) {
   let classes = clsx(
      className,
      square ? "rounded-lg" : "rounded-full",
      "relative focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500",
   );

   return "href" in props ? (
      <Link
         {...props}
         className={classes}
         ref={ref as React.ForwardedRef<HTMLAnchorElement>}
      >
         <TouchTarget>
            <Avatar
               src={src}
               square={square}
               initials={initials}
               alt={alt}
               options={options}
            />
         </TouchTarget>
      </Link>
   ) : (
      <HeadlessButton {...props} className={classes} ref={ref}>
         <TouchTarget>
            <Avatar
               src={src}
               square={square}
               initials={initials}
               alt={alt}
               options={options}
            />
         </TouchTarget>
      </HeadlessButton>
   );
});
