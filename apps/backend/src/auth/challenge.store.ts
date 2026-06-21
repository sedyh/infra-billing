import { Injectable } from '@nestjs/common';

type Kind = 'register' | 'login';
type Entry = { challenge: string; expires: number };

const TTL_MS = 60_000;

// In-memory, single-instance WebAuthn challenge store. The panel is single-user and runs as one
// process, so a process-local map keyed by ceremony kind is enough. Challenges are one-shot
// (deleted on read → anti-replay) and short-lived; loss on restart just means re-running the
// ceremony.
@Injectable()
export class ChallengeStore {
  private readonly store = new Map<Kind, Entry>();

  put(kind: Kind, challenge: string): void {
    this.store.set(kind, { challenge, expires: Date.now() + TTL_MS });
  }

  /** Return the challenge and remove it, or null if missing/expired. */
  take(kind: Kind): string | null {
    const entry = this.store.get(kind);
    this.store.delete(kind);
    if (!entry || entry.expires < Date.now()) return null;
    return entry.challenge;
  }
}
