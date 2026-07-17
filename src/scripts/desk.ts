const objectIds = [
  'intro',
  'avatar',
  'cat',
  'alarm',
  'incident',
  'python-cake',
  'birthday-calendar',
  'things-i-made',
] as const;

type Breakpoint = 'mobile' | 'tablet' | 'desktop';
type Spot = readonly [x: number, y: number, rotation: number];
type Preset = readonly Spot[];

const dragDemoSeenKey = 'socram-desk-drag-demo-seen-v2';

const presets: Record<Breakpoint, readonly Preset[]> = {
  desktop: [
    [
      [0.03, 0.04, -3],
      [0.4, 0.04, 2],
      [0.78, 0.07, 5],
      [0.04, 0.6, -5],
      [0.3, 0.52, 3],
      [0.55, 0.55, -2],
      [0.82, 0.7, 4],
      [0.67, 0.77, -2],
    ],
    [
      [0.34, 0.04, 2],
      [0.73, 0.05, -4],
      [0.02, 0.1, -2],
      [0.82, 0.6, 5],
      [0.56, 0.5, -3],
      [0.3, 0.66, 3],
      [0.04, 0.63, -4],
      [0.58, 0.8, 2],
    ],
    [
      [0.58, 0.05, -2],
      [0.03, 0.05, 3],
      [0.38, 0.08, -5],
      [0.36, 0.68, 4],
      [0.04, 0.55, -2],
      [0.78, 0.6, 2],
      [0.61, 0.52, -4],
      [0.12, 0.82, 2],
    ],
  ],
  tablet: [
    [
      [0.04, 0.03, -2],
      [0.72, 0.03, 3],
      [0.06, 0.29, 4],
      [0.72, 0.29, -4],
      [0.04, 0.64, 2],
      [0.7, 0.51, -3],
      [0.08, 0.88, -2],
      [0.62, 0.82, 2],
    ],
    [
      [0.54, 0.03, 2],
      [0.05, 0.03, -3],
      [0.67, 0.28, -4],
      [0.04, 0.31, 4],
      [0.57, 0.62, -2],
      [0.06, 0.54, 3],
      [0.7, 0.86, 3],
      [0.05, 0.82, -2],
    ],
    [
      [0.08, 0.04, 3],
      [0.68, 0.05, -2],
      [0.08, 0.29, -3],
      [0.72, 0.3, 4],
      [0.04, 0.64, -2],
      [0.68, 0.52, 3],
      [0.08, 0.88, 2],
      [0.6, 0.82, -3],
    ],
  ],
  mobile: [
    [
      [0.05, 0.02, -2],
      [0.82, 0.16, 2],
      [0.08, 0.33, 3],
      [0.78, 0.47, -3],
      [0.04, 0.58, 2],
      [0.75, 0.7, -2],
      [0.08, 0.82, 2],
      [0.62, 0.93, -2],
    ],
    [
      [0.65, 0.03, 2],
      [0.05, 0.17, -2],
      [0.78, 0.34, -3],
      [0.05, 0.46, 3],
      [0.68, 0.59, -2],
      [0.05, 0.71, 2],
      [0.7, 0.83, -2],
      [0.05, 0.92, 2],
    ],
    [
      [0.04, 0.02, 1],
      [0.72, 0.15, -3],
      [0.05, 0.32, 2],
      [0.74, 0.48, -2],
      [0.05, 0.57, 3],
      [0.74, 0.69, -3],
      [0.04, 0.81, 2],
      [0.64, 0.93, -2],
    ],
  ],
};

export const isBirthday = (date: Date): boolean =>
  date.getMonth() === 8 && date.getDate() === 28;

const getBreakpoint = (): Breakpoint => {
  if (window.innerWidth < 640) return 'mobile';
  if (window.innerWidth < 960) return 'tablet';
  return 'desktop';
};

const setPosition = (element: HTMLElement, x: number, y: number, rotation: number): void => {
  element.dataset.x = String(x);
  element.dataset.y = String(y);
  element.dataset.rotation = String(rotation);
  element.style.setProperty('--desk-x', `${x}px`);
  element.style.setProperty('--desk-y', `${y}px`);
  element.style.setProperty('--desk-r', `${rotation}deg`);
};

const clampPosition = (
  desk: HTMLElement,
  element: HTMLElement,
  x: number,
  y: number,
): readonly [number, number] => {
  const maxX = Math.max(0, desk.clientWidth - element.offsetWidth);
  const maxY = Math.max(0, desk.clientHeight - element.offsetHeight);
  return [Math.min(Math.max(0, x), maxX), Math.min(Math.max(0, y), maxY)];
};

