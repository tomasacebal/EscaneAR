type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

/**
 * Ejecuta una mutacion visual usando View Transitions si esta disponible.
 *
 * Args:
 *   callback: Cambio de estado que produce la transicion.
 *
 * Returns:
 *   No retorna valor.
 */
export function runViewTransition(callback: () => void): void {
  const transitionDocument = document as ViewTransitionDocument;
  if (transitionDocument.startViewTransition) {
    transitionDocument.startViewTransition(callback);
    return;
  }

  callback();
}
