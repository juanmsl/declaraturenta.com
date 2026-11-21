/** Scrolls smoothly to a section of the page, or instantly with «reduce motion» (ADR 0043). */
export const scrollToSection = (id: string) => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
};
