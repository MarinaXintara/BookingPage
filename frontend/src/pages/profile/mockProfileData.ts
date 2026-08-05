import type { CurrentUser } from "../../Auth/Authentication";

export interface ProfileDetails {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
}

// Temporary frontend data until the current-user API returns profile details.
const mockContactDetails: Record<number, Pick<ProfileDetails, "phoneNumber" | "address">> = {
  1: { phoneNumber: "+30 210 000 0001", address: "1 Admin Street, Athens" },
  2: { phoneNumber: "+30 210 000 0002", address: "25 Event Avenue, Athens" },
  3: { phoneNumber: "+30 210 000 0003", address: "9 Ermou Street, Athens" },
  4: { phoneNumber: "+30 210 000 0004", address: "14 Tsimiski Street, Thessaloniki" },
};

const demoProfileChanges = new Map<number, ProfileDetails>();

export function getMockProfileDetails(user: CurrentUser): ProfileDetails {
  const savedDetails = demoProfileChanges.get(user.id);
  if (savedDetails) return savedDetails;

  const contactDetails = mockContactDetails[user.id] ?? {
    phoneNumber: "",
    address: "",
  };

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    ...contactDetails,
  };
}

export function saveMockProfileDetails(userId: number, details: ProfileDetails) {
  demoProfileChanges.set(userId, details);
}
