import { NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { GoogleMap } from '@capacitor/google-maps';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonSpinner, IonTitle, IonToolbar, ModalController } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { closeOutline, locateOutline } from 'ionicons/icons';
import { Location } from 'src/app/models';
import { LocationService } from 'src/app/services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-select-location',
  templateUrl: './select-location.component.html',
  styleUrls: ['./select-location.component.scss'],
  standalone: true,
  imports: [NgIf, IonToolbar, IonTitle, IonButtons, IonIcon, IonContent, IonButton, IonSpinner, IonHeader, NgIf]
})
export class SelectLocationComponent implements OnInit, AfterViewInit {
  @ViewChild('map') mapRef!: ElementRef;
  @Input() initialLocation?: Location;
  @Input() reportId!: string;

  private map!: GoogleMap;
  private marker?: string;
  selectedLocation: Partial<Location> | null = null;
  currentAddress: string = '';
  isLoading = false;
  private mapInitialized = false;

  constructor(
    private modalCtrl: ModalController,
    private locationService: LocationService,
    private changeDetector: ChangeDetectorRef
  ) {
    addIcons({ closeOutline, locateOutline });
  }

  async ngOnInit() {
    // Only initialize basic component state here
    if (this.initialLocation) {
      this.selectedLocation = {
        latitude: this.initialLocation.latitude,
        longitude: this.initialLocation.longitude
      };
    }
  }

  async ngAfterViewInit() {
    try {
      await this.initializeMap();

      if (this.initialLocation) {
        await this.setLocation(this.initialLocation.latitude, this.initialLocation.longitude);
      } else {
        await this.getCurrentLocation();
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private async initializeMap() {
    if (this.mapInitialized) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure DOM is ready

      this.map = await GoogleMap.create({
        id: 'map',
        element: this.mapRef.nativeElement,
        apiKey: environment.googleMapsApiKey,
        config: {
          center: {
            lat: 0,
            lng: 0
          },
          zoom: 15,
          clickableIcons: false,
          disableDefaultUI: true
        }
      });

      // Add click listener
      await this.map.setOnMapClickListener(async (event) => {
        console.log('Map clicked:', event);
        await this.setLocation(event.latitude, event.longitude);
      });

      this.mapInitialized = true;
    } catch (error) {
      console.error('Error creating map:', error);
      throw error;
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
    if (!this.mapInitialized) {
      console.warn('Map not initialized yet');
      return;
    }

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
          // Trigger change detection
          this.changeDetector.detectChanges();
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
      // Return the location data without saving it
      this.modalCtrl.dismiss({
        latitude: this.selectedLocation.latitude!,
        longitude: this.selectedLocation.longitude!,
        extraData: { address: this.currentAddress }
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
