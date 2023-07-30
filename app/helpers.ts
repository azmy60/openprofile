import { RefObject, useEffect, useRef } from "react";
import memoize from "lodash.memoize";

/** Mutably move an element of `targetIdx` to index `toIdx`. */
export function moveArrayElement(arr: any[], targetIdx: number, toIdx: number) {
  return arr.splice(toIdx, 0, arr.splice(targetIdx, 1)[0]);
}

const defaultEvents = ["mousedown", "touchstart"];

export const useClickAway = <E extends Event = Event>(
  ref: RefObject<HTMLElement | null>,
  onClickAway: (event: E) => void,
  events: string[] = defaultEvents,
) => {
  const savedCallback = useRef(onClickAway);
  useEffect(() => {
    savedCallback.current = onClickAway;
  }, [onClickAway]);
  useEffect(() => {
    function handler(event: Event) {
      const { current: el } = ref;
      el &&
        !el.contains(event.target as Node) &&
        savedCallback.current(event as E);
    }
    for (const eventName of events) {
      document.addEventListener(eventName, handler);
    }
    return () => {
      for (const eventName of events) {
        document.removeEventListener(eventName, handler);
      }
    };
  }, [events, ref]);
};

export function genId(): string {
  return Math.random().toString(16).slice(2);
}

function _removeUrlProtocol(url: string) {
  if (url.startsWith("http://")) return url.replace("http://", "");
  if (url.startsWith("https://")) return url.replace("https://", "");
  return url;
}

export const removeUrlProtocol = memoize(_removeUrlProtocol);
