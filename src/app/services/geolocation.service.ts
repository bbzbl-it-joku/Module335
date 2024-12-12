import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private readonly defaultLocation = {
    latitude: 47.50883689268351,
    longitude: 7.616181101716506
  };

  async getCurrentPosition() {
    try {
      if (Capacitor.isNativePlatform()) {
        return await this.getNativeLocation();
      } else {
        return await this.getPwaLocation();
      }
    } catch (error) {
      return this.defaultLocation;
    }
  }

  private async getPwaLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(this.defaultLocation);
        return;
      }

      // Try high accuracy first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          // If high accuracy fails, try again with low accuracy
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (finalError) => {
              resolve(this.defaultLocation);
            },
            {
              enableHighAccuracy: false,  // Try without high accuracy
              timeout: 20000,             // Longer timeout
              maximumAge: 300000          // Accept positions up to 5 minutes old
            }
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  private async getNativeLocation() {
    try {
      // Try high accuracy first
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch (error) {
        // If high accuracy fails, try with lower accuracy
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 300000
        });
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      }
    } catch (error) {
      return this.defaultLocation;
    }
  }

  getApiKey() {
    if (!environment.googleMapsApiKey) {
      throw new Error('Google Maps API key is missing');
    }
    return environment.googleMapsApiKey;
  }

  isDefaultLocation(location: { latitude: number; longitude: number }): boolean {
    return location.latitude === this.defaultLocation.latitude &&
           location.longitude === this.defaultLocation.longitude;
  }
}
