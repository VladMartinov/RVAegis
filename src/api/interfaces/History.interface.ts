export interface HistoryRecordDto {
  dateAction: string;             // ISO date-time
  typeActionId: number;
  userId: number;
}

export interface TypeActionDto {
  actionId: number;
  actionDescription: string;
}