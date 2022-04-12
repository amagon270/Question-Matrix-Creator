declare namespace auth {
  type DecodedAuthToken = {
    userId: number;
    username: string;
    exp: number;
  };

  type loginRequestBody = {
    username: string;
    password: string;
  }

  type signupRequestBody = {
    username: string;
    password: string;
  }
};