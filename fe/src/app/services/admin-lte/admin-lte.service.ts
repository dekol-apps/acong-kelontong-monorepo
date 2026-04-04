import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

type AdminLteModule = typeof import('admin-lte/dist/js/adminlte.js');

@Injectable({
  providedIn: 'root'
})
export class AdminLteService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private initialized = false;
  private modulePromise?: Promise<AdminLteModule>;
  private moduleLoaded = false;
  private loadScheduled = false;

  init(): void {
    if (!isPlatformBrowser(this.platformId) || this.initialized) {
      return;
    }

    this.initialized = true;
    this.scheduleLoadWhenReady();

    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
      this.scheduleLoadWhenReady();
    });
  }

  private scheduleLoadWhenReady(): void {
    if (this.loadScheduled || this.moduleLoaded) {
      return;
    }

    this.loadScheduled = true;
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        this.loadScheduled = false;
        void this.loadAdminLteIfNeeded();
      });
    });
  }

  private async loadAdminLteIfNeeded(): Promise<void> {
    if (this.moduleLoaded) {
      return;
    }

    const hasAdminLteControls = document.querySelector(
      '[data-lte-toggle]'
    );

    if (!hasAdminLteControls) {
      return;
    }

    await this.loadAdminLte();
    this.moduleLoaded = true;
  }

  private loadAdminLte(): Promise<AdminLteModule> {
    if (!this.modulePromise) {
      this.modulePromise = import('admin-lte/dist/js/adminlte.js');
    }

    return this.modulePromise;
  }
}