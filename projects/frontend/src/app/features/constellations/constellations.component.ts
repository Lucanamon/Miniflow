import { Component, signal, effect, inject } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormsModule } from '@angular/forms';
import { EncouragementService } from '../../core/services/encouragement.service';
import { StorageService } from '../../core/services/storage.service';

interface Board {
  id: number;
  name: string;
  description: string;
  taskCount: number;
  color: string;
}

const STORAGE_KEY_BOARDS = 'miniflow_boards';

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

  // Load boards from storage on init, fallback to defaults
  boards = signal<Board[]>(
    this.storage.get<Board[]>(STORAGE_KEY_BOARDS) ?? [
      { id: 1, name: 'Work Projects', description: 'Professional tasks and projects', taskCount: 8, color: 'blue' },
      { id: 2, name: 'Personal Goals', description: 'Life goals and personal development', taskCount: 5, color: 'green' }
    ]
  );

  showCreateModal = signal(false);
  newBoardName = signal('');
  newBoardDescription = signal('');
  emptyStateMessage = signal('');

  constructor() {
    // Auto-save boards whenever they change
    effect(() => {
      this.storage.set(STORAGE_KEY_BOARDS, this.boards());
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

  editBoard(board: Board) {
    // TODO: Implement edit functionality
    console.log('Editing board:', board);
  }
}
