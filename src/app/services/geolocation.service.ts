import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  async getCurrentPosition() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const address = await this.getAddressFromCoordinates(position.coords.latitude, position.coords.longitude);

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw new Error('Unable to get current location');
    }
  }

  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${environment.googleMapsApiKey}`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        return data.results[0].formatted_address;
      }
      return '';
    } catch (error) {
      console.error('Error getting address:', error);
      return '';
    }
  }
}
