let profile = null;
const listeners = new Set();
const PROFILE_STORAGE_KEY = 'kalo_profile';

// Cargar perfil desde localStorage al inicializar
try {
  const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (stored) {
    profile = JSON.parse(stored);
  }
} catch (error) {
  console.warn('Error loading profile from localStorage:', error);
}

export function getProfile() {
  return profile;
}

export function setProfile(next) {
  profile = next || null;

  try {
    if (profile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Error saving profile to localStorage:', error);
  }

  listeners.forEach(l => l(profile));
}

export function clearProfile() {
  profile = null;
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    console.warn('Error clearing profile from localStorage:', error);
  }
  listeners.forEach(l => l(null));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Función helper para verificar si el perfil está cacheado
export function hasCachedProfile() {
  return profile !== null;
}