const setupDesk = (): void => {
  const desk = document.querySelector<HTMLElement>('[data-desk]');
  if (!desk) return;

  document.documentElement.classList.add('desk-enhanced');

  const objects = objectIds
    .map((id) => desk.querySelector<HTMLElement>(`[data-desk-object="${id}"]`))
    .filter((element): element is HTMLElement => element !== null);

  if (objects.length !== objectIds.length) return;

  let breakpoint = getBreakpoint();
  let currentPreset = Math.floor(Math.random() * presets[breakpoint].length);
  const initialPreset = currentPreset;
  let topZ = 20;
  let resizeFrame = 0;
  let deskInteracted = false;

  desk.addEventListener(
    'pointerdown',
    () => {
      deskInteracted = true;
    },
    { capture: true, once: true },
  );

  const bringToFront = (element: HTMLElement): void => {
    topZ += 1;
    element.style.zIndex = String(topZ);
  };

  const applyPreset = (index: number, announce = false): void => {
    const layout = presets[breakpoint][index];
    if (!layout) return;

    objects.forEach((element, objectIndex) => {
      const spot = layout[objectIndex];
      if (!spot) return;
      const [xRatio, yRatio, rotation] = spot;
      const maxX = Math.max(0, desk.clientWidth - element.offsetWidth);
      const maxY = Math.max(0, desk.clientHeight - element.offsetHeight);
      setPosition(element, maxX * xRatio, maxY * yRatio, rotation);
    });

    currentPreset = index;
    desk.dataset.preset = String(index);

    if (announce) {
      const status = document.querySelector<HTMLElement>('[data-desk-status]');
      if (status) status.textContent = index === initialPreset ? 'Desk reset.' : 'Desk shuffled.';
    }
  };

  const runDragDemo = (): void => {
    const dragDemo = desk.querySelector<HTMLElement>('[data-drag-demo]');
    const dragDemoLabel = dragDemo?.querySelector<HTMLElement>('[data-drag-demo-label]');
    if (!dragDemo || !dragDemoLabel) return;

    try {
      if (window.localStorage.getItem(dragDemoSeenKey)) return;
      window.localStorage.setItem(dragDemoSeenKey, 'true');
    } catch {
      // Storage can be unavailable in privacy modes; the hint can still run for this load.
    }

    if (deskInteracted) return;

    const preferredTargets = ['avatar', 'intro', 'cat']
      .map((id) => objects.find((element) => element.dataset.deskObject === id))
      .filter((element): element is HTMLElement => element !== undefined);
    const target =
      preferredTargets.find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      }) ?? preferredTargets[0];
    if (!target) return;

    const startX = Number(target.dataset.x ?? 0);
    const startY = Number(target.dataset.y ?? 0);
    const availableRight = desk.clientWidth - startX - target.offsetWidth;
    const direction = availableRight >= startX ? 1 : -1;
    const requestedDistance = breakpoint === 'mobile' ? 40 : 64;
    const availableDistance = direction > 0 ? availableRight : startX;
    const distance = Math.max(24, Math.min(requestedDistance, availableDistance));
    const requestedY = startY + (desk.clientHeight - startY - target.offsetHeight > 32 ? 24 : -24);
    const [targetX, targetY] = clampPosition(
      desk,
      target,
      startX + direction * distance,
      requestedY,
    );
    const pointerStartX = startX + Math.min(target.offsetWidth * 0.58, target.offsetWidth - 24);
    const pointerStartY = startY + 8;
    const pointerTargetX = pointerStartX + (targetX - startX);
    const pointerTargetY = pointerStartY + (targetY - startY);
    const timers: number[] = [];

    const dismissDemo = (): void => {
      timers.forEach((timer) => window.clearTimeout(timer));
      desk.classList.remove('is-demo-active');
      target.classList.remove('is-demo-dragging', 'is-demo-target');
      dragDemo.classList.remove('is-grabbing', 'is-label-left', 'is-visible');
      desk.removeEventListener('pointerdown', dismissDemo, { capture: true });
      window.setTimeout(() => {
        dragDemo.hidden = true;
      }, 220);
    };

    bringToFront(target);
    desk.classList.add('is-demo-active');
    target.classList.add('is-demo-target');
    dragDemoLabel.textContent = 'grab the header';
    dragDemo.style.setProperty('--demo-x', `${pointerStartX}px`);
    dragDemo.style.setProperty('--demo-y', `${pointerStartY}px`);
    dragDemo.hidden = false;
    dragDemo.classList.toggle(
      'is-label-left',
      pointerStartX + dragDemo.offsetWidth > desk.clientWidth - 8,
    );
    desk.addEventListener('pointerdown', dismissDemo, { capture: true, once: true });

    window.requestAnimationFrame(() => {
      dragDemo.classList.add('is-visible');
    });

    const status = document.querySelector<HTMLElement>('[data-desk-status]');
    if (status) status.textContent = 'Cards can be dragged by their header.';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dragDemoLabel.textContent = 'drag cards by the header';
      timers.push(window.setTimeout(dismissDemo, 3200));
      return;
    }

    timers.push(
      window.setTimeout(() => {
        target.classList.add('is-demo-dragging');
        dragDemo.classList.add('is-grabbing');

        window.requestAnimationFrame(() => {
          setPosition(target, targetX, targetY, Number(target.dataset.rotation ?? 0));
          dragDemo.style.setProperty('--demo-x', `${pointerTargetX}px`);
          dragDemo.style.setProperty('--demo-y', `${pointerTargetY}px`);
        });
      }, 900),
      window.setTimeout(() => {
        target.classList.remove('is-demo-dragging');
        dragDemo.classList.remove('is-grabbing');
        dragDemoLabel.textContent = 'now you try';
      }, 2150),
      window.setTimeout(dismissDemo, 3300),
    );
  };

  objects.forEach((element) => {
    const handle = element.querySelector<HTMLElement>('[data-drag-handle]');
    if (!handle) return;

    element.addEventListener('pointerdown', () => bringToFront(element), { capture: true });

    let pointerId = -1;
    let startPointerX = 0;
    let startPointerY = 0;
    let startObjectX = 0;
    let startObjectY = 0;
    let dragging = false;

    const finishDrag = (): void => {
      if (pointerId < 0) return;
      if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
      if (dragging) {
        element.dataset.didDrag = 'true';
        window.setTimeout(() => delete element.dataset.didDrag, 0);
      }
      element.classList.remove('is-dragging');
      pointerId = -1;
      dragging = false;
    };

    handle.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      pointerId = event.pointerId;
      startPointerX = event.clientX;
      startPointerY = event.clientY;
      startObjectX = Number(element.dataset.x ?? 0);
      startObjectY = Number(element.dataset.y ?? 0);
      handle.setPointerCapture(pointerId);
    });

    handle.addEventListener('pointermove', (event) => {
      if (event.pointerId !== pointerId) return;
      const deltaX = event.clientX - startPointerX;
      const deltaY = event.clientY - startPointerY;

      if (!dragging && Math.hypot(deltaX, deltaY) < 7) return;
      if (!dragging) {
        dragging = true;
        element.classList.add('is-dragging');
      }

      event.preventDefault();
      const [x, y] = clampPosition(desk, element, startObjectX + deltaX, startObjectY + deltaY);
      setPosition(element, x, y, Number(element.dataset.rotation ?? 0));
    });

    handle.addEventListener('pointerup', finishDrag);
    handle.addEventListener('pointercancel', finishDrag);
  });

  document.querySelector<HTMLButtonElement>('[data-shuffle]')?.addEventListener('click', () => {
    const candidates = presets[breakpoint]
      .map((_, index) => index)
      .filter((index) => index !== currentPreset);
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    if (next !== undefined) applyPreset(next, true);
  });

  document.querySelector<HTMLButtonElement>('[data-reset]')?.addEventListener('click', () => {
    applyPreset(initialPreset, true);
  });

  const avatar = document.querySelector<HTMLElement>('[data-avatar-card]');
  const avatarToggle = document.querySelector<HTMLButtonElement>('[data-avatar-toggle]');
  const avatarFront = document.querySelector<HTMLElement>('[data-avatar-front]');
  const avatarBack = document.querySelector<HTMLElement>('[data-avatar-back]');

  avatarToggle?.addEventListener('click', () => {
    if (!avatar) return;
    const expanded = avatarToggle.getAttribute('aria-expanded') === 'true';
    avatar.classList.toggle('is-flipped', !expanded);
    avatarToggle.setAttribute('aria-expanded', String(!expanded));
    avatarToggle.textContent = expanded ? 'flip card' : 'show front';
    avatarFront?.setAttribute('aria-hidden', String(!expanded));
    avatarBack?.setAttribute('aria-hidden', String(expanded));
  });

  const catPhrases = [
    'busy procrastinating',
    'pretending to debug',
    'still procrastinating',
    'blaming type inference',
    'reading the same error again',
    'one tiny refactor away',
    'waiting for autocomplete',
    'absolutely not using any',
    'asking the compiler nicely',
  ] as const;
  const catPhrase = document.querySelector<HTMLElement>('[data-cat-phrase]');
  let catPhraseIndex = Math.floor(Math.random() * catPhrases.length);

  if (catPhrase) {
    catPhrase.textContent = catPhrases[catPhraseIndex];
  }

  document.querySelector<HTMLButtonElement>('[data-cat-toggle]')?.addEventListener('click', () => {
    if (!catPhrase) return;
    catPhraseIndex = (catPhraseIndex + 1) % catPhrases.length;
    catPhrase.textContent = catPhrases[catPhraseIndex];
    catPhrase.classList.remove('is-changing');
    void catPhrase.offsetWidth;
    catPhrase.classList.add('is-changing');
  });

  const incidentToggle = document.querySelector<HTMLButtonElement>('[data-incident-toggle]');
  const incidentCopy = document.querySelector<HTMLElement>('[data-incident-copy]');

  incidentToggle?.addEventListener('click', () => {
    if (!incidentCopy) return;
    const resolved = incidentToggle.getAttribute('aria-pressed') === 'true';
    incidentToggle.setAttribute('aria-pressed', String(!resolved));
    incidentCopy.textContent = resolved ? 'oh god, i hate frontend' : 'status: XD';
    incidentCopy.classList.remove('is-changing');
    void incidentCopy.offsetWidth;
    incidentCopy.classList.add('is-changing');
  });

  const folder = document.querySelector<HTMLElement>('[data-project-folder]');
  const folderToggle = document.querySelector<HTMLButtonElement>('[data-folder-toggle]');
  const projectList = document.querySelector<HTMLElement>('[data-project-list]');

  const setFolderOpen = (open: boolean): void => {
    if (!folder || !folderToggle || !projectList) return;
    folder.classList.toggle('is-open', open);
    folderToggle.setAttribute('aria-expanded', String(open));
    folderToggle.textContent = open ? 'close dossier' : 'open dossier';
    projectList.setAttribute('aria-hidden', String(!open));
    projectList.inert = !open;
    if (open) bringToFront(folder);
  };

  setFolderOpen(false);
  folderToggle?.addEventListener('click', () => {
    setFolderOpen(folderToggle.getAttribute('aria-expanded') !== 'true');
  });

  const calendar = document.querySelector<HTMLElement>('[data-calendar]');
  const calendarDate = document.querySelector<HTMLElement>('[data-calendar-date]');
  const calendarMessage = document.querySelector<HTMLElement>('[data-calendar-message]');

  if (calendar && calendarDate && calendarMessage && isBirthday(new Date())) {
    calendar.classList.add('is-birthday');
    calendarDate.hidden = true;
    calendarMessage.textContent = 'birthday mode: activated';
  }

  const helpDialog = document.querySelector<HTMLDialogElement>('[data-help-dialog]');
  const helpOpen = document.querySelector<HTMLButtonElement>('[data-help-open]');

  const closeHelp = (): void => {
    if (helpDialog?.open) helpDialog.close();
  };

  helpOpen?.addEventListener('click', () => {
    if (!helpDialog) return;
    helpDialog.showModal();
    helpOpen.setAttribute('aria-expanded', 'true');
  });

  document.querySelector<HTMLButtonElement>('[data-help-close]')?.addEventListener('click', closeHelp);
  helpDialog?.addEventListener('close', () => helpOpen?.setAttribute('aria-expanded', 'false'));
  helpDialog?.addEventListener('click', (event) => {
    if (event.target === helpDialog) closeHelp();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setFolderOpen(false);
    closeHelp();
  });

  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      const nextBreakpoint = getBreakpoint();
      if (nextBreakpoint !== breakpoint) {
        breakpoint = nextBreakpoint;
        applyPreset(currentPreset);
        return;
      }

      objects.forEach((element) => {
        const [x, y] = clampPosition(
          desk,
          element,
          Number(element.dataset.x ?? 0),
          Number(element.dataset.y ?? 0),
        );
        setPosition(element, x, y, Number(element.dataset.rotation ?? 0));
      });
    });
  });

  applyPreset(currentPreset);
  window.setTimeout(runDragDemo, 650);
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDesk, { once: true });
  } else {
    setupDesk();
  }
}
