let workbenchTutorialBlocking = false;

export function setWorkbenchTutorialBlocking(blocking: boolean): void {
  workbenchTutorialBlocking = blocking;
}

export function isWorkbenchTutorialBlocking(): boolean {
  return workbenchTutorialBlocking;
}
