declare namespace api {
  type LoginRequestBody = {
    email: string;
    password: string;
  };
  
  type SignupRequestBody = {
    name: string;
    email: string;
    password: string;
  };
}