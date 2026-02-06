import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncouragementService {
  private messages = [
    "Every task you finish becomes light.",
    "Progress is still progress.",
    "You are building momentum.",
    "Small steps create big changes.",
    "Your sky is getting brighter.",
    "One star at a time.",
    "You're doing great.",
    "Keep going, you've got this.",
    "Every completed task is a victory.",
    "You're making progress, one task at a time."
  ];

  private loadingMessages = [
    "Preparing your sky...",
    "Gathering the stars...",
    "Almost there...",
    "Loading your constellation...",
    "Setting up your orbit...",
    "Just a moment..."
  ];

  private emptyStateMessages = [
    "Every constellation starts with a single star.",
    "Your sky is ready for new possibilities.",
    "Take your time. Great things take shape gradually.",
    "This is your space to create something meaningful.",
    "Ready to begin? Your first step matters.",
    "A blank canvas holds infinite potential."
  ];

  getRandomEmptyStateMessage(): string {
    const randomIndex = Math.floor(Math.random() * this.emptyStateMessages.length);
    return this.emptyStateMessages[randomIndex];
  }

  getRandomMessage(): string {
    const randomIndex = Math.floor(Math.random() * this.messages.length);
    return this.messages[randomIndex];
  }

  getRandomLoadingMessage(): string {
    const randomIndex = Math.floor(Math.random() * this.loadingMessages.length);
    return this.loadingMessages[randomIndex];
  }

  getAllMessages(): string[] {
    return [...this.messages];
  }

  getMessageByIndex(index: number): string {
    return this.messages[index % this.messages.length];
  }
}
