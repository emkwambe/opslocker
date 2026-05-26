export type LifecycleState = "active" | "trial" | "at_risk" | "deprecated" | "archived";
export type ResourceCategory = "database"|"api"|"domain"|"cloud"|"auth"|"ci_cd"|"analytics"|"communication"|"storage"|"monitoring"|"subscription"|"other";
export type RelationshipType = "depends_on"|"bills_through"|"authenticates_with"|"sends_through"|"deploys_to"|"integrates_with";
export type ReminderSeverity = "critical"|"high"|"medium"|"low";
export type Environment = "development"|"staging"|"production"|"all";
export type ExportFormat = "json"|"csv"|"sqlite";