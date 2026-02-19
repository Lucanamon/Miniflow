import { Component } from '@angular/core';
import { ConstellationNodeComponent } from '../constellation-node/constellation-node.component';

export type NodeTier = 'primary' | 'secondary' | 'passive';

export interface ConstellationNodeConfig {
  label: string;
  route: string | null;
  angle: number;
  accent: 'aurora' | 'teal' | 'violet' | 'gold';
  tier: NodeTier;
}

@Component({
  selector: 'app-constellation-map',
  standalone: true,
  imports: [ConstellationNodeComponent],
  templateUrl: './constellation-map.component.html',
  styleUrl: './constellation-map.component.scss'
})
export class ConstellationMapComponent {
  /** Radius from center to satellite nodes (CSS) */
  readonly orbitRadius = '180px';

  readonly coreGlowIntensity = 1;

  /** Static star dust positions (max 8) for ambient background */
  readonly starDust = [
    { id: 1, x: 15, y: 20, delay: 0, duration: 28 },
    { id: 2, x: 85, y: 25, delay: 4, duration: 32 },
    { id: 3, x: 45, y: 45, delay: 8, duration: 24 },
    { id: 4, x: 75, y: 70, delay: 2, duration: 36 },
    { id: 5, x: 20, y: 75, delay: 6, duration: 30 },
    { id: 6, x: 55, y: 15, delay: 10, duration: 26 },
    { id: 7, x: 90, y: 55, delay: 3, duration: 34 },
    { id: 8, x: 30, y: 50, delay: 7, duration: 22 }
  ];

  /** Satellite nodes: angles flipped horizontally (mirrored across vertical axis). */
  readonly satelliteNodes: ConstellationNodeConfig[] = [
    { label: 'Today', route: '/today', angle: 0, accent: 'teal', tier: 'primary' },
    { label: 'My Note', route: '/constellations', angle: 258, accent: 'violet', tier: 'primary' },
    { label: 'Settings', route: '/settings', angle: 102, accent: 'aurora', tier: 'secondary' }
  ];
}
