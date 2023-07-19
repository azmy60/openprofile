import { RefObject, useEffect, useRef } from "react";

/** Mutably move an element of `targetIdx` to index `toIdx`. */
export function moveArrayElement(arr: any[], targetIdx: number, toIdx: number) {
  return arr.splice(toIdx, 0, arr.splice(targetIdx, 1)[0]);
}

const defaultEvents = ["mousedown", "touchstart"];

export const useClickAway = <E extends Event = Event>(
  ref: RefObject<HTMLElement | null>,
  onClickAway: (event: E) => void,
  events: string[] = defaultEvents
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

/** Mutably set the value of `draft` object by `path`. */
export function setValueByPath(draft: object, path: string, value: unknown) {
  let walker: any = draft;
  const steps = generateWalkSteps(path);
  steps.forEach((step, idx) => {
    if (idx === steps.length - 1) walker[step] = value;
    else walker = walker[step];
  });
}

const WALK_STEPS_MATCHER = /(\w+)/g;

function generateWalkSteps(path: string): string[] {
  return path.match(WALK_STEPS_MATCHER) || [];
}
