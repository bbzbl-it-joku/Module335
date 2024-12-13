import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(this.getStoredThemePreference());
  private prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    // Initialize theme on service creation
    this.setTheme(this.darkMode.value);

    // Listen for system theme changes
    this.prefersDark.addEventListener('change', (e) => {
      if (localStorage.getItem('darkMode') === null) {
        // Only auto-switch if user hasn't set a preference
        this.setTheme(e.matches);
      }
    });
  }

  private getStoredThemePreference(): boolean {
    const storedPreference = localStorage.getItem('darkMode');
    if (storedPreference !== null) {
      return storedPreference === 'true';
    }
    return this.prefersDark.matches;
  }

  isDarkMode(): boolean {
    return this.darkMode.value;
  }

  getDarkMode$() {
    return this.darkMode.asObservable();
  }

  toggleDarkMode() {
    this.setTheme(!this.darkMode.value);
  }

  setTheme(isDark: boolean) {
    // Update state
    this.darkMode.next(isDark);

    // Save preference
    localStorage.setItem('darkMode', isDark.toString());

    // Update document classes - using Ionic's preferred method
    document.documentElement.classList.toggle('ion-palette-light', !isDark);
  }
}
