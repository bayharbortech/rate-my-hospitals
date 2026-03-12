export function hapticLight() { navigator?.vibrate?.(10); }
export function hapticMedium() { navigator?.vibrate?.(25); }
export function hapticSuccess() { navigator?.vibrate?.([15, 50, 30]); }
