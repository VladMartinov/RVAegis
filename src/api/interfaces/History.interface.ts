export interface HistoryRecordDto {
  dateAction: string;             // ISO date-time
  typeActionId: number;
  userId: number;
}

export interface RecognitionLogDto {
  imageData: string;
  label: string;
  recognitionTime: string;        // ISO date-time
  cameraIndex: number;
}

export interface TypeActionDto {
  actionId: number;
  actionDescription: string;
}