import { Component, input, HostBinding } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-constellation-node',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './constellation-node.component.html',
  styleUrl: './constellation-node.component.scss'
})
export class ConstellationNodeComponent {
  /** Node label (e.g. "Tasks", "Streak") */
  label = input<string>('');
  /** Route to navigate on click (empty = center, no navigation) */
  route = input<string | null>(null);
  /** 'center' = living heart with breathing glow; 'default' = satellite node */
  variant = input<'default' | 'center'>('default');
  /** Angle for radial layout (degrees, 0 = top) */
  angle = input<number>(0);
  /** Distance from center (CSS units) */
  distance = input<string>('0');
  /** Accent color variant for cosmic variety */
  accent = input<'aurora' | 'teal' | 'violet' | 'gold'>('aurora');

  @HostBinding('style.--node-angle') get nodeAngle() {
    return `${this.angle()}deg`;
  }
  @HostBinding('style.--node-distance') get nodeDistance() {
    return this.distance();
  }
  /** Gradient center toward diagram center (orange expands from center) */
  @HostBinding('style.--gradient-center-x') get gradientCenterX() {
    const a = (this.angle() * Math.PI) / 180;
    return `${50 - 50 * Math.sin(a)}%`;
  }
  @HostBinding('style.--gradient-center-y') get gradientCenterY() {
    const a = (this.angle() * Math.PI) / 180;
    return `${50 + 50 * Math.cos(a)}%`;
  }

  isCenter = () => this.variant() === 'center';
  isLink = () => !!this.route();
}
