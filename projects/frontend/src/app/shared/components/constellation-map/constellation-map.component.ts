import { Component } from '@angular/core';
import { ConstellationNodeComponent } from '../constellation-node/constellation-node.component';

export interface ConstellationNodeConfig {
  label: string;
  route: string | null;
  angle: number;
  accent: 'aurora' | 'teal' | 'violet' | 'gold';
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

  readonly satelliteNodes: ConstellationNodeConfig[] = [
    { label: 'Daily Sky', route: '/today', angle: 60, accent: 'aurora' },
    { label: 'Orbit', route: '/today', angle: 102, accent: 'teal' },
    { label: 'Streak', route: '/sky', angle: 213, accent: 'gold' },
    { label: 'Constellations', route: '/constellations', angle: 0, accent: 'violet' },
    { label: 'Reflection', route: '/reflection', angle: 147, accent: 'teal' },
    { label: 'Activity', route: '/sky', angle: 258, accent: 'aurora' },
    { label: 'Progress', route: '/sky', angle: 300, accent: 'gold' }
  ];
}
