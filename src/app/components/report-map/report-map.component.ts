import { Component, OnInit } from "@angular/core";
import { GoogleMap } from "@capacitor/google-maps";
import { GeolocationService, ReportService, ToastService } from "src/app/services";

@Component({
  selector: 'app-report-map',
  templateUrl: './report-map.component.html',
  styleUrls: ['./report-map.component.scss'],
  standalone: true,
})
export class ReportMapComponent implements OnInit {
  private map!: GoogleMap;

  constructor(
    private geolocationService: GeolocationService,
    private reportService: ReportService,
    private toastService: ToastService,
  ) {}

  async ngOnInit() {
    await this.setupMap();
  }

  ngAfterViewInit() {
    // Give extra time for layout to settle
    setTimeout(async () => {
      await this.setupMap();
    }, 500);
  }

  private async setupMap() {
    try {
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        throw new Error('Map element not found');
      }

      // Force layout calculation
      const height = mapElement.clientHeight;
      if (height === 0) {
        console.warn('Map container has zero height, waiting for layout...');
        return;
      }

      console.log('Setting up map with container dimensions:', {
        width: mapElement.clientWidth,
        height: mapElement.clientHeight
      });

      // Get location with default fallback
      const location = await this.geolocationService.getCurrentPosition() ?? {
        latitude: 47.47221941974559,
        longitude: 7.785790053175054
      };

      // Create map
      this.map = await GoogleMap.create({
        id: 'map',
        element: mapElement,
        apiKey: this.geolocationService.getApiKey(),
        config: {
          center: {
            lat: location.latitude,
            lng: location.longitude
          },
          zoom: 14,
          disableDefaultUI: false,
        },
        forceCreate: true
      });

      // Add marker for current location
      await this.map.addMarker({
        coordinate: {
          lat: location.latitude,
          lng: location.longitude
        },
        title: 'Your location'
      });

      // Force refresh after a short delay
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 200);

    } catch (error) {
      console.error('Error setting up map:', error);
      this.toastService.presentToast('Failed to initialize map', 'danger');
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.destroy();
    }
  }
}
