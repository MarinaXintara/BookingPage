
 type Role = "admin" | "organiser" | "user" | "guest";
 
   //Creating a user type
 interface User {
   id: string;
   firstName: string;
   lastName: string;
   email:string
   password: string;
   phoneNumber: string;
   address: string;
   TIN: string;
   role: Role;           //Their assigned role
   isActive: boolean;     //Account status
 }

   //Authorization decorator
 function requireRole(allowedRoles: Role[]) {
   return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
     const method = descriptor.value;
    
     descriptor.value = function (...args: any[]) {
       const user: User = this.currentUser;   //Get current user
      
       if (!allowedRoles.includes(user.role)) {
         throw new Error(` Access denied. Required roles: ${allowedRoles.join(', ')}`);
       }
      
       return method.apply(this, args);
     };
   };
 }