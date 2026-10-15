import {
  Component,
  signal,
  computed,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface MapLabel {
  id: string;
  title: string;
  note: string;
  lat: number;
  lng: number;
}

export interface ClassItem {
  id: string;
  title: string;
  coach: string;
  day: number;
  start: string;
  end: string;
  place: string;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  kind: 'clase' | 'lugar' | 'aviso';
}

@Component({
  selector: 'app-deportes',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './deportes.html',
  styleUrl: './deportes.css',
})
export class Deportes implements AfterViewInit, OnDestroy {
  @ViewChild('mapHost', { static: true }) mapHost!: ElementRef<HTMLDivElement>;

  private map?: any;
  private markersLayer?: any;
  private L: any;

  readonly days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  readonly mapCenter: [number, number] = [-2.18533, -80.00132];

  labels = signal<MapLabel[]>([
    {
      id: '1',
      title: 'Cancha principal',
      note: 'Fútbol lunes y jueves',
      lat: -2.1859,
      lng: -79.9247,
    },
    {
      id: '2',
      title: 'Gimnasio Kennedy',
      note: 'Pesas y tenis',
      lat: -2.1684,
      lng: -79.8991,
    },
    {
      id: '3',
      title: 'Parque Samanes',
      note: 'Running grupal',
      lat: -2.1039,
      lng: -79.9014,
    },
  ]);

  classes = signal<ClassItem[]>([
    {
      id: 'c1',
      title: 'Fútbol técnico',
      coach: 'Andrés M.',
      day: 1,
      start: '16:00',
      end: '17:30',
      place: 'Cancha principal',
    },
    {
      id: 'c2',
      title: 'Tenis',
      coach: 'Lucía V.',
      day: 2,
      start: '18:00',
      end: '19:15',
      place: 'Gimnasio Kennedy',
    },
    {
      id: 'c3',
      title: 'Running',
      coach: 'Mateo R.',
      day: 3,
      start: '06:30',
      end: '07:30',
      place: 'Parque Samanes',
    },
  ]);

  notices = signal<Notice[]>([
    {
      id: 'n1',
      title: 'Cancha 2 reservada',
      body: 'El lunes el fútbol se mueve a la cancha auxiliar.',
      at: new Date().toISOString(),
      read: false,
      kind: 'clase',
    },
    {
      id: 'n2',
      title: 'Nuevo punto en el mapa',
      body: 'Se etiquetó el gimnasio como punto de encuentro.',
      at: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      kind: 'lugar',
    },
  ]);

  selectedDay = signal(new Date().getDay());
  selectedLabelId = signal<string | null>('1');
  labelMode = signal(false);

  draftTitle = '';
  draftNote = '';
  draftLat = 0;
  draftLng = 0;
  showLabelForm = signal(false);

  classTitle = '';
  classCoach = '';
  classDay = 1;
  classStart = '16:00';
  classEnd = '17:00';
  classPlace = '';
  showClassForm = signal(false);

  selectedLabel = computed(
    () => this.labels().find((l) => l.id === this.selectedLabelId()) ?? null
  );

  dayClasses = computed(() =>
    this.classes()
      .filter((c) => c.day === this.selectedDay())
      .sort((a, b) => a.start.localeCompare(b.start))
  );

  unreadCount = computed(() => this.notices().filter((n) => !n.read).length);

  async ngAfterViewInit(): Promise<void> {
    if (typeof window === 'undefined') return;

    const leaflet = await import('leaflet');
    this.L = leaflet.default ?? leaflet;
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    const L = this.L;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    this.map = L.map(this.mapHost.nativeElement, {
      center: this.mapCenter,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.renderMarkers();

    this.map.on('click', (e: any) => {
      if (!this.labelMode()) return;
      this.draftLat = e.latlng.lat;
      this.draftLng = e.latlng.lng;
      this.draftTitle = '';
      this.draftNote = '';
      this.showLabelForm.set(true);
    });
  }

  private renderMarkers(): void {
    if (!this.markersLayer || !this.map || !this.L) return;

    const L = this.L;
    this.markersLayer.clearLayers();

    for (const label of this.labels()) {
      const marker = L.marker([label.lat, label.lng], {
        title: label.title,
      });

      marker.bindTooltip(label.title, {
        permanent: true,
        direction: 'top',
        offset: [0, -12],
        className: 'map-tooltip',
      });

      marker.on('click', (ev: any) => {
        L.DomEvent.stopPropagation(ev);
        this.selectedLabelId.set(label.id);
        this.map?.flyTo([label.lat, label.lng], Math.max(this.map.getZoom(), 14));
        this.renderMarkers();
      });

      marker.addTo(this.markersLayer);
    }
  }

  toggleLabelMode(): void {
    this.labelMode.update((v) => !v);
    if (this.map) {
      this.map.getContainer().style.cursor = this.labelMode() ? 'crosshair' : '';
    }
  }

  saveLabel(): void {
    if (!this.draftTitle.trim()) return;

    const id = crypto.randomUUID();
    const title = this.draftTitle.trim();

    this.labels.update((list) => [
      ...list,
      {
        id,
        title,
        note: this.draftNote.trim(),
        lat: this.draftLat,
        lng: this.draftLng,
      },
    ]);

    this.notices.update((list) => [
      {
        id: crypto.randomUUID(),
        title: `Nueva etiqueta: ${title}`,
        body: 'Se marcó un lugar en el mapa de deportes.',
        at: new Date().toISOString(),
        read: false,
        kind: 'lugar',
      },
      ...list,
    ]);

    this.selectedLabelId.set(id);
    this.showLabelForm.set(false);
    this.labelMode.set(false);
    if (this.map) this.map.getContainer().style.cursor = '';
    this.renderMarkers();
    this.map?.flyTo([this.draftLat, this.draftLng], 15);
  }

  removeLabel(id: string): void {
    this.labels.update((list) => list.filter((l) => l.id !== id));
    if (this.selectedLabelId() === id) this.selectedLabelId.set(null);
    this.renderMarkers();
  }

  saveClass(): void {
    if (!this.classTitle.trim()) return;

    this.classes.update((list) => [
      ...list,
      {
        id: crypto.randomUUID(),
        title: this.classTitle.trim(),
        coach: this.classCoach.trim() || 'Sin coach',
        day: Number(this.classDay),
        start: this.classStart,
        end: this.classEnd,
        place: this.classPlace.trim() || 'Por definir',
      },
    ]);

    this.notices.update((list) => [
      {
        id: crypto.randomUUID(),
        title: `Clase agregada: ${this.classTitle.trim()}`,
        body: `${this.days[Number(this.classDay)]} ${this.classStart}–${this.classEnd}`,
        at: new Date().toISOString(),
        read: false,
        kind: 'clase',
      },
      ...list,
    ]);

    this.showClassForm.set(false);
    this.classTitle = '';
    this.classCoach = '';
    this.classPlace = '';
  }

  removeClass(id: string): void {
    this.classes.update((list) => list.filter((c) => c.id !== id));
  }

  markRead(id: string): void {
    this.notices.update((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  markAllRead(): void {
    this.notices.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'hace un momento';
    if (h < 24) return `hace ${h} h`;
    return `hace ${Math.floor(h / 24)} d`;
  }
}