import { Component, signal } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormsModule } from '@angular/forms';
import { EncouragementService } from '../../core/services/encouragement.service';

interface Board {
  id: number;
  name: string;
  description: string;
  taskCount: number;
  color: string;
}

@Component({
  selector: 'app-constellations',
  standalone: true,
  imports: [ButtonComponent, CardComponent, FormsModule],
  templateUrl: './constellations.component.html',
  styleUrl: './constellations.component.scss'
})
export class ConstellationsComponent {
  boards = signal<Board[]>([
    { id: 1, name: 'Work Projects', description: 'Professional tasks and projects', taskCount: 8, color: 'blue' },
    { id: 2, name: 'Personal Goals', description: 'Life goals and personal development', taskCount: 5, color: 'green' }
  ]);

  showCreateModal = signal(false);
  newBoardName = signal('');
  newBoardDescription = signal('');
  emptyStateMessage = signal('');

  constructor(private encouragementService: EncouragementService) {
    this.emptyStateMessage.set(this.encouragementService.getRandomEmptyStateMessage());
  }

  createBoard() {
    if (this.newBoardName().trim()) {
      const newBoard: Board = {
        id: this.boards().length + 1,
        name: this.newBoardName(),
        description: this.newBoardDescription(),
        taskCount: 0,
        color: 'blue'
      };
      this.boards.update(boards => [...boards, newBoard]);
      this.newBoardName.set('');
      this.newBoardDescription.set('');
      this.showCreateModal.set(false);
    }
  }

  deleteBoard(id: number) {
    this.boards.update(boards => boards.filter(board => board.id !== id));
  }

  editBoard(board: Board) {
    // TODO: Implement edit functionality
    console.log('Editing board:', board);
  }
}
