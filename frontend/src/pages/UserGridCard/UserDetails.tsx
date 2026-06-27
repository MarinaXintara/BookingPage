const response = await fetch("https://8080/api/users");
const data = await response.json();

const users = data as unknown as {
  results: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    phoneNumber : string;
    tin: string;
    picture: { large: string };
  }[];
};
export default users;

