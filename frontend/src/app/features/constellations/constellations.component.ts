import { Component, signal, effect, inject, computed } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormsModule } from '@angular/forms';
import { EncouragementService } from '../../core/services/encouragement.service';
import { StorageService } from '../../core/services/storage.service';
import { ActivityService } from '../../core/services/activity.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

interface Board {
  id: string;
  name: string;
  description: string;
  taskCount: number;
  color: string;
}

const STORAGE_KEY_PREFIX = 'miniflow_boards';

@Component({
  selector: 'app-constellations',
  standalone: true,
  imports: [ButtonComponent, CardComponent, FormsModule],
  templateUrl: './constellations.component.html',
  styleUrl: './constellations.component.scss'
})
export class ConstellationsComponent {
  private storage = inject(StorageService);
  private encouragementService = inject(EncouragementService);
  private activityService = inject(ActivityService);
  private authService = inject(AuthService);
  private api = inject(ApiService);

  private storageKey = computed(() => {
    const user = this.authService.getUser();
    const suffix = user?.id ?? 'anonymous';
    return `${STORAGE_KEY_PREFIX}_${suffix}`;
  });

  boards = signal<Board[]>([]);

  showCreateModal = signal(false);
  newBoardName = signal('');
  newBoardDescription = signal('');
  showEditModal = signal(false);
  editingBoard = signal<Board | null>(null);
  editBoardName = signal('');
  editBoardDescription = signal('');
  emptyStateMessage = signal('');

  constructor() {
    effect(() => {
      this.storageKey();
      this.loadBoards();
    });

    effect(() => {
      this.storage.set(this.storageKey(), this.boards());
    });

    this.emptyStateMessage.set(this.encouragementService.getRandomEmptyStateMessage());
  }

  private loadBoards(): void {
    if (this.authService.isLoggedIn()) {
      const fromStorage = this.storage.get<Board[]>(this.storageKey()) ?? [];
      this.api.getBoards().subscribe({
        next: (apiBoards) => {
          const fromApi = this.apiBoardsToBoards(apiBoards);
          this.boards.set(this.mergeBoards(fromApi, fromStorage));
        },
        error: () => this.boards.set(fromStorage.length > 0 ? fromStorage : [])
      });
    } else {
      const stored = this.storage.get<Board[]>(this.storageKey());
      this.boards.set(stored ?? []);
    }
  }

  /** Merge API boards with storage so locally created boards stay visible after refresh if API was empty */
  private mergeBoards(apiBoards: Board[], storageBoards: Board[]): Board[] {
    const byId = new Map(apiBoards.map(b => [b.id, b]));
    for (const b of storageBoards) {
      if (!byId.has(b.id)) byId.set(b.id, b);
    }
    return Array.from(byId.values());
  }

  private apiBoardsToBoards(apiBoards: { id: string; name: string; description?: string | null; color: string }[]): Board[] {
    return apiBoards.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description ?? '',
      taskCount: 0,
      color: b.color ?? 'blue'
    }));
  }

  createBoard(): void {
    const name = this.newBoardName().trim();
    if (!name) return;

    if (this.authService.isLoggedIn()) {
      this.api.createBoard({ name, description: this.newBoardDescription() || undefined, color: 'blue' }).subscribe({
        next: (created) => {
          this.boards.update(boards => [...boards, this.apiBoardsToBoards([created])[0]]);
          this.activityService.logBoardUpdated(name);
          this.newBoardName.set('');
          this.newBoardDescription.set('');
          this.showCreateModal.set(false);
        },
        error: () => {
          const newBoard: Board = { id: String(Date.now()), name, description: this.newBoardDescription(), taskCount: 0, color: 'blue' };
          this.boards.update(boards => [...boards, newBoard]);
          this.newBoardName.set('');
          this.newBoardDescription.set('');
          this.showCreateModal.set(false);
        }
      });
    } else {
      const newBoard: Board = { id: String(Date.now()), name, description: this.newBoardDescription(), taskCount: 0, color: 'blue' };
      this.boards.update(boards => [...boards, newBoard]);
      this.newBoardName.set('');
      this.newBoardDescription.set('');
      this.showCreateModal.set(false);
    }
  }

  deleteBoard(id: string): void {
    if (this.authService.isLoggedIn()) {
      this.api.deleteBoard(id).subscribe({
        next: () => this.boards.update(boards => boards.filter(b => b.id !== id)),
        error: () => this.boards.update(boards => boards.filter(b => b.id !== id))
      });
    } else {
      this.boards.update(boards => boards.filter(b => b.id !== id));
    }
  }

  openEditBoard(board: Board): void {
    this.editingBoard.set(board);
    this.editBoardName.set(board.name);
    this.editBoardDescription.set(board.description);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingBoard.set(null);
    this.editBoardName.set('');
    this.editBoardDescription.set('');
  }

  saveEditBoard(): void {
    const board = this.editingBoard();
    const name = this.editBoardName().trim();
    if (!board || !name) return;

    if (this.authService.isLoggedIn()) {
      this.api.updateBoard(board.id, { name, description: this.editBoardDescription() }).subscribe({
        next: () => {
          this.boards.update(boards =>
            boards.map(b => (b.id === board.id ? { ...b, name, description: this.editBoardDescription() } : b))
          );
          this.activityService.logBoardUpdated(name);
          this.closeEditModal();
        },
        error: () => this.closeEditModal()
      });
    } else {
      this.boards.update(boards =>
        boards.map(b => (b.id === board.id ? { ...b, name, description: this.editBoardDescription() } : b))
      );
      this.activityService.logBoardUpdated(name);
      this.closeEditModal();
    }
  }
}
