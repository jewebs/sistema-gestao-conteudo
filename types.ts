
export enum Priority {
  Alta = 'Alta',
  Media = 'Média',
  Baixa = 'Baixa',
}

export enum Status {
  Pendente = 'Pendente',
  EmAndamento = 'Em andamento',
  Pausado = 'Pausado',
  Concluido = 'Concluído',
}

export enum GmbStatus {
  Publicado = 'Publicado',
  Pendente = 'Pendente',
  NA = 'N/A',
}

export interface CanvaAssets {
  folderUrl: string;
  folderDescription: string;
  creationDate: string; // ISO String
}

export interface WebsitePost {
  postTitle: string;
  postUrl: string;
  postDate: string; // ISO String
}

export interface GmbSubtask {
  postDate: string | null; // ISO String
  status: GmbStatus;
}

export interface Task {
  taskId: string;
  taskName: string;
  projectId: string;
  client: string;
  startDate: string; // ISO String
  endDate: string; // ISO String
  priority: Priority;
  status: Status;
  canvaAssets: CanvaAssets;
  websitePost: WebsitePost;
  gmbSubtask: GmbSubtask;
}
