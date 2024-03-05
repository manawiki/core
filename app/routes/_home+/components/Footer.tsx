import { Link } from "@remix-run/react";

import { Icon } from "~/components/Icon";
import { DarkModeToggle } from "~/routes/_site+/action+/theme-toggle";

export function Footer() {
   return (
      <footer className="py-3 max-laptop:px-4 w-full bg-3 flex items-center">
         <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
            <div className="flex items-center justify-center gap-5 text-1">
               <a
                  href="https://github.com/manawiki"
                  aria-label="Mana Wiki Github"
                  rel="noreferrer"
                  target="_blank"
               >
                  <Icon name="github" size={18}></Icon>
               </a>
               <a
                  href="https://discord.com/invite/nRNM35ytD7"
                  aria-label="Mana Wiki Discord"
                  rel="noreferrer"
                  target="_blank"
               >
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width="16"
                     height="16"
                     className="h-5 w-5 fill-current"
                     viewBox="0 0 16 16"
                  >
                     <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
                  </svg>
               </a>
            </div>
            <Link to="/">
               <svg
                  width="78"
                  height="17"
                  viewBox="0 0 78 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <path
                     d="M0 16.3V7C0 4.8 0.566666 3.1 1.7 1.9C2.83333 0.633333 4.4 0 6.4 0C8.46667 0 10.0333 0.666667 11.1 2C12.1 0.666667 13.6667 0 15.8 0C17.8 0 19.3667 0.633333 20.5 1.9C21.6333 3.1 22.2 4.8 22.2 7V16.3H17.5V6.8C17.5 6.06667 17.3 5.5 16.9 5.1C16.5667 4.63333 16.1 4.4 15.5 4.4C14.9 4.4 14.4 4.63333 14 5.1C13.6667 5.5 13.5 6.06667 13.5 6.8V16.3H8.7V6.8C8.7 6.06667 8.53333 5.5 8.2 5.1C7.86667 4.63333 7.36667 4.4 6.7 4.4C6.1 4.4 5.63333 4.63333 5.3 5.1C4.9 5.5 4.7 6.06667 4.7 6.8V16.3H0ZM32.6 16.6C30.4 16.6 28.5333 15.8333 27 14.3C25.4667 12.7667 24.7 10.8 24.7 8.4C24.7 6 25.4667 4.03333 27 2.5C28.5333 0.9 30.4 0.1 32.6 0.1C34.5333 0.1 36.0667 0.7 37.2 1.9V0.4H41.4V16.3H37.2V14.9C36.0667 16.0333 34.5333 16.6 32.6 16.6ZM30.5 5.5C29.7667 6.23333 29.4 7.2 29.4 8.4C29.4 9.53333 29.7667 10.4667 30.5 11.2C31.1667 11.9333 32.0667 12.3 33.2 12.3C34.3333 12.3 35.2333 11.9333 35.9 11.2C36.6333 10.4667 37 9.53333 37 8.4C37 7.2 36.6333 6.23333 35.9 5.5C35.2333 4.76667 34.3333 4.4 33.2 4.4C32.0667 4.4 31.1667 4.76667 30.5 5.5ZM44.5 16.3V6.9C44.5 4.76667 45.1333 3.1 46.4 1.9C47.6 0.633333 49.3 0 51.5 0C53.6333 0 55.3333 0.633333 56.6 1.9C57.8 3.1 58.4 4.76667 58.4 6.9V16.3H53.7V7.1C53.7 6.23333 53.5 5.56667 53.1 5.1C52.7 4.63333 52.1667 4.4 51.5 4.4C50.7667 4.4 50.2 4.63333 49.8 5.1C49.4667 5.56667 49.3 6.23333 49.3 7.1V16.3H44.5ZM68.8 16.6C66.6 16.6 64.7333 15.8333 63.2 14.3C61.6667 12.7667 60.9 10.8 60.9 8.4C60.9 6 61.6667 4.03333 63.2 2.5C64.7333 0.9 66.6 0.1 68.8 0.1C70.7333 0.1 72.2667 0.7 73.4 1.9V0.4H77.6V16.3H73.4V14.9C72.2667 16.0333 70.7333 16.6 68.8 16.6ZM66.7 5.5C65.9667 6.23333 65.6 7.2 65.6 8.4C65.6 9.53333 65.9667 10.4667 66.7 11.2C67.3667 11.9333 68.2667 12.3 69.4 12.3C70.5333 12.3 71.4333 11.9333 72.1 11.2C72.8333 10.4667 73.2 9.53333 73.2 8.4C73.2 7.2 72.8333 6.23333 72.1 5.5C71.4333 4.76667 70.5333 4.4 69.4 4.4C68.2667 4.4 67.3667 4.76667 66.7 5.5Z"
                     fill="currentColor"
                  />
               </svg>
            </Link>
            <div className="min-w-[60px] flex items-center justify-end">
               <DarkModeToggle className="!size-10" />
            </div>
         </div>
      </footer>
   );
}