import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import { getProfile as getProfileFromStore, setProfile, subscribe, clearProfile, hasCachedProfile } from '../services/profileStore';
import { getProfile as fetchProfile } from '../api';
import { getToken, subscribe as subscribeToToken } from '../services/tokenStore';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profile, setProfileState] = useState(getProfileFromStore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);

  const loadProfileForToken = useCallback(async () => {
    if (loadingRef.current) return; // Evitar múltiples cargas simultáneas

    const currentToken = getToken();
    if (!currentToken) {
      console.log('No token available, skipping profile load');
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('Loading profile with token:', currentToken.substring(0, 20) + '...');
      const profileData = await fetchProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error loading profile after token change:', err);
      setError(err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Suscribirse a cambios en el store del perfil
    const unsubscribeProfile = subscribe((newProfile) => {
      setProfileState(newProfile);
    });

    // Suscribirse a cambios en el token para cargar perfil automáticamente
    const unsubscribeToken = subscribeToToken((token) => {
      console.log('Token changed in ProfileContext:', token ? 'present' : 'null');
      if (token) {
        // Si hay token, cargar perfil después de un pequeño delay para asegurar que se aplique
        setTimeout(() => {
          loadProfileForToken();
        }, 50);
      } else {
        // Si no hay token, limpiar perfil
        clearProfile();
      }
    });

    // Cargar perfil inicial si hay token
    const initialToken = getToken();
    if (initialToken) {
      console.log('Initial token found, loading profile');
      setTimeout(() => {
        loadProfileForToken();
      }, 100);
    }

    return () => {
      unsubscribeProfile();
      unsubscribeToken();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // loadProfileForToken es estable, no necesitamos incluirlo

  const loadProfile = async (force = false) => {
    // Si no hay token, no intentar cargar
    if (!getToken()) {
      return null;
    }

    // Si no se fuerza y tenemos un perfil cacheado, devolver el cacheado
    if (!force && hasCachedProfile()) {
      return profile;
    }

    return loadProfileForToken();
  };

  const updateProfile = (newProfile) => {
    setProfile(newProfile);
  };

  const clearProfileData = () => {
    clearProfile();
  };

  const value = {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile,
    clearProfile: clearProfileData,
    hasCachedProfile: hasCachedProfile(),
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export { ProfileContext };
