const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) {
    throw new Error(`${name} must be a positive integer`)
  }
}

export function assertUuid(value: string, name: string): void {
  if (!UUID_REGEX.test(value)) {
    throw new Error(`${name} must be a valid UUID`)
  }
}

export function assertMaxLength(value: string, max: number, name: string): void {
  if (value.length > max) {
    throw new Error(`${name} must be at most ${max} characters`)
  }
}

/** 値が許可リストに含まれることを検証する */
export function assertOneOf(
  value: string,
  allowed: ReadonlySet<string>,
  name: string,
): void {
  if (!allowed.has(value)) {
    throw new Error(`${name} is not a valid value`)
  }
}
