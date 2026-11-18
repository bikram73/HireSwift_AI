import React, { useEffect, useRef } from 'react';

const INTERACTIVE_SELECTOR =
  'button, a, [role="button"], input, select, textarea, label, [draggable="true"]';

export const CursorEffects: React.FC = () => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let rafId = 0;
    let activeCard: HTMLElement | null = null;
    let targetX = -999;
    let targetY = -999;
    let smoothX = -999;
    let smoothY = -999;
    let ringX = -999;
    let ringY = -999;
    let visible = false;
    let hoveringInteractive = false;
    let pressing = false;

    const clearActiveCard = () => {
      if (activeCard) {
        activeCard.removeAttribute('data-cursor-glow');
        activeCard.style.removeProperty('--mx');
        activeCard.style.removeProperty('--my');
        activeCard = null;
      }
    };

    const syncStyles = () => {
      rafId = 0;
      const spotlight = spotlightRef.current;
      const ring = ringRef.current;

      if (!visible) {
        if (spotlight) spotlight.style.opacity = '0';
        if (ring) ring.style.opacity = '0';
        return;
      }

      smoothX += (targetX - smoothX) * 0.22;
      smoothY += (targetY - smoothY) * 0.22;
      ringX += (targetX - ringX) * 0.34;
      ringY += (targetY - ringY) * 0.34;

      if (spotlight) {
        spotlight.style.opacity = hoveringInteractive ? '0.95' : '0.78';
        spotlight.style.transform = `translate3d(${smoothX - 144}px, ${smoothY - 144}px, 0) scale(${
          pressing ? 0.9 : hoveringInteractive ? 1.12 : 1
        })`;
      }

      if (ring) {
        const scale = pressing ? 0.8 : hoveringInteractive ? 1.45 : 1;
        ring.style.opacity = '1';
        ring.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0) scale(${scale})`;
        ring.dataset.interactive = hoveringInteractive ? 'true' : 'false';
      }

      if (
        Math.abs(targetX - smoothX) > 0.4 ||
        Math.abs(targetY - smoothY) > 0.4 ||
        Math.abs(targetX - ringX) > 0.4 ||
        Math.abs(targetY - ringY) > 0.4
      ) {
        rafId = window.requestAnimationFrame(syncStyles);
      }
    };

    const scheduleSync = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(syncStyles);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        visible = false;
        clearActiveCard();
        scheduleSync();
        return;
      }

      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        smoothX = targetX;
        smoothY = targetY;
        ringX = targetX;
        ringY = targetY;
        visible = true;
      }

      const targetEl = e.target as Element | null;
      hoveringInteractive = Boolean(targetEl && typeof targetEl.closest === 'function' && targetEl.closest(INTERACTIVE_SELECTOR));

      const card =
        targetEl && typeof targetEl.closest === 'function'
          ? (targetEl.closest('.glass-card') as HTMLElement | null)
          : null;

      if (card !== activeCard) {
        clearActiveCard();
        activeCard = card;
      }
      if (activeCard && typeof activeCard.getBoundingClientRect === 'function') {
        const rect = activeCard.getBoundingClientRect();
        activeCard.setAttribute('data-cursor-glow', 'true');
        activeCard.style.setProperty('--mx', `${Math.round(e.clientX - rect.left)}px`);
        activeCard.style.setProperty('--my', `${Math.round(e.clientY - rect.top)}px`);
      }

      scheduleSync();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pressing = true;
      scheduleSync();
    };

    const onPointerUp = () => {
      if (!pressing) return;
      pressing = false;
      scheduleSync();
    };

    const onPointerLeave = () => {
      visible = false;
      pressing = false;
      hoveringInteractive = false;
      clearActiveCard();
      scheduleSync();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave, { passive: true });
    window.addEventListener('blur', onPointerLeave, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      clearActiveCard();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('mouseleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      data-testid="cursor-effects-layer"
      className="fixed inset-0 pointer-events-none overflow-hidden z-[45] select-none"
    >
      {/* Pre-feathered Smooth Cursor Spotlight */}
      <div
        ref={spotlightRef}
        className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-0 transition-opacity duration-200 will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(56,189,248,0.14) 0%, rgba(139,92,246,0.11) 34%, rgba(79,70,229,0.04) 58%, transparent 74%)',
        }}
      />

      {/* Spring-Lagged Magnetic Orbital Halo Ring */}
      <div
        ref={ringRef}
        data-interactive="false"
        className="cursor-orbital-ring absolute top-0 left-0 w-9 h-9 rounded-full border border-[#38BDF8]/45 opacity-0 transition-[opacity,border-color,box-shadow] duration-200 will-change-transform"
      >
        <span className="cursor-orbit-spin absolute inset-0 rounded-full">
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.95)]" />
        </span>
      </div>
    </div>
  );
};
