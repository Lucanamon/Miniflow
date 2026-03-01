import { Component, signal, effect, inject, computed } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormsModule } from '@angular/forms';
import { EncouragementService } from '../../core/services/encouragement.service';
import { StorageService } from '../../core/services/storage.service';
import { ActivityService } from '../../core/services/activity.service';
import { AuthService } from '../../core/services/auth.service';

interface Board {
  id: number;
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

  /** Per-user storage key so each user only sees their own boards */
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
    // Load boards for the current user when user (storage key) changes
    effect(() => {
      const key = this.storageKey();
      const stored = this.storage.get<Board[]>(key);
      this.boards.set(stored ?? []);
    });

    // Persist boards to the current user's key whenever boards change (depend only on boards so we don't write old data to new user's key on login)
    effect(() => {
      this.storage.set(this.storageKey(), this.boards());
    });

    this.emptyStateMessage.set(this.encouragementService.getRandomEmptyStateMessage());
  }

  createBoard() {
    if (this.newBoardName().trim()) {
      const newBoard: Board = {
        id: Date.now(), // Use timestamp for unique IDs
        name: this.newBoardName(),
        description: this.newBoardDescription(),
        taskCount: 0,
        color: 'blue'
      };
      this.boards.update(boards => [...boards, newBoard]);
      // Auto-saved by effect()
      this.newBoardName.set('');
      this.newBoardDescription.set('');
      this.showCreateModal.set(false);
    }
  }

  deleteBoard(id: number) {
    this.boards.update(boards => boards.filter(board => board.id !== id));
    // Auto-saved by effect()
  }

  openEditBoard(board: Board) {
    this.editingBoard.set(board);
    this.editBoardName.set(board.name);
    this.editBoardDescription.set(board.description);
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingBoard.set(null);
    this.editBoardName.set('');
    this.editBoardDescription.set('');
  }

  saveEditBoard() {
    const board = this.editingBoard();
    const name = this.editBoardName().trim();
    if (!board || !name) return;
    this.boards.update(boards =>
      boards.map(b =>
        b.id === board.id
          ? { ...b, name, description: this.editBoardDescription() }
          : b
      )
    );
    // Log board update activity
    this.activityService.logBoardUpdated(name);
    this.closeEditModal();
  }
}
