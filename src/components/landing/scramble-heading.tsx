"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";
import ScrambleIn, { ScrambleInHandle } from "@/components/fancy/text/scramble-in";

/** Judul section yang ter-scramble saat pertama masuk viewport. */
export function ScrambleHeading({ text }: { text: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const handle = useRef<ScrambleInHandle>(null);
  const inView = useInView(host, { once: true, margin: "-15% 0px -15% 0px" });

  useEffect(() => {
    if (inView) handle.current?.start();
  }, [inView]);

  return (
    <span ref={host}>
      <ScrambleIn
        ref={handle}
        text={text}
        autoStart={false}
        scrambleSpeed={28}
        scrambledLetterCount={6}
        scrambledClassName="text-primary"
      />
    </span>
  );
}
