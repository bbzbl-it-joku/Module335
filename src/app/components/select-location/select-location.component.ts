import { Component, OnInit } from '@angular/core';
import { IonHeader, IonSpinner, IonButton, IonContent, IonIcon, IonButtons, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { ElementRef, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Location } from 'src/app/models';
import { GeolocationService, LocationService } from 'src/app/services';
import { Geolocation } from '@capacitor/geolocation';
import { addIcons } from 'ionicons';
import { closeOutline, locateOutline } from 'ionicons/icons';
import { NgIf } from '@angular/common';
import { environment } from 'src/environments/environment';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { CapacitorGoogleMaps } from '@capacitor/google-maps/dist/typings/implementation';

@Component({
  selector: 'app-select-location',
  templateUrl: './select-location.component.html',
  styleUrls: ['./select-location.component.scss'],
  standalone: true,
  imports: [IonToolbar, IonTitle, IonButtons, IonIcon, IonContent, IonButton, IonSpinner, IonHeader, NgIf]
})
export class SelectLocationComponent  implements OnInit {@ViewChild('map') mapRef!: ElementRef;
  @Input() initialLocation?: Location;
  @Input() reportId!: string;

  private map!: GoogleMap;
  private marker?: string;
  selectedLocation: Partial<Location> | null = null;
  currentAddress: string = '';
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private locationService: LocationService
  ) {
    addIcons({ closeOutline, locateOutline });
  }

  async ngOnInit() {
    await this.createMap();
    if (this.initialLocation) {
      await this.setLocation(this.initialLocation.latitude, this.initialLocation.longitude);
    } else {
      await this.getCurrentLocation();
    }
  }

  async createMap() {
    try {
      this.map = await GoogleMap.create({
        id: 'map',
        element: this.mapRef.nativeElement,
        apiKey: environment.googleMapsApiKey,
        config: {
          center: {
            lat: 0,
            lng: 0
          },
          zoom: 15
        }
      });

      // Add click listener
      await this.map.setOnMapClickListener(async (event) => {
        await this.setLocation(event.latitude, event.longitude);
      });

    } catch (error) {
      console.error('Error creating map:', error);
    }
  }

  async getCurrentLocation() {
    try {
      this.isLoading = true;
      const position = await Geolocation.getCurrentPosition();
      await this.setLocation(position.coords.latitude, position.coords.longitude);
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async setLocation(latitude: number, longitude: number) {
    try {
      // Remove existing marker if any
      if (this.marker) {
        await this.map.removeMarker(this.marker);
      }

      // Add new marker
      this.marker = await this.map.addMarker({
        coordinate: {
          lat: latitude,
          lng: longitude
        },
        draggable: true
      });

      // Center the map
      await this.map.setCamera({
        coordinate: {
          lat: latitude,
          lng: longitude
        }
      });

      // Update selected location
      this.selectedLocation = {
        reportId: this.reportId,
        latitude,
        longitude,
        extraData: {}
      };

      // Get address
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${environment.googleMapsApiKey}`
        );
        const data = await response.json();

        if (data.results && data.results[0]) {
          this.currentAddress = data.results[0].formatted_address;
        }
      } catch (error) {
        console.error('Error getting address:', error);
      }

      // Add marker drag listener
      await this.map.setOnMarkerDragEndListener(async (event: { latitude: number; longitude: number; }) => {
        await this.setLocation(event.latitude, event.longitude);
      });

    } catch (error) {
      console.error('Error setting location:', error);
    }
  }

  async confirmLocation() {
    if (this.selectedLocation) {
      if (this.initialLocation?.id) {
        // Update existing location
        await this.locationService.update(this.initialLocation.id, {
          ...this.selectedLocation,
          extraData: { ...this.selectedLocation.extraData, address: this.currentAddress }
        });
      } else {
        // Create new location
        await this.locationService.create({
          reportId: this.reportId,
          latitude: this.selectedLocation?.latitude!,
          longitude: this.selectedLocation?.longitude!,
          extraData: { ...this.selectedLocation?.extraData, address: this.currentAddress }
        });
      }

      this.modalCtrl.dismiss({
        ...this.selectedLocation,
        extraData: { ...this.selectedLocation.extraData, address: this.currentAddress }
      });
    }
  }

  async dismiss() {
    this.modalCtrl.dismiss();
  }

  async ngOnDestroy() {
    if (this.map) {
      await this.map.destroy();
    }
  }
}
