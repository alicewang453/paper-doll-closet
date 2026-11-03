import type { ReactNode } from 'react';

/** A game-style window with a title bar, like the dress-up games it's inspired by. */
export function Window({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <section className={`win ${className ?? ''}`} aria-label={title}>
      <div className="bar">
        <span>{title}</span>
        <i aria-hidden="true"><b></b><b></b></i>
      </div>
      {children}
    </section>
  );
}

/** Raw SVG markup produced by the renderers. */
export function Art({ svg, className }: { svg: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}
