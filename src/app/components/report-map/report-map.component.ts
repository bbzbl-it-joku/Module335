import { Component, OnInit } from "@angular/core";
import { GoogleMap } from "@capacitor/google-maps";
import { Location } from "src/app/models";
import { GeolocationService, LocationService, ReportService, ToastService } from "src/app/services";

@Component({
  selector: 'app-report-map',
  templateUrl: './report-map.component.html',
  styleUrls: ['./report-map.component.scss'],
  standalone: true,
})
export class ReportMapComponent implements OnInit {
  private map!: GoogleMap;
  private locations: Location[] = [];

  constructor(
    private geolocationService: GeolocationService,
    private reportService: ReportService,
    private locationService: LocationService,
    private toastService: ToastService,
  ) { }

  async ngOnInit() {
    this.locationService.getAll().then((result) => {
      this.locations = result.data as Location[];
    });

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
          zoom: 15,
          disableDefaultUI: true
        },
        forceCreate: true
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

  async addAllMarkers() {
    if (!this.map) {
      return;
    }

    for (const location of this.locations) {
      const report = (await this.reportService.getById(location.reportId)).data;
      await this.map.addMarker({
        coordinate: {
          lat: location.latitude,
          lng: location.longitude
        },
        title: report?.title,
        snippet: report?.description,
      });
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.destroy();
    }
  }
}
