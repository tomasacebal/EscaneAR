const pendingWriteKey = 'escanear:pending-writes';

/**
 * Escritura pendiente registrada para feedback local mientras Workbox sincroniza.
 *
 * Args:
 *   id: Identificador local unico.
 *   endpoint: Endpoint de API afectado.
 *   method: Metodo HTTP encolado.
 *   payload: Cuerpo enviado al backend.
 *   createdAt: Fecha ISO de creacion.
 *
 * Returns:
 *   No aplica.
 */
export interface PendingWrite {
  id: string;
  endpoint: string;
  method: 'POST';
  payload: unknown;
  createdAt: string;
}

function isPendingWrite(value: unknown): value is PendingWrite {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.endpoint === 'string' &&
    candidate.method === 'POST' &&
    typeof candidate.createdAt === 'string'
  );
}

/**
 * Lee escrituras pendientes desde almacenamiento local.
 *
 * Args:
 *   Ninguno.
 *
 * Returns:
 *   Lista de escrituras pendientes validas.
 */
export function readPendingWrites(): PendingWrite[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(pendingWriteKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isPendingWrite) : [];
  } catch {
    return [];
  }
}

/**
 * Registra una escritura pendiente para mostrar feedback offline.
 *
 * Args:
 *   endpoint: Endpoint de API afectado.
 *   payload: Cuerpo enviado al backend.
 *
 * Returns:
 *   Escritura pendiente creada.
 */
export function registerPendingWrite(endpoint: string, payload: unknown): PendingWrite {
  const pendingWrite: PendingWrite = {
    id: crypto.randomUUID(),
    endpoint,
    method: 'POST',
    payload,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const nextWrites = [pendingWrite, ...readPendingWrites()].slice(0, 50);
    window.localStorage.setItem(pendingWriteKey, JSON.stringify(nextWrites));
  }

  return pendingWrite;
}

/**
 * Limpia escrituras pendientes visibles en la UI.
 *
 * Args:
 *   Ninguno.
 *
 * Returns:
 *   No retorna valor.
 */
export function clearPendingWrites(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(pendingWriteKey);
  }
}
