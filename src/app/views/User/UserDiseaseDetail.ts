export class UserDiseaseDetail {
    id: string;
    
    dateOfLastIncident?: Date;

    numberOfIncidents?: number;
    timesHospitalized?: number;

    name: string;

    isStillInEffect: boolean;
    isDiseaseDeadly: boolean;
}
