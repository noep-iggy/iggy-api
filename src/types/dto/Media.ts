export enum MediaType {
  IMAGE = 'IMAGE',
  FILE = 'FILE',
}
export interface MediaDto {
  id: string;
  type: MediaType;
  filename: string;
  url: string;
  size: number;
}
