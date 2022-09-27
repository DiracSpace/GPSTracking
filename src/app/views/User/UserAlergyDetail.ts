export class UserAlergyDetail {
    id: string;

    dateOfLastIncident?: Date;

    numberOfIncidents?: number;
    timesHospitalized?: number;

    name: string;

    isStillInEffect: boolean;
    isAlergyDeadly: boolean;
}
