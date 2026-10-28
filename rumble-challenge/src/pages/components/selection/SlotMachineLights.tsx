import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const CORNERS = ["top-left", "top-right", "bottom-right", "bottom-left"];
const EDGES = ["top", "right", "bottom", "left"];

export function SlotMachineLights() {
  const borderRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState({ horizontal: 11, vertical: 17 });

  useEffect(() => {
    const border = borderRef.current;
    if (!border || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      // Odd edge counts put the opposite phase next to each corner, without
      // duplicating a bulb or cutting one off when the cabinet is resized.
      const count = (size: number) => 2 * Math.max(1, Math.round((size - 28) / 48)) - 1;
      const horizontal = count(entry.contentRect.width);
      const vertical = count(entry.contentRect.height);
      setCounts(current => current.horizontal === horizontal && current.vertical === vertical
        ? current
        : { horizontal, vertical });
    });
    observer.observe(border);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={borderRef} className="slot-machine__lights" aria-hidden="true">
      {CORNERS.map(corner => (
        <span
          key={corner}
          className="slot-machine__lamp"
          data-lamp-corner={corner}
          data-lamp-phase="0"
        />
      ))}
      {EDGES.map(edge => {
        const count = edge === "top" || edge === "bottom" ? counts.horizontal : counts.vertical;
        return (
          <div key={edge} className={`slot-machine__light-edge slot-machine__light-edge--${edge}`}>
            {Array.from({ length: count }, (_, index) => (
              <span
                key={index}
                className="slot-machine__lamp"
                data-lamp-phase={(index + 1) % 2}
                style={{ "--lamp-position": `${(index + 1) / (count + 1) * 100}%` } as CSSProperties}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
