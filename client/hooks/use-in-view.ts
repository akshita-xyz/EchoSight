import { RefObject, useEffect, useRef, useState } from "react";

export function useInView<T extends Element>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1, ...options },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref: ref as RefObject<T>, inView } as const;
}
