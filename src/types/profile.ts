export interface UserProfile {
  personal: {
    firstName: string; middleName?: string; lastName: string;
    email: string; phone: string; phoneCountryCode?: string;
    dateOfBirth?: string; gender?: string;
    address: { line1?: string; line2?: string; city?: string; state?: string; postalCode?: string; country?: string };
    links: { linkedin?: string; portfolio?: string; github?: string };
    currentCtc?: string; expectedCtc?: string; noticePeriod?: string; totalExperienceYears?: string;
    currentLocation?: string; preferredLocation?: string; totalExperienceMonths?: string; salaryCurrency?: string;
  };
  education: {
    tenth?: { schoolName: string; board: string; yearOfPassing: string; percentage: string };
    twelfth?: { schoolName: string; board: string; stream?: string; yearOfPassing: string; percentage: string };
    graduation?: { institution: string; university?: string; degree: string; specialization?: string; yearOfPassing: string; grade: string };
    postGraduation?: { institution: string; university?: string; degree: string; specialization?: string; yearOfPassing: string; grade: string };
    doctorate?: Record<string, string>;
    diploma?: Record<string, string>;
  };
  workExperience: Array<{
    companyName: string; jobTitle: string; startDate: string; endDate?: string;
    currentlyWorking: boolean; description?: string; employmentType?: string;
  }>;
  skills: string[];
  documents: { resumeFileName?: string; coverLetterFileName?: string };
}
